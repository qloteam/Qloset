import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/orders/courier/courier1') // hardcoded courierId for now
      .then(res => res.json())
      .then(setOrders);
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={orders}
        keyExtractor={o => o.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderBottomWidth: 1 }}>
            <Text>Order: {item.id}</Text>
            <Text>Status: {item.status}</Text>
            <Button title="Mark Delivered" onPress={async () => {
              await fetch(`http://localhost:3000/orders/courier/${item.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'DELIVERED' })
              });
              setOrders(o => o.map(ord => ord.id === item.id ? { ...ord, status: 'DELIVERED' } : ord));
            }} />
          </View>
        )}
      />
    </View>
  );
}
