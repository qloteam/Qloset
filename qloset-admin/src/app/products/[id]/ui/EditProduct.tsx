'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { del, put } from '@/lib/api';

type Variant = { id: string; size: string; sku: string; stockQty: number };
type Product = {
  id: string;
  title: string;
  description?: string | null;
  priceMrp: number;
  priceSale: number;
  gender?: 'Women' | 'Men' | 'Unisex';
  variants: Variant[];
  // NEW: product-level stock (safe even if backend didn't have it before; defaults to 0)
  stock?: number;
};

export default function EditProduct({ initial }: { initial: Product }) {
  const r = useRouter();

  // existing fields
  const [title, setTitle] = React.useState(initial.title);
  const [description, setDescription] = React.useState(initial.description ?? '');
  const [priceMrp, setPriceMrp] = React.useState(initial.priceMrp);
  const [priceSale, setPriceSale] = React.useState(initial.priceSale);
  const [gender, setGender] = React.useState<Product['gender']>(initial.gender ?? 'Women');

  // NEW: stock state (clamped to >= 0)
  const [stock, setStock] = React.useState<number>(
    typeof initial.stock === 'number' ? initial.stock : 0
  );

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [stockBusy, setStockBusy] = React.useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // admin write endpoint (partial update)
      await put(`/admin/products/${initial.id}`, {
        title,
        description: description || null,
        priceMrp: Number(priceMrp),
        priceSale: Number(priceSale),
        gender,
        // keep variants editing for later if you want
      });
      r.push('/products');
      r.refresh();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm('Delete this product?')) return;
    setSaving(true);
    setError(null);
    try {
      await del(`/admin/products/${initial.id}`);
      r.push('/products');
      r.refresh();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete');
    } finally {
      setSaving(false);
    }
  }

  // --- STOCK HELPERS (use existing PUT; works even if API only supports partial product update) ---
  async function updateStock(next: number) {
    const clamped = Math.max(0, Number.isFinite(next) ? Math.floor(next) : 0);
    setStockBusy(true);
    setError(null);
    try {
      await put(`/admin/products/${initial.id}`, { stock: clamped });
      setStock(clamped);
      // keep the list/detail in sync
      r.refresh();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update stock');
    } finally {
      setStockBusy(false);
    }
  }

  async function adjustStock(delta: number) {
    await updateStock((stock ?? 0) + delta);
  }

  async function setExactStock() {
    await updateStock(stock);
  }

  return (
    <form
      onSubmit={onSave}
      style={{ maxWidth: 640, margin: '24px auto', display: 'grid', gap: 12 }}
    >
      <h1>Edit product</h1>

      <label>
        <div>Title</div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input"
        />
      </label>

      <label>
        <div>Description</div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="textarea"
        />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <label>
          <div>MRP</div>
          <input
            type="number"
            value={priceMrp}
            onChange={(e) => setPriceMrp(Number(e.target.value))}
            required
            min={0}
            className="input"
          />
        </label>
        <label>
          <div>Sale price</div>
          <input
            type="number"
            value={priceSale}
            onChange={(e) => setPriceSale(Number(e.target.value))}
            required
            min={0}
            className="input"
          />
        </label>
      </div>

      <label>
        <div>Gender</div>
        <select
          value={gender ?? 'Women'}
          onChange={(e) => setGender(e.target.value as any)}
          className="input"
        >
          <option value="Women">Women</option>
          <option value="Men">Men</option>
          <option value="Unisex">Unisex</option>
        </select>
      </label>

      {/* ------- NEW: Inventory section ------- */}
      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 12,
          display: 'grid',
          gap: 8,
        }}
      >
        <div style={{ color: '#4b5563', fontSize: 14 }}>Inventory</div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 24, fontWeight: 600 }}>{stock}</span>
          <span style={{ color: '#6b7280' }}>in stock</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[-10, -5, -1, +1, +5, +10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => adjustStock(n)}
              disabled={stockBusy}
              className="btn"
              style={{ padding: '6px 12px' }}
            >
              {n > 0 ? `+${n}` : n}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            className="input"
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(Math.max(0, Number(e.target.value) || 0))}
            style={{ width: 120 }}
          />
          <button
            type="button"
            onClick={setExactStock}
            disabled={stockBusy}
            className="btn"
          >
            Set exact
          </button>
          {stockBusy && <span style={{ color: '#6b7280', fontSize: 12 }}>Saving…</span>}
        </div>
      </div>
      {/* ------- /Inventory section ------- */}

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" disabled={saving} className="btn">
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onDelete} disabled={saving} className="btn danger">
          Delete
        </button>
      </div>
    </form>
  );
}
