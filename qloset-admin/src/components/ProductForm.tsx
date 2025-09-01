'use client';
import { useState } from 'react';
import type { Variant, Product } from '@/lib/api';

type Props = {
  initial?: Partial<Product>;
  onSubmit: (payload: Omit<Product, 'id'>) => Promise<void>;
};

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
  const [variants, setVariants] = useState<Variant[]>(
    initial?.variants ?? [{ size: 'S', sku: '', stockQty: 0 }]
  );
  const [saving, setSaving] = useState(false);

  const addVariant = () => setVariants(v => [...v, { size: '', sku: '', stockQty: 0 }]);
  const removeVariant = (idx: number) => setVariants(v => v.filter((_, i) => i !== idx));

  async function submit() {
    setSaving(true);
    try {
      await onSubmit({
        title,
        slug,
        description,
        brand,
        color,
        priceMrp: Number(priceMrp),
        priceSale: Number(priceSale),
        images: images.split(',').map(s => s.trim()).filter(Boolean),
        active,
        variants: variants.map(v => ({
          id: v.id, size: v.size, sku: v.sku, stockQty: Number(v.stockQty),
        })),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span>Title</span>
          <input className="border p-2 rounded" value={title} onChange={e=>setTitle(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span>Slug (optional)</span>
          <input className="border p-2 rounded" value={slug} onChange={e=>setSlug(e.target.value)} />
        </label>
        <label className="col-span-2 flex flex-col gap-1">
          <span>Description</span>
          <textarea className="border p-2 rounded" value={description} onChange={e=>setDescription(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span>Brand</span>
          <input className="border p-2 rounded" value={brand} onChange={e=>setBrand(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span>Color</span>
          <input className="border p-2 rounded" value={color} onChange={e=>setColor(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span>MRP (₹)</span>
          <input type="number" className="border p-2 rounded" value={priceMrp} onChange={e=>setPriceMrp(+e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span>Sale (₹)</span>
          <input type="number" className="border p-2 rounded" value={priceSale} onChange={e=>setPriceSale(+e.target.value)} />
        </label>
        <label className="col-span-2 flex flex-col gap-1">
          <span>Images (comma separated URLs)</span>
          <input className="border p-2 rounded" value={images} onChange={e=>setImages(e.target.value)} />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)} />
          <span>Active</span>
        </label>
      </div>

      <div className="border rounded p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Variants</h3>
          <button type="button" className="px-3 py-1 bg-gray-100 rounded" onClick={addVariant}>+ Add</button>
        </div>
        <div className="space-y-2">
          {variants.map((v, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-2 items-end">
              <label className="flex flex-col gap-1">
                <span>Size</span>
                <input className="border p-2 rounded" value={v.size} onChange={e=>{
                  const val = e.target.value; setVariants(list => list.map((vv,i)=>i===idx?{...vv,size:val}:vv));
                }} />
              </label>
              <label className="flex flex-col gap-1">
                <span>SKU</span>
                <input className="border p-2 rounded" value={v.sku} onChange={e=>{
                  const val = e.target.value; setVariants(list => list.map((vv,i)=>i===idx?{...vv,sku:val}:vv));
                }} />
              </label>
              <label className="flex flex-col gap-1">
                <span>Stock</span>
                <input type="number" className="border p-2 rounded" value={v.stockQty}
                  onChange={e=>{
                    const val = Number(e.target.value);
                    setVariants(list => list.map((vv,i)=>i===idx?{...vv,stockQty:val}:vv));
                  }} />
              </label>
              <button type="button" className="px-3 py-2 bg-red-50 text-red-600 rounded" onClick={()=>removeVariant(idx)}>Remove</button>
            </div>
          ))}
        </div>
      </div>

      <button disabled={saving} onClick={submit}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-60">
        {saving ? 'Saving…' : 'Save Product'}
      </button>
    </div>
  );
}
