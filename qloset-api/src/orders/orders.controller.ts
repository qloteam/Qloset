import { Controller, Get, Param, Post, Body, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';

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

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list() {
    return this.ordersService.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.ordersService.get(id);
  }

  @Post()
  create(@Body() body: CreateOrderBody) {
    return this.ordersService.create(body);
  }

  // Mark order as confirmed (payment success or TBYB accepted)
  @Patch(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.ordersService.confirm(id);
  }

  // Cancel order (user/ops) -> immediately frees reservations
  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.ordersService.cancel(id);
  }
}
