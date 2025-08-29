import * as React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../state/CartContext';
import Button from '../components/ui/Button';

export default function CartScreen() {
  const { items, total, clear } = useCart();
  const nav = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Your cart</Text>

      <FlatList
        data={items}
        keyExtractor={(i) => `${i.productId}:${i.variantId}`}
        ListEmptyComponent={<Text style={{ color: '#666' }}>Your cart is empty.</Text>}
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.meta}>{item.size} × {item.qty}</Text>
            </View>
            <Text style={styles.price}>₹{item.price * item.qty}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Total: ₹{total}</Text>
        <Button title="Checkout" onPress={() => nav.navigate('Checkout')} />
      </View>

      <TouchableOpacity onPress={clear} style={{ marginTop: 12 }}>
        <Text style={{ color: '#555' }}>Clear cart</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fafafa' },
  h1: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  row: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: { fontWeight: '700' },
  meta: { color: '#666', marginTop: 2 },
  price: { fontWeight: '700' },
  footer: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12, marginTop: 12, gap: 12 },
  total: { fontSize: 16, fontWeight: '800' },
});
