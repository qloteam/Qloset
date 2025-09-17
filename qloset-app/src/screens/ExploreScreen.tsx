// src/screens/ExploreScreen.tsx
import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { colors } from '../components/ui/colors';
import GridProductCard from '../components/ui/GridProductCard';
import { listProducts, type Product as ApiProduct } from '../lib/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const sumVariantStock = (anyP: any) =>
  Array.isArray(anyP?.variants)
    ? anyP.variants.reduce((s: number, v: any) => s + (v?.stockQty ?? 0), 0)
    : 0;


type UiProduct = {
  id: string;
  title: string;
  priceMrp?: number;
  priceSale?: number;
  images: string[];
  description?: string | null;
  brand?: string | null;
  color?: string | null;
  stock?: number; // stock from API
};

const toUiProduct = (p: ApiProduct): UiProduct => {
  const anyP = p as any;
  const computed = sumVariantStock(anyP);
  return {
    id: anyP.id ?? anyP._id ?? String(anyP.sku ?? anyP.slug ?? Math.random()),
    title: anyP.title ?? anyP.name ?? 'Untitled',
    priceMrp: anyP.priceMrp ?? anyP.mrp ?? anyP.price ?? anyP.prices?.mrp ?? undefined,
    priceSale:
      anyP.priceSale ?? anyP.salePrice ?? anyP.discountPrice ?? anyP.prices?.sale ?? undefined,
    images: Array.isArray(anyP.images) ? anyP.images : anyP.image ? [anyP.image] : [],
    description: anyP.description ?? null,
    brand: anyP.brand ?? null,
    color: anyP.color ?? null,
    // ✅ prefer API stock if present; otherwise sum variants
    stock: typeof anyP.stock === 'number' ? anyP.stock : computed,
  };
};


export default function ExploreScreen() {
  const nav = useNavigation() as any;

  const [all, setAll] = React.useState<UiProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [query, setQuery] = React.useState('');

  // one loader used by mount, focus, and pull-to-refresh
  const loadProducts = React.useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const apiItems: ApiProduct[] = await listProducts();
      const uiItems = (apiItems ?? []).map(toUiProduct);
      setAll(uiItems);
    } catch (e) {
      console.log('[Explore] products load error:', e);
      setAll([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  // initial
  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // refetch when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  const data = React.useMemo(() => {
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.brand ?? '').toLowerCase().includes(q) ||
        (p.color ?? '').toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q)
    );
  }, [all, query]);

  if (loading) {
    return (
      <View style={[styles.wrap, styles.center]}>
        <ActivityIndicator size="large" color={colors.electricPink} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Explore</Text>

      {/* 🔎 Search */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search all products…"
          placeholderTextColor={colors.textDim}
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 16 }}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          loadProducts();
        }}
        renderItem={({ item }) => (
          <GridProductCard
            item={{
              id: item.id,
              title: item.title,
              priceMrp: item.priceMrp,
              priceSale: item.priceSale,
              images: item.images,
              stock: item.stock,
            }}
            accentColor={colors.electricPink}
            onPress={() => nav.navigate('Product', { id: item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: 16, paddingTop: 70 },
  center: { alignItems: 'center', justifyContent: 'center' },
  h1: { color: colors.text, fontSize: 22, fontWeight: '900', marginBottom: 8 },
  searchBox: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchInput: { color: colors.text, fontSize: 16 },
});
