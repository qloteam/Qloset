'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getProduct, setProductStock, adjustProductStock } from '@/lib/api';

type Props = { productId: string; initialStock?: number };

export default function StockEditor({ productId, initialStock = 0 }: Props) {
  const router = useRouter();
  const [stock, setStock] = React.useState<number>(initialStock);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // On mount, pull latest (in case initialStock is stale)
  React.useEffect(() => {
    (async () => {
      try {
        const p: any = await getProduct(productId);
        if (typeof p?.stock === 'number') setStock(p.stock);
      } catch (_) {}
    })();
  }, [productId]);

  async function applyDelta(delta: number) {
    setError(null);
    setLoading(true);
    try {
      const next: any = await adjustProductStock(productId, delta);
      if (typeof next?.stock === 'number') setStock(next.stock);
      router.refresh?.();
    } catch (e: any) {
      setError(e?.message || 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  }

  async function applySet() {
    setError(null);
    setLoading(true);
    try {
      const next: any = await setProductStock(productId, Math.max(0, Number(stock) || 0));
      if (typeof next?.stock === 'number') setStock(next.stock);
      router.refresh?.();
    } catch (e: any) {
      setError(e?.message || 'Failed to set stock');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded-xl p-4 space-y-3">
      <div className="text-sm text-gray-600">Inventory</div>

      <div className="flex items-center gap-3">
        <span className="text-2xl font-semibold">{stock}</span>
        <span className="text-gray-500">in stock</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => applyDelta(-10)}
          className="border rounded-lg px-3 py-1 hover:bg-gray-50"
          disabled={loading}
        >-10</button>
        <button
          onClick={() => applyDelta(-5)}
          className="border rounded-lg px-3 py-1 hover:bg-gray-50"
          disabled={loading}
        >-5</button>
        <button
          onClick={() => applyDelta(-1)}
          className="border rounded-lg px-3 py-1 hover:bg-gray-50"
          disabled={loading}
        >-1</button>
        <button
          onClick={() => applyDelta(+1)}
          className="border rounded-lg px-3 py-1 hover:bg-gray-50"
          disabled={loading}
        >+1</button>
        <button
          onClick={() => applyDelta(+5)}
          className="border rounded-lg px-3 py-1 hover:bg-gray-50"
          disabled={loading}
        >+5</button>
        <button
          onClick={() => applyDelta(+10)}
          className="border rounded-lg px-3 py-1 hover:bg-gray-50"
          disabled={loading}
        >+10</button>
      </div>

      <div className="flex items-center gap-2">
        <input
          className="border rounded-lg px-3 py-2 w-28"
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(Math.max(0, Number(e.target.value) || 0))}
        />
        <button
          onClick={applySet}
          className="border rounded-lg px-3 py-2 hover:bg-gray-50"
          disabled={loading}
        >
          Set exact
        </button>
      </div>

      {error && <div className="text-sm text-rose-600">{error}</div>}
      {loading && <div className="text-sm text-gray-500">Saving…</div>}
      <div className="text-xs text-gray-500">
        Tip: negative buttons decrease stock, positive increase. Never goes below 0.
      </div>
    </div>
  );
}
