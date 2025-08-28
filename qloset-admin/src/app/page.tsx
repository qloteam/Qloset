export default function Page() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Qloset Admin</h1>
      <p className="text-gray-600">Welcome. Use the navigation to manage products and orders.</p>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <a href="/products" className="rounded-xl border bg-white p-4 shadow-sm hover:shadow">Products</a>
        <a href="/orders" className="rounded-xl border bg-white p-4 shadow-sm hover:shadow">Orders</a>
      </div>
    </main>
  );
}
