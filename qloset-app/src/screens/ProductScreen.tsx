import * as React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { fetchProduct } from '../lib/api';
import type { Product, Variant } from '../types';
import { useCart } from '../state/CartContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Product'>;
//hello
export default function ProductScreen({ route }: Props) {
  const { id } = route.params;
  const [data, setData] = React.useState<Product | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [sel, setSel] = React.useState<Variant | null>(null);
  const { add } = useCart();

  React.useEffect(() => {
    fetchProduct(id).then(p => { setData(p); setSel(p.variants?.[0] ?? null); }).catch(e => setErr(String(e)));
  }, [id]);

  if (err) return <View style={styles.container}><Text>Error: {err}</Text></View>;
  if (!data) return <View style={styles.container}><ActivityIndicator /></View>;

  return (
    <View style={styles.container}>
      {data.images?.[0] ? <Image source={{ uri: data.images[0] }} style={styles.image} /> : <View style={styles.image} />}
      <Text style={styles.title}>{data.title}</Text>
      <Text style={styles.price}>₹{data.priceSale}</Text>

      <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: '600' }}>Select size</Text>
      <FlatList
        horizontal
        data={data.variants}
        keyExtractor={(v) => v.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSel(item)} style={[styles.sizeBtn, sel?.id === item.id && styles.sizeBtnActive]}>
            <Text style={{ fontWeight: '600' }}>{item.size}</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
      />

      <TouchableOpacity
        style={styles.cta}
        onPress={() => { if (!sel) return Alert.alert('Pick a size'); add(data, sel!, 1); Alert.alert('Added to cart'); }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Add to cart</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  image: { height: 360, backgroundColor: '#eee', borderRadius: 12, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700' },
  price: { fontSize: 16, marginTop: 4 },
  sizeBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  sizeBtnActive: { borderColor: '#000' },
  cta: { marginTop: 16, backgroundColor: '#111', padding: 14, borderRadius: 12, alignItems: 'center' }
});
