export class UpdateVariantDto {
  id?: string;     // if present, update; if absent, create
  size!: string;
  sku!: string;
  stockQty!: number;
}

export class UpdateProductDto {
  title?: string;
  description?: string;
  brand?: string;
  color?: string;
  priceMrp?: number;
  priceSale?: number;
  images?: string[];
  active?: boolean;
  // If you send this array, we'll replace existing variants with these
  variants?: UpdateVariantDto[];
}
