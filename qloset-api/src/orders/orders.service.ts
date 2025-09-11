// src/orders/orders.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma, OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';

type CreateOrderItemDto = {
  variantId: string;
  qty: number;
};

type CreateOrderDto = {
  userId: string;
  addressId: string;
  items: CreateOrderItemDto[];
  subtotal?: number;
  fees?: number;
  discount?: number;
  tax?: number;
  tbyb?: boolean;
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new order safely (race-condition proof)
   */
  async create(data: CreateOrderDto) {
    if (!data.items?.length) {
      throw new BadRequestException('No items in order');
    }

    return this.prisma.$transaction(
      async (tx) => {
        // Load all variants with product info for pricing
        const variantIds = [...new Set(data.items.map((i) => i.variantId))];
        const variants = await tx.variant.findMany({
          where: { id: { in: variantIds } },
          include: { product: true },
        });
        const byId = new Map(variants.map((v) => [v.id, v]));

        // Prepare items
        const itemCreates = data.items.map((i) => {
          const v = byId.get(i.variantId);
          if (!v) throw new BadRequestException(`Invalid variant: ${i.variantId}`);
          if (i.qty <= 0) throw new BadRequestException(`Invalid qty for ${i.variantId}`);
          const price =
            (v.product as any)?.priceSale ?? (v.product as any)?.priceMrp ?? 0;
          return { variantId: i.variantId, qty: i.qty, price };
        });

        // --- Atomic stock decrement ---
        for (const line of itemCreates) {
          const res = await tx.variant.updateMany({
            where: { id: line.variantId, stockQty: { gte: line.qty } },
            data: { stockQty: { decrement: line.qty } },
          });
          if (res.count === 0) {
            throw new ConflictException(`Out of stock: ${line.variantId}`);
          }
        }

        // Totals
        const subtotal =
          data.subtotal ??
          itemCreates.reduce((sum, it) => sum + it.price * it.qty, 0);
        const fees = data.fees ?? 0;
        const discount = data.discount ?? 0;
        const tax = data.tax ?? 0;
        const tbyb = data.tbyb ?? false;

        // Create order
        const order = await tx.order.create({
          data: {
            userId: data.userId,
            addressId: data.addressId,
            items: { create: itemCreates },
            subtotal,
            fees,
            discount,
            tax,
            status: OrderStatus.PENDING,
            tbyb,
          },
          include: {
            items: { include: { variant: true } },
            user: true,
            address: true,
          },
        });

        return order;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  }

  async listAll() {
    return this.prisma.order.findMany({
      include: {
        user: true,
        address: true,
        items: { include: { variant: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        address: true,
        items: { include: { variant: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async confirm(id: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CONFIRMED },
      include: {
        user: true,
        address: true,
        items: { include: { variant: true } },
      },
    });
  }

  async cancel(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const old = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!old) throw new NotFoundException('Order not found');
      if (old.status === 'CANCELLED') return old;

      for (const it of old.items) {
        await tx.variant.update({
          where: { id: it.variantId },
          data: { stockQty: { increment: it.qty } },
        });
      }

      return tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
        include: {
          user: true,
          address: true,
          items: { include: { variant: true } },
        },
      });
    });
  }

  async assignCourier(id: string, courierId: string) {
    return this.prisma.order.update({
      where: { id },
      data: { courierId },
      include: {
        user: true,
        address: true,
        items: { include: { variant: true } },
      },
    });
  }

  async listForCourier(courierId: string) {
    return this.prisma.order.findMany({
      where: { courierId },
      include: {
        user: true,
        address: true,
        items: { include: { variant: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        address: true,
        items: { include: { variant: true } },
      },
    });
  }
}
