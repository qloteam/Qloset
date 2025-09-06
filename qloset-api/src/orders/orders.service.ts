// src/orders/orders.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
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
   * Create a new order (PENDING)
   * - Validates variants & stock
   * - Computes item price from product (priceSale ?? priceMrp)
   * - Uses scalar style (addressId, userId, variantId)
   * - Decrements stock within the same transaction
   */
  async create(data: CreateOrderDto) {
  if (!data.items?.length) {
    throw new BadRequestException('No items in order');
  }

  // Load all variants in one go (with product for price)
  const variantIds = [...new Set(data.items.map((i) => i.variantId))];
  const variants = await this.prisma.variant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));

  // Validate and prepare nested item creates
  for (const i of data.items) {
    const v = byId.get(i.variantId);
    if (!v) throw new BadRequestException(`Invalid variant: ${i.variantId}`);
    if (i.qty <= 0) throw new BadRequestException(`Invalid qty for ${i.variantId}`);
    if (v.stockQty < i.qty) {
      throw new BadRequestException(
        `Insufficient stock for ${v.sku ?? v.id} (have ${v.stockQty}, need ${i.qty})`,
      );
    }
  }

  const itemCreates = data.items.map((i) => {
    const v = byId.get(i.variantId)!;
    const price =
      (v.product as any)?.priceSale ?? (v.product as any)?.priceMrp ?? 0;

    return {
      variantId: i.variantId,
      qty: i.qty,
      price,
    };
  });

  // --- NEW: ensure subtotal is always a number ---
  const computedSubtotal = itemCreates.reduce((sum, it) => sum + it.price * it.qty, 0);
  const subtotal = data.subtotal ?? computedSubtotal;
  const fees = data.fees ?? 0;
  const discount = data.discount ?? 0;
  const tax = data.tax ?? 0;
  const tbyb = data.tbyb ?? false;

  // Create order + decrement stock atomically
  const [order] = await this.prisma.$transaction([
    this.prisma.order.create({
      data: {
        userId: data.userId,
        addressId: data.addressId,
        items: { create: itemCreates },
        subtotal,             // <-- guaranteed number now
        fees,
        discount,
        tax,
        status: OrderStatus.PENDING, // (optional) enum instead of string
        tbyb,
      },
      include: {
        items: { include: { variant: true } },
        user: true,
        address: true,
      },
    }),

    // Decrement stock for each line item
    ...data.items.map((i) =>
      this.prisma.variant.update({
        where: { id: i.variantId },
        data: { stockQty: { decrement: i.qty } },
      }),
    ),
  ]);

  return order;
}

  /**
   * Admin: list all orders
   */
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

  /**
   * Get single order (admin/user)
   */
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

  /**
   * Mark order CONFIRMED (no stock changes here; they were done on create)
   */
  async confirm(id: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: {
        user: true,
        address: true,
        items: { include: { variant: true } },
      },
    });
    return order;
  }

  /**
   * Cancel order and restock items if not already cancelled.
   * (If you only want to restock when cancelling from PENDING,
   * change the predicate below from `old.status !== 'CANCELLED'` to `old.status === 'PENDING'`.)
   */
  async cancel(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const old = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!old) throw new NotFoundException('Order not found');
      if (old.status === 'CANCELLED') return old;

      // Restock for each line item
      for (const it of old.items) {
        await tx.variant.update({
          where: { id: it.variantId },
          data: { stockQty: { increment: it.qty } },
        });
      }

      const updated = await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          user: true,
          address: true,
          items: { include: { variant: true } },
        },
      });

      return updated;
    });
  }

  /**
   * Assign a courier to an order
   */
  async assignCourier(id: string, courierId: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: { courierId },
      include: {
        user: true,
        address: true,
        items: { include: { variant: true } },
      },
    });
    return order;
  }

  /**
   * Courier: list my orders
   */
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

  /**
   * Generic status change (restricted by controller/roles)
   */
  async setStatus(id: string, status: OrderStatus) {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        address: true,
        items: { include: { variant: true } },
      },
    });
    return order;
  }
}
