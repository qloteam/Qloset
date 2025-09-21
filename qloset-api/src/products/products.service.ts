import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AdminProductDto } from './dto/admin-product.dto';
import slugify from 'slugify';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ---------- Public ----------
  async findAll(search?: string) {
    return this.prisma.product.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { brand: { contains: search, mode: 'insensitive' } },
              { color: { contains: search, mode: 'insensitive' } },
            ],
            active: true,
          }
        : { active: true },
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
    if (!product || !product.active) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  // ---------- Admin ----------
  async adminList(search?: string) {
    return this.prisma.product.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { brand: { contains: search, mode: 'insensitive' } },
              { color: { contains: search, mode: 'insensitive' } },
              { slug: { contains: slugify(search, { lower: true }), mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async adminGet(id: string) {
    const p = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async adminCreate(dto: CreateProductDto) {
    const { variants = [], ...rest } = dto;
    const slug = slugify(dto.title, { lower: true, strict: true });

    return this.prisma.product.create({
      data: {
        ...rest,
        slug,
        active: dto.active ?? true,
        variants: variants.length
          ? {
              create: variants.map((v) => ({
                size: v.size,
                sku: v.sku,
                stockQty: v.stockQty,
              })),
            }
          : undefined,
      },
      include: { variants: true },
    });
  }

  async adminUpdate(id: string, dto: UpdateProductDto) {
    const { variants, ...rest } = dto;

    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const data: any = { ...rest };

    if (dto.title && dto.title !== product.title) {
      data.slug = slugify(dto.title, { lower: true, strict: true });
    }

    return this.prisma.$transaction(async (tx) => {
      if (variants) {
        await tx.variant.deleteMany({ where: { productId: id } });
        await tx.variant.createMany({
          data: variants.map((v) => ({
            productId: id,
            size: v.size,
            sku: v.sku,
            stockQty: v.stockQty,
          })),
        });
      }

      const updated = await tx.product.update({
        where: { id },
        data,
        include: { variants: true },
      });

      return updated;
    });
  }

  async adminDelete(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { active: false },
      include: { variants: true },
    });
  }

  /** Set total product stock by adjusting variant stockQtys. */
  async adminSetTotalStock(productId: string, target: number) {
    if (!Number.isInteger(target) || target < 0) {
      throw new Error('stock must be a non-negative integer');
    }

    const variants = await this.prisma.variant.findMany({
      where: { productId },
      orderBy: { id: 'asc' },
      select: { id: true, stockQty: true },
    });

    if (variants.length === 0) {
      await this.prisma.variant.create({
        data: {
          productId,
          size: 'Default',
          sku: `${productId}-default`,
          stockQty: target,
        },
      });
      return { stock: target };
    }

    const current = variants.reduce((s, v) => s + (v.stockQty ?? 0), 0);
    const delta = target - current;
    if (delta === 0) return { stock: target };

    await this.prisma.$transaction(async (tx) => {
      if (delta > 0) {
        const v0 = variants[0];
        await tx.variant.update({
          where: { id: v0.id },
          data: { stockQty: v0.stockQty + delta },
        });
      } else {
        let remaining = -delta;
        for (const v of variants) {
          if (remaining <= 0) break;
          const take = Math.min(v.stockQty, remaining);
          if (take > 0) {
            await tx.variant.update({
              where: { id: v.id },
              data: { stockQty: v.stockQty - take },
            });
            remaining -= take;
          }
        }
      }
    });

    return { stock: target };
  }

  // ---------- NEW ----------
  async addImage(productId: string, url: string) {
    // Push the new image URL into the Product.images array
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        images: {
          push: url,
        },
      },
    });
  }
}
