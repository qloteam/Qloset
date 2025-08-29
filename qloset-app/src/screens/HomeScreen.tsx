import * as React from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Chip from '../components/ui/Chip';
import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';
import { API_BASE } from '../lib/api';

type Product = {
  id: string;
  title: string;
  priceSale: number;
  priceMrp?: number;
  images?: string[];
};

type Segment = 'Women' | 'Men';

export default function HomeScreen() {
  const nav = useNavigation<any>();
  const [items, setItems] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [seg, setSeg] = React.useState<Segment>('Women');

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  // light heuristic: show men when title hints shirt; women when dress.
  const filtered = React.useMemo(() => {
    if (seg === 'Men') return items.filter(p => /shirt/i.test(p.title));
    return items.filter(p => /dress/i.test(p.title)).concat(items.filter(p => !/shirt/i.test(p.title) && !/dress/i.test(p.title)));
  }, [items, seg]);

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: '#121216' }}
      ListHeaderComponent={
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {(['Women','Men'] as Segment[]).map(s => (
              <Chip key={s} label={s} selected={seg===s} onPress={() => setSeg(s)} />
            ))}
          </ScrollView>

          <HeroBanner
            title="Try Before You Buy"
            subtitle="Free size trial at your doorstep"
          />

          <Text style={styles.section}>{seg === 'Men' ? 'Trending for Men' : 'Trending for Women'}</Text>
        </>
      }
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 12 }}
      data={filtered}
      keyExtractor={(p) => p.id}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#fff" />}
      renderItem={({ item }) => (
        <View style={{ flex: 1 }}>
          <ProductCard
            id={item.id}
            title={item.title}
            price={item.priceSale}
            mrp={item.priceMrp}
            image={item.images?.[0] ?? null}
            badges={/dress/i.test(item.title) ? ['New'] : ['Deal']}
            onPress={() => nav.navigate('Product', { id: item.id })}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  chips: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 8 },
  section: {
    color: '#fff', fontSize: 18, fontWeight: '900',
    paddingHorizontal: 16, marginBottom: 8, marginTop: 4,
  },
});
