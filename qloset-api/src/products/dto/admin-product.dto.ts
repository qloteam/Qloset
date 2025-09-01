import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AdminVariantDto {
  @IsOptional() @IsString() id?: string;          // present when editing
  @IsString() size!: string;
  @IsString() sku!: string;
  @IsInt() @Min(0) stockQty!: number;
}

export class AdminProductDto {
  @IsString() title!: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() color?: string;

  @IsInt() priceMrp!: number;
  @IsInt() priceSale!: number;

  @IsArray() images!: string[];                    // array of urls
  @IsBoolean() active!: boolean;

  @IsArray() variants!: AdminVariantDto[];
}
