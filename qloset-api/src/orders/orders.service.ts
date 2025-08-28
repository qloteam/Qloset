import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { isInsideServiceArea } from '../geo/service-area'; // polygon check helper

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async list() {
    return this.prisma.order.findMany({ include: { items: true } });
  }

  async get(id: string) {
    return this.prisma.order.findUnique({ where: { id }, include: { items: true } });
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

  async create(body: {
    userPhone?: string;
    tbyb?: boolean;
    address: {
      name: string; phone: string; line1: string; landmark?: string; pincode: string;
      lat?: number | null; lng?: number | null;
    };
    items: { variantId: string; qty: number }[];
  }) {
    if (!body.items?.length) throw new BadRequestException('No items');
    if (!body.address) throw new BadRequestException('Address required');

    const { pincode, lat, lng } = body.address;

    // Prefer polygon geofence; fallback to pincode
    const haveCoords =
      typeof lat === 'number' && !Number.isNaN(lat) &&
      typeof lng === 'number' && !Number.isNaN(lng);

    try {
      if (haveCoords) {
        const inside = isInsideServiceArea(lat!, lng!);
        if (!inside) throw new BadRequestException('Sorry, this address is outside our service area.');
      } else {
        if (!pincode) throw new BadRequestException('Address pincode required');
        this.ensurePincodeAllowed(pincode);
      }
    } catch {
      // Any error from geojson parsing/etc ⇒ return a clean 400
      throw new BadRequestException('Sorry, this address is outside our service area.');
    }

    // Reservation expiry
    const holdMinutes = 45;
    const expiresAt = new Date(Date.now() + holdMinutes * 60_000);

    const variantIds = body.items.map((i) => i.variantId);

    // All critical steps in ONE transaction:
    const created = await this.prisma.$transaction(async (tx) => {
      // Load variants with product price
      const variants = await tx.variant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true },
      });
      const vmap = new Map(variants.map((v) => [v.id, v]));

      // Build order items & subtotal
      let subtotal = 0;
      const orderItems = body.items.map((i) => {
        const v = vmap.get(i.variantId);
        if (!v) throw new BadRequestException('Invalid variant in cart');
        const price = v.product.priceSale;
        subtotal += price * i.qty;
        return { variantId: i.variantId, qty: i.qty, price };
      });

      // Atomically decrement stock (prevents oversell)
      for (const it of body.items) {
        const res = await tx.variant.updateMany({
          where: { id: it.variantId, stockQty: { gte: it.qty } },
          data: { stockQty: { decrement: it.qty } },
        });
        if (res.count !== 1) throw new BadRequestException('Insufficient stock for one or more items');
      }

      // Minimal user
      const user = await tx.user.upsert({
        where: { phone: body.userPhone ?? 'guest' },
        update: {},
        create: { phone: body.userPhone ?? 'guest' },
      });

      // Save address
      const addr = await tx.address.create({
        data: {
          userId: user.id,
          line1: body.address.line1,
          line2: '',
          landmark: body.address.landmark || '',
          pincode: pincode?.trim() ?? '',
          lat: haveCoords ? lat! : null,
          lng: haveCoords ? lng! : null,
        },
      });

      // Create order with status = PENDING
      const order = await tx.order.create({
        data: {
          userId: user.id,
          addressId: addr.id,
          subtotal,
          tbyb: !!body.tbyb,
          status: 'PENDING',
          items: { create: orderItems },
        },
        include: { items: true },
      });

      // Create reservations
      await tx.stockReservation.createMany({
        data: orderItems.map((i) => ({
          orderId: order.id,
          variantId: i.variantId,
          qty: i.qty,
          expiresAt,
        })),
      });

      return order;
    });

    return { ok: true, orderId: created.id, subtotal: created.subtotal, status: created.status };
  }

  async confirm(id: string) {
    // Keep stock reduced; just clear reservations and mark confirmed
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.update({ where: { id }, data: { status: 'CONFIRMED' } });
      await tx.stockReservation.deleteMany({ where: { orderId: id } });
      return { ok: true, orderId: id, status: order.status };
    });
  }

  async cancel(id: string) {
    // Return stock, clear reservations, mark cancelled
    return this.prisma.$transaction(async (tx) => {
      const res = await tx.stockReservation.findMany({ where: { orderId: id } });

      for (const r of res) {
        await tx.variant.update({
          where: { id: r.variantId },
          data: { stockQty: { increment: r.qty } },
        });
      }

      await tx.stockReservation.deleteMany({ where: { orderId: id } });
      await tx.order.update({ where: { id }, data: { status: 'CANCELLED' } });

      return { ok: true, orderId: id, status: 'CANCELLED' };
    });
  }
}
