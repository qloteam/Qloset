// qloset-api/src/orders/orders.controller.ts
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list() { return this.ordersService.list(); }

  @Get(':id')
  get(@Param('id') id: string) { return this.ordersService.get(id); }

  @Post()
  create(@Body() body: {
    userPhone?: string;
    tbyb?: boolean;
    address: { name: string; phone: string; line1: string; landmark?: string; pincode: string };
    items: { variantId: string; qty: number }[];
  }) {
    return this.ordersService.create(body);
  }
}
