'use client';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/ProductForm';
import { createProduct } from '@/lib/api';

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New product</h1>
      <ProductForm
        onSubmit={async (payload) => {
          await createProduct(payload);
          router.push('/products');
        }}
      />
    </div>
  );
}
