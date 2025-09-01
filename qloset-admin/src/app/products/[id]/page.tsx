import { notFound, redirect } from 'next/navigation';
import ProductForm from '@/components/ProductForm';
import { deleteProduct, getProduct, updateProduct } from '@/lib/api';

type Props = { params: { id: string } };

export default async function EditProductPage({ params }: Props) {
  const product = await getProduct(params.id).catch(() => null);
  if (!product) notFound();

  async function onSubmit(payload: any) {
    'use server';
    await updateProduct(product!.id, payload);
    redirect('/products');
  }

  async function onDelete() {
    'use server';
    await deleteProduct(product!.id);
    redirect('/products');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit product</h1>
        <form action={onDelete}>
          <button className="px-3 py-2 rounded bg-red-600 text-white">Delete</button>
        </form>
      </div>

      <form action={onSubmit}>
        <ProductForm initial={product!} onSubmit={async()=>{}} />
        <div className="pt-4">
          <button className="px-4 py-2 rounded bg-black text-white">Save changes</button>
        </div>
      </form>
    </div>
  );
}
