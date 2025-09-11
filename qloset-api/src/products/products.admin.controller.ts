import { Body, Controller, Delete, Get, Param, Patch, Post, Query, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@Query('search') search?: string) {
    return this.products.adminList(search);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const p: any = await this.products.adminGet(id);
    // add computed total stock for the Inventory panel
    const total = (p?.variants ?? []).reduce((sum: number, v: any) => sum + (v?.stockQty ?? 0), 0);
    return { ...p, stock: total };
  }

  @Post()
  create(@Body() body: CreateProductDto) {
    return this.products.adminCreate(body);
  }

  // Accept both normal product updates and `{ stock }` for Inventory box
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    if (Object.prototype.hasOwnProperty.call(body, 'stock')) {
      const val = Number(body.stock);
      if (!Number.isInteger(val) || val < 0) {
        throw new BadRequestException('stock must be a non-negative integer');
      }
      const { stock } = await this.products.adminSetTotalStock(id, val);
      return { stock };
    }
    // Fallback to the existing product update flow
    return this.products.adminUpdate(id, body as UpdateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.products.adminDelete(id);
  }
}
