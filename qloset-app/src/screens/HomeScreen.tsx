import * as React from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Chip from '../components/ui/Chip';
import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';
import { API_BASE } from '../lib/api';
import { color } from '../theme/tokens';

type Product = { id: string; title: string; priceSale: number; priceMrp?: number; images?: string[]; };
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

  const filtered = React.useMemo(() => {
    if (seg === 'Men') return items.filter(p => /shirt/i.test(p.title));
    return items.filter(p => /dress/i.test(p.title)).concat(items.filter(p => !/shirt|dress/i.test(p.title)));
  }, [items, seg]);

  const renderItem = React.useCallback(({ item }: { item: Product }) => (
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
  ), [nav]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.bg }} edges={['top']}>
      <FlatList
        style={{ flex: 1 }}
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

            <HeroBanner />

            <Text style={styles.section}>
              {seg === 'Men' ? 'Trending for Men' : 'Trending for Women'}
            </Text>
          </>
        }
        contentContainerStyle={{
          paddingTop: 8,              // <-- small gap below the safe area
          paddingHorizontal: 16,
          paddingBottom: 24,
          gap: 12,
        }}
        data={filtered}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#fff" />}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  chips: { paddingVertical: 8, gap: 8 },
  section: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 4,
  },
});
