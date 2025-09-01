import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
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
  get(@Param('id') id: string) {
    return this.products.adminGet(id);
  }

  @Post()
  create(@Body() body: CreateProductDto) {
    return this.products.adminCreate(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.products.adminUpdate(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.products.adminDelete(id);
  }
}
