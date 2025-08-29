import * as React from 'react';
import type { RootStackParamList } from '../../App';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TopHeader from '../components/TopHeader';
import ProductCard from '../components/ProductCard';
import { API_BASE } from '../lib/api';

type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Product = {
  id: string;
  title: string;
  priceSale: number;
  images?: string[];
};

export default function HomeScreen() {
  const nav = useNavigation<HomeNav>();
  const [items, setItems] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      // noop UI (you can add a toast)
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.screen}>
      <TopHeader subtitle="Try-before-you-buy in T. Nagar / Pondy Bazaar" />
      <FlatList
        contentContainerStyle={styles.listPad}
        data={items}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <ProductCard
              id={item.id}
              title={item.title}
              price={item.priceSale}
              image={item.images?.[0] ?? null}
              onPress={() => nav.navigate('Product', { id: item.id })}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fafafa' },
  listPad: { padding: 16, gap: 12 },
});
