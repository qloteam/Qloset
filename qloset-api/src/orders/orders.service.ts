// qloset-api/src/orders/orders.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
//import { isInsideServiceArea } from '../geo/service-area'; // ← polygon check helper

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
    return new Set(raw.split(',').map(s => s.trim()).filter(Boolean));
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
      name: string;
      phone: string;
      line1: string;
      landmark?: string;
      pincode: string;
      lat?: number | null;   // ← optional coords from app
      lng?: number | null;   // ← optional coords from app
    };
    items: { variantId: string; qty: number }[];
  }) {
    if (!body.items?.length) throw new BadRequestException('No items');
    if (!body.address) throw new BadRequestException('Address required');

    const { pincode, lat, lng } = body.address;

    // ---- Geofence: prefer polygon (lat/lng) if present, else pincode fallback
    let inside = false;
    const haveCoords =
      typeof lat === 'number' && !Number.isNaN(lat) &&
      typeof lng === 'number' && !Number.isNaN(lng);

    /*if (haveCoords) {
      inside = isInsideServiceArea(lat!, lng!);
      if (!inside) {
        throw new BadRequestException('Sorry, this address is outside our service area.');
      }
    } else {
      // No coords → use pincode gate (MVP fallback)
      if (!pincode) throw new BadRequestException('Address pincode required');
      this.ensurePincodeAllowed(pincode);
    }*/

    // ---- Load variants & compute totals
    const ids = body.items.map(i => i.variantId);
    const variants = await this.prisma.variant.findMany({
      where: { id: { in: ids } },
      include: { product: true }
    });
    const vmap = new Map(variants.map(v => [v.id, v]));
    let subtotal = 0;
    const orderItems = body.items.map(i => {
      const v = vmap.get(i.variantId);
      if (!v) throw new BadRequestException('Invalid variant in cart');
      const price = v.product.priceSale;
      subtotal += price * i.qty;
      return { variantId: i.variantId, qty: i.qty, price };
    });

    // ---- Minimal user record by phone (or 'guest')
    const user = await this.prisma.user.upsert({
      where: { phone: body.userPhone ?? 'guest' },
      update: {},
      create: { phone: body.userPhone ?? 'guest' },
    });

    // ---- Save address (one row per order in MVP)
    const addr = await this.prisma.address.create({
      data: {
        userId: user.id,
        line1: body.address.line1,
        line2: '', // extend later
        landmark: body.address.landmark || '',
        pincode: pincode?.trim() ?? '',
        lat: haveCoords ? lat! : null,
        lng: haveCoords ? lng! : null
      }
    });

    // ---- Create order
    const order = await this.prisma.order.create({
      data: {
        userId: user.id,
        addressId: addr.id,
        subtotal,
        tbyb: !!body.tbyb,
        items: { create: orderItems },
      },
      include: { items: true }
    });

    return { ok: true, orderId: order.id, subtotal };
  }
}
