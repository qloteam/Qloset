import Link from 'next/link';
import { listProducts } from '@/lib/api';

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/products/new" className="px-3 py-2 rounded bg-black text-white">+ New</Link>
      </div>

      <div className="border rounded divide-y">
        {products.map(p => (
          <div key={p.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-gray-500">{(p.variants?.length ?? 0)} variants • ₹{p.priceSale}</div>
            </div>
            <div className="flex gap-2">
              <Link href={`/products/${p.id}`} className="px-3 py-1 rounded border">Edit</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
