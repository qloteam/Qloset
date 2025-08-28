// qloset-app/src/screens/HomeScreen.tsx
import * as React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { fetchProducts } from '../lib/api';
import type { Product } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [data, setData] = React.useState<Product[] | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchProducts().then(setData).catch(e => setErr(String(e)));
  }, []);

  const go = (id: string) => {
    console.log('Go Product:', id);
    navigation.navigate('Product', { id });
  };

  if (err) return <View style={styles.container}><Text>Error: {err}</Text></View>;
  if (!data) return <View style={styles.container}><ActivityIndicator /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>New in T. Nagar</Text>
      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => go(item.id)}>
            {item.images?.[0] ? (
              <Image source={{ uri: item.images[0] }} style={styles.image} />
            ) : (
              <View style={styles.image} />
            )}
            <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
            <Text style={styles.price}>₹{item.priceSale}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  card: { flex: 1, margin: 8, backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 2 },
  image: { height: 140, backgroundColor: '#eee', borderRadius: 8, marginBottom: 8 },
  title: { fontSize: 14, fontWeight: '500' },
  price: { fontSize: 14, marginTop: 4 }
});
