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
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

type CreateOrderItemDto = { variantId: string; qty: number | string };
type CreateOrderDto = { addressId: string; items: CreateOrderItemDto[]; tbyb?: boolean };
type AssignCourierDto = { courierId: string };

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() body: CreateOrderDto) {
    const userId: string | undefined = req?.user?.id;
    if (!userId) throw new Error('Unauthenticated');

    const items = Array.isArray(body.items) ? body.items : [];
    const normalized = items
      .filter((i) => i && typeof i.variantId === 'string')
      .map((i) => ({
        variantId: i.variantId,
        qty: Math.max(1, Number(i.qty) || 1),
      }));

    return this.orders.create({
      userId,
      addressId: body.addressId,
      items: normalized,
      tbyb: !!body.tbyb,
    });
  }

  @Get()
  async listAll() {
    return this.orders.listAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.orders.getOne(id);
  }

  @Post(':id/confirm')
  async confirm(@Param('id') id: string) {
    return this.orders.confirm(id);
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.orders.cancel(id);
  }

  @Post(':id/assign-courier')
  async assignCourier(@Param('id') id: string, @Body() body: AssignCourierDto) {
    return this.orders.assignCourier(id, body.courierId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('courier/my')
  async listForCourier(@Req() req: any) {
    const courierId: string | undefined = req?.user?.id;
    if (!courierId) throw new Error('Unauthenticated');
    return this.orders.listForCourier(courierId);
  }
}
