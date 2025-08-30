import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrderStatus } from '@prisma/client';
import { isInsideServiceArea } from '../geo/service-area'; // polygon check helper
// put this near the top of the file
const OUTSIDE_MSG = 'Location not in serviceable region';

type CreateOrderBody = {
  userPhone?: string;
  tbyb?: boolean;
  address: {
    name: string;
    phone: string;
    line1: string;
    landmark?: string;
    pincode: string;
    lat?: number | null;
    lng?: number | null;
  };
  items: { variantId: string; qty: number }[];
};

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async list() {
    return this.prisma.order.findMany({ include: { items: true } });
  }

  async get(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  // Comma-separated list in .env, e.g. SERVICE_PINCODES=600017,600018
  private allowedPincodes(): Set<string> {
    const raw = process.env.SERVICE_PINCODES || '';
    return new Set(raw.split(',').map((s) => s.trim()).filter(Boolean));
  }

  private ensurePincodeAllowed(pincode?: string) {
    const allowed = this.allowedPincodes();
    const pin = (pincode || '').trim();
    if (!/^\d{6}$/.test(pin)) throw new BadRequestException('Invalid pincode');
    if (allowed.size && !allowed.has(pin)) {
      throw new BadRequestException('Sorry, this address is outside our service area.');
    }
  }

  async create(body: CreateOrderBody) {
    if (!body.items?.length) throw new BadRequestException('No items');
    if (!body.address) throw new BadRequestException('Address required');

    // ---- Geofence (polygon preferred, pincode fallback)
    const { pincode, lat, lng } = body.address;
    const haveCoords =
      typeof lat === 'number' &&
      !Number.isNaN(lat) &&
      typeof lng === 'number' &&
      !Number.isNaN(lng);

    if (haveCoords) {
      const inside = isInsideServiceArea(lat!, lng!);
      if (!inside) {
        throw new BadRequestException('Sorry, this address is outside our service area.');
      }
    } else {
      if (!pincode) throw new BadRequestException('Address pincode required');
      this.ensurePincodeAllowed(pincode);
    }

    // ---- Aggregate quantities by variant (handles duplicates in cart)
    const byVariant = new Map<string, number>();
    for (const it of body.items) {
      byVariant.set(it.variantId, (byVariant.get(it.variantId) || 0) + it.qty);
    }
    const variantIds = [...byVariant.keys()];

    // ---- Transaction: validate availability, create order, create reservations
    const result = await this.prisma.$transaction(async (tx) => {
      // Load variants with product for pricing
      const variants = await tx.variant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true },
      });
      const vmap = new Map(variants.map((v) => [v.id, v]));

      // Active reservations (not yet expired)
      const activeRes = await tx.stockReservation.groupBy({
        by: ['variantId'],
        where: {
          variantId: { in: variantIds },
          expiresAt: { gt: new Date() },
        },
        _sum: { qty: true },
      });
      const reservedMap = new Map(activeRes.map((r) => [r.variantId, r._sum.qty ?? 0]));

      // Availability check
      for (const [variantId, need] of byVariant) {
        const v = vmap.get(variantId);
        if (!v) throw new BadRequestException('Invalid variant in cart');
        const reserved = reservedMap.get(variantId) || 0;
        const available = v.stockQty - reserved;
        if (available < need) {
          throw new BadRequestException(`Only ${available} left for size ${v.size}`);
        }
      }

      // Minimal user record by phone (or 'guest')
      const user = await tx.user.upsert({
        where: { phone: body.userPhone ?? 'guest' },
        update: {},
        create: { phone: body.userPhone ?? 'guest' },
      });

      // Snapshot address
      const addr = await tx.address.create({
        data: {
          userId: user.id,
          line1: body.address.line1,
          line2: '',
          landmark: body.address.landmark || '',
          pincode: (pincode ?? '').trim(),
          lat: haveCoords ? lat! : null,
          lng: haveCoords ? lng! : null,
        },
      });

      // Compute totals
      let subtotal = 0;
      const orderItems = body.items.map((i) => {
        const v = vmap.get(i.variantId)!;
        const price = v.product.priceSale;
        subtotal += price * i.qty;
        return { variantId: i.variantId, qty: i.qty, price };
      });

      // Create order with items
      const order = await tx.order.create({
        data: {
          userId: user.id,
          addressId: addr.id,
          subtotal,
          tbyb: !!body.tbyb,
          items: { create: orderItems },
          // status & paymentStatus use schema defaults
        },
        include: { items: true },
      });

      // Create one reservation per variant for this order (unique on [orderId, variantId])
      const holdMs = 24 * 60 * 60 * 1000; // keep reserved for 24h (tweak if you want)
      const exp = new Date(Date.now() + holdMs);

      for (const [variantId, qty] of byVariant) {
        await tx.stockReservation.create({
          data: { orderId: order.id, variantId, qty, expiresAt: exp },
        });
      }

      return { orderId: order.id, subtotal };
    });

    return { ok: true, ...result };
  }

  // Mark order as confirmed (e.g., payment success or TBYB accepted)
  // - decrements Variant.stockQty
  // - deletes reservations for that order
  // - sets status = CONFIRMED
  async confirm(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) throw new BadRequestException('Order not found');

      if (order.status === OrderStatus.CONFIRMED) {
        return { ok: true, orderId: id };
      }

      // Decrement stock for each variant in the order
      for (const it of order.items) {
        await tx.variant.update({
          where: { id: it.variantId },
          data: { stockQty: { decrement: it.qty } },
        });
      }

      // Remove reservations for this order
      await tx.stockReservation.deleteMany({ where: { orderId: id } });

      // Update order status
      await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CONFIRMED },
      });

      return { ok: true, orderId: id };
    });
  }

  // Cancel order: set status + immediately free reservations
  async cancel(id: string) {
    await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });

    await this.prisma.stockReservation.deleteMany({
      where: { orderId: id },
    });

    return { ok: true, orderId: id };
  }
}
