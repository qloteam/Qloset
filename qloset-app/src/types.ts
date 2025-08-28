export type Variant = {
  id: string;
  size: string;
  sku: string;
  stockQty: number;
};

export type Product = {
  id: string;
  title: string;
  priceSale: number;
  images: string[];
  variants: Variant[];
};
