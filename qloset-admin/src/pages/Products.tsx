import React, { useEffect, useState } from 'react';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map(p => (
          <li key={p.id}>
            {p.title} – ₹{p.priceSale}
          </li>
        ))}
      </ul>
    </div>
  );
}
