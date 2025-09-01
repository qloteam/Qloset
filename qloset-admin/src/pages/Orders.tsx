import React, { useEffect, useState } from 'react';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/orders/admin/all')
      .then(res => res.json())
      .then(setOrders);
  }, []);

  const confirm = async (id: string) => {
    await fetch(`http://localhost:3000/orders/admin/${id}/confirm`, { method: 'PATCH' });
    setOrders(o => o.map(order => order.id === id ? { ...order, status: 'CONFIRMED' } : order));
  };

  const cancel = async (id: string) => {
    await fetch(`http://localhost:3000/orders/admin/${id}/cancel`, { method: 'PATCH' });
    setOrders(o => o.map(order => order.id === id ? { ...order, status: 'CANCELLED' } : order));
  };

  return (
    <div>
      <h1>Orders</h1>
      <ul>
        {orders.map(o => (
          <li key={o.id}>
            {o.id} – {o.status}
            <button onClick={() => confirm(o.id)}>Confirm</button>
            <button onClick={() => cancel(o.id)}>Cancel</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
