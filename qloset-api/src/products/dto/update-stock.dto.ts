import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateStockDto {
  // Use this for +1 / -1 / +5 etc.
  @IsOptional()
  @IsInt()
  delta?: number;

  // Use this for "Set exact"
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}
