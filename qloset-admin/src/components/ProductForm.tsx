'use client';
import { useState } from 'react';
import type { Variant, Product } from '@/lib/api';

type Props = {
  initial?: Partial<Product>;
  onSubmit: (payload: Omit<Product, 'id'>) => Promise<void>;
};

// temp ids for newly added (unsaved) variants
const genTmpId = () => `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export default function ProductForm({ initial, onSubmit }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [brand, setBrand] = useState(initial?.brand ?? '');
  const [color, setColor] = useState(initial?.color ?? '');
  const [priceMrp, setPriceMrp] = useState(initial?.priceMrp ?? 0);
  const [priceSale, setPriceSale] = useState(initial?.priceSale ?? 0);
  const [images, setImages] = useState((initial?.images ?? []).join(','));
  const [active, setActive] = useState(initial?.active ?? true);

  // Keep state typed as Variant[] (your original logic),
  // but ensure any locally-created variant has an id (temp id).
  const [variants, setVariants] = useState<Variant[]>(
    initial?.variants ?? [{ id: genTmpId(), size: 'S', sku: '', stockQty: 0 }]
  );

  const [saving, setSaving] = useState(false);

  const addVariant = () =>
    setVariants((v) => [...v, { id: genTmpId(), size: '', sku: '', stockQty: 0 }]);

  const removeVariant = (idx: number) =>
    setVariants((v) => v.filter((_, i) => i !== idx));

  async function submit() {
    setSaving(true);
    try {
      const payload: Omit<Product, 'id'> = {
        title,
        slug,
        description,
        brand,
        color,
        priceMrp: Number(priceMrp),
        priceSale: Number(priceSale),
        images: images
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        active,
        // Keep your original mapping, but drop temp ids so the API
        // treats them as new variants.
        variants: variants.map((v) => {
          const base = {
            size: v.size,
            sku: v.sku,
            stockQty: Number.isFinite(v.stockQty) ? Math.max(0, Number(v.stockQty)) : 0,
          };
          return v.id && !v.id.startsWith('tmp_') ? { id: v.id, ...base } : base;
        }) as unknown as Variant[], // satisfies the existing onSubmit type
      };

      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span>Title</span>
          <input
            className="border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span>Slug (optional)</span>
          <input
            className="border p-2 rounded"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </label>
        <label className="col-span-2 flex flex-col gap-1">
          <span>Description</span>
          <textarea
            className="border p-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span>Brand</span>
          <input
            className="border p-2 rounded"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span>Color</span>
          <input
            className="border p-2 rounded"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span>MRP (₹)</span>
          <input
            type="number"
            className="border p-2 rounded"
            value={priceMrp}
            onChange={(e) => setPriceMrp(+e.target.value)}
            min={0}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span>Sale (₹)</span>
          <input
            type="number"
            className="border p-2 rounded"
            value={priceSale}
            onChange={(e) => setPriceSale(+e.target.value)}
            min={0}
          />
        </label>
        <label className="col-span-2 flex flex-col gap-1">
          <span>Images (comma separated URLs)</span>
          <input
            className="border p-2 rounded"
            value={images}
            onChange={(e) => setImages(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          <span>Active</span>
        </label>
      </div>

      <div className="border rounded p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Variants</h3>
          <button
            type="button"
            className="px-3 py-1 bg-gray-100 rounded"
            onClick={addVariant}
          >
            + Add
          </button>
        </div>
        <div className="space-y-2">
          {variants.map((v, idx) => (
            <div key={v.id ?? `new-${idx}`} className="grid grid-cols-4 gap-2 items-end">
              <label className="flex flex-col gap-1">
                <span>Size</span>
                <input
                  className="border p-2 rounded"
                  value={v.size}
                  onChange={(e) => {
                    const val = e.target.value;
                    setVariants((list) =>
                      list.map((vv, i) => (i === idx ? { ...vv, size: val } : vv))
                    );
                  }}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span>SKU</span>
                <input
                  className="border p-2 rounded"
                  value={v.sku}
                  onChange={(e) => {
                    const val = e.target.value;
                    setVariants((list) =>
                      list.map((vv, i) => (i === idx ? { ...vv, sku: val } : vv))
                    );
                  }}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span>Stock</span>
                <input
                  type="number"
                  className="border p-2 rounded"
                  value={v.stockQty}
                  min={0}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value) || 0);
                    setVariants((list) =>
                      list.map((vv, i) => (i === idx ? { ...vv, stockQty: val } : vv))
                    );
                  }}
                />
              </label>
              <button
                type="button"
                className="px-3 py-2 bg-red-50 text-red-600 rounded"
                onClick={() => removeVariant(idx)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        disabled={saving}
        onClick={submit}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save Product'}
      </button>
    </div>
  );
}
