export class VariantInputDto {
  size!: string;
  sku!: string;
  stockQty!: number;
}

export class CreateProductDto {
  title!: string;
  description?: string;
  brand?: string;
  color?: string;
  priceMrp!: number;
  priceSale!: number;
  images?: string[];
  active?: boolean;
  variants?: VariantInputDto[];
}
