import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';

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
  create(@Body() body: {
    userPhone?: string;
    tbyb?: boolean;
    address: {
      name: string; phone: string; line1: string; landmark?: string;
      pincode: string; lat?: number | null; lng?: number | null;
    };
    items: { variantId: string; qty: number }[];
  }) {
    return this.ordersService.create(body);
  }

  // mark order as confirmed (payment success or TBYB accepted)
  @Post(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.ordersService.confirm(id);
  }

  // cancel order (user/ops) -> returns stock
  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.ordersService.cancel(id);
  }
}
