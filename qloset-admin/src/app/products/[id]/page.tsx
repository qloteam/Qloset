import StockEditor from '@/components/StockEditor';
import ProductForm from '@/components/ProductForm';
import { getProduct, updateProduct, type Product } from '@/lib/api';

export default async function Page({ params }: { params: { id: string } }) {
  const product = (await getProduct(params.id)) as Product;

  async function save(payload: Omit<Product, 'id'>) {
    'use server';
    await updateProduct(params.id, payload);
  }

  return (
    <div className="p-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
      {/* Left: your existing form */}
      <div>
        <ProductForm initial={product} onSubmit={save} />
      </div>

      {/* Right: NEW Inventory panel for product-level stock */}
      <div className="space-y-4">
        <StockEditor productId={params.id} initialStock={(product as any).stock ?? 0} />
      </div>
    </div>
  );
}
