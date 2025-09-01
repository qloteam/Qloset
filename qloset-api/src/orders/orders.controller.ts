// src/orders/orders.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

/** DTOs kept extremely light; service computes amounts */
type CreateOrderItemDto = {
  variantId: string;
  qty: number | string; // allow string from client; we'll coerce
};

type CreateOrderDto = {
  addressId: string;
  items: CreateOrderItemDto[];
  tbyb?: boolean;
};

type AssignCourierDto = {
  courierId: string;
};

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  /**
   * Create order (customer)
   * Requires auth (req.user.id)
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() body: CreateOrderDto) {
    const userId: string | undefined = req?.user?.id;
    if (!userId) {
      // JwtAuthGuard should already block this, but keep a safe check
      throw new Error('Unauthenticated');
    }

    // Normalize and sanitize payload coming from client
    const items = Array.isArray(body.items) ? body.items : [];
    const normalized = items
      .filter((i) => i && typeof i.variantId === 'string')
      .map((i) => ({
        variantId: i.variantId,
        qty: Math.max(1, Number(i.qty) || 1),
      }));

    const input = {
      userId,
      addressId: body.addressId,
      items: normalized,
      tbyb: !!body.tbyb,
      // subtotal is computed in the service; no need to send it here
    };

    return this.orders.create(input);
  }

  /**
   * Admin: list all orders
   */
  @Get()
  async listAll() {
    return this.orders.listAll();
  }

  /**
   * Get single order by id
   */
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.orders.getOne(id); // <- FIX: use getOne (service method)
  }

  /**
   * Admin: confirm order
   */
  @Post(':id/confirm')
  async confirm(@Param('id') id: string) {
    return this.orders.confirm(id);
  }

  /**
   * Admin: cancel order
   */
  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.orders.cancel(id);
  }

  /**
   * Admin: assign a courier to an order
   */
  @Post(':id/assign-courier')
  async assignCourier(
    @Param('id') id: string,
    @Body() body: AssignCourierDto,
  ) {
    return this.orders.assignCourier(id, body.courierId);
  }

  /**
   * Courier: list my orders
   * Requires auth (req.user.id used as courierId)
   */
  @UseGuards(JwtAuthGuard)
  @Get('courier/my')
  async listForCourier(@Req() req: any) {
    const courierId: string | undefined = req?.user?.id;
    if (!courierId) {
      throw new Error('Unauthenticated');
    }
    return this.orders.listForCourier(courierId);
  }
}
