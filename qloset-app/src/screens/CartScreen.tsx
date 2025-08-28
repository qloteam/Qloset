import * as React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useCart } from '../state/CartContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

export default function CartScreen() {
  const { items, total, clear } = useCart();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => `${i.productId}:${i.variantId}`}
        ListEmptyComponent={<Text>Your cart is empty.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Text>{item.size} × {item.qty}</Text>
            <Text>₹{item.price * item.qty}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={{ fontSize: 16, fontWeight: '700' }}>Total: ₹{total}</Text>
        <TouchableOpacity
          style={styles.cta}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Checkout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={clear} style={{ marginTop: 12 }}>
        <Text>Clear cart</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  title: { flex: 1, fontWeight: '600' },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cta: { backgroundColor: '#111', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 }
});
