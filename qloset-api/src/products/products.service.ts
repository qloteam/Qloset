import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    return this.prisma.product.findMany({
      where: search ? { title: { contains: search, mode: 'insensitive' } } : {},
      include: { variants: true }
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({ where: { id }, include: { variants: true } });
  }
}
