import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../prisma.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, SupabaseAuthGuard],
})
export class OrdersModule {}
