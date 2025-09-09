'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getProduct, put } from '@/lib/api';

type Props = { productId: string; initialStock?: number };

export default function StockEditor({ productId, initialStock = 0 }: Props) {
  const router = useRouter();
  const [stock, setStock] = React.useState(initialStock);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // prove it's mounted
  React.useEffect(() => { /* console.log('StockEditor mounted'); */ }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const p: any = await getProduct(productId);
        if (typeof p?.stock === 'number') setStock(p.stock);
      } catch {/* ignore */}
    })();
  }, [productId]);

  async function updateStock(next: number) {
    const clamped = Math.max(0, Number.isFinite(next) ? Math.floor(next) : 0);
    setLoading(true);
    setError(null);
    try {
      await put(`/admin/products/${productId}`, { stock: clamped });
      setStock(clamped);
      router.refresh?.();
    } catch (e: any) {
      setError(e?.message || 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded-xl p-4 space-y-3">
      <div className="text-sm text-gray-600">Inventory</div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold">{stock}</span>
        <span className="text-gray-500">in stock</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {[-10, -5, -1, +1, +5, +10].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => updateStock(stock + n)}
            disabled={loading}
            className="border rounded-lg px-3 py-1 hover:bg-gray-50"
          >
            {n > 0 ? `+${n}` : n}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(Math.max(0, Number(e.target.value) || 0))}
          className="border rounded-lg px-3 py-2 w-28"
        />
        <button
          type="button"
          onClick={() => updateStock(stock)}
          disabled={loading}
          className="border rounded-lg px-3 py-2 hover:bg-gray-50"
        >
          Set exact
        </button>
      </div>

      {error && <div className="text-sm text-rose-600">{error}</div>}
      {loading && <div className="text-sm text-gray-500">Saving…</div>}
      <div className="text-xs text-gray-500">Never goes below 0.</div>
    </div>
  );
}
