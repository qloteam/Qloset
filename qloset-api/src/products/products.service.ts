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
    // If variants sent, we’ll replace all variants with the new set (simple & safe)
    const { variants, ...rest } = dto;

    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const data: any = { ...rest };

    // If the title changes, refresh the slug
    if (dto.title && dto.title !== product.title) {
      data.slug = slugify(dto.title, { lower: true, strict: true });
    }

    return this.prisma.$transaction(async (tx) => {
      if (variants) {
        // Remove existing and insert new (avoids SKU uniqueness clashes)
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
    // Soft delete by deactivating; comment the below and uncomment delete if you want hard delete.
    return this.prisma.product.update({
      where: { id },
      data: { active: false },
      include: { variants: true },
    });

    // HARD DELETE (optional)
    // return this.prisma.product.delete({ where: { id } });
  }

/** Set total product stock by adjusting variant stockQtys. Never goes below 0. */
async adminSetTotalStock(productId: string, target: number) {
  if (!Number.isInteger(target) || target < 0) {
    throw new Error('stock must be a non-negative integer');
  }

  // Load current variants
  const variants = await this.prisma.variant.findMany({
    where: { productId },
    orderBy: { id: 'asc' }, // stable order
    select: { id: true, stockQty: true },
  });

  // If no variants exist, create a default one
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

  // Transaction to apply changes
  await this.prisma.$transaction(async (tx) => {
    if (delta > 0) {
      // Add all extra units to the first variant (simple, predictable)
      const v0 = variants[0];
      await tx.variant.update({
        where: { id: v0.id },
        data: { stockQty: v0.stockQty + delta },
      });
    } else {
      // Remove units across variants left-to-right without going below 0
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
      // If remaining > 0 here, all variants hit 0 — target is smaller than possible; we already clamped to >=0 so it's fine.
    }
  });

  return { stock: target };
}

}
