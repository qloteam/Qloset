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
        ListEmptyComponent={<Text style={styles.empty}>Your cart is empty.</Text>}
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
        <Text style={styles.clear}>Clear cart</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#121216' }, // dark bg
  h1: { fontSize: 24, fontWeight: '800', marginBottom: 12, color: '#fff' }, // white text
  row: {
    backgroundColor: '#1E1E22', // dark card
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: { fontWeight: '700', color: '#fff' },
  meta: { color: '#aaa', marginTop: 2 },
  price: { fontWeight: '700', color: '#fff' },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#2A2A2F', // subtle dark border
    paddingTop: 12,
    marginTop: 12,
    gap: 12,
  },
  total: { fontSize: 16, fontWeight: '800', color: '#fff' },
  empty: { color: '#aaa' },
  clear: { color: '#aaa' },
});
