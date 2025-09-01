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
};

export default function EditProduct({ initial }: { initial: Product }) {
  const r = useRouter();
  const [title, setTitle] = React.useState(initial.title);
  const [description, setDescription] = React.useState(initial.description ?? '');
  const [priceMrp, setPriceMrp] = React.useState(initial.priceMrp);
  const [priceSale, setPriceSale] = React.useState(initial.priceSale);
  const [gender, setGender] = React.useState<Product['gender']>(initial.gender ?? 'Women');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // admin write endpoint
      await put(`/admin/products/${initial.id}`, {
        title,
        description: description || null,
        priceMrp: Number(priceMrp),
        priceSale: Number(priceSale),
        gender,
        // Optional: you can add variants editing later
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

  return (
    <form onSubmit={onSave} style={{ maxWidth: 640, margin: '24px auto', display: 'grid', gap: 12 }}>
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
        <select value={gender ?? 'Women'} onChange={(e) => setGender(e.target.value as any)} className="input">
          <option value="Women">Women</option>
          <option value="Men">Men</option>
          <option value="Unisex">Unisex</option>
        </select>
      </label>

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
