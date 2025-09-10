import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../components/ui/colors';
import { listProducts, type Product as ApiProduct } from '../lib/api';
import SegmentedToggle from '../components/ui/SegmentedToggle';
import Chip from '../components/ui/Chip';
import ImageCapsule from '../components/ui/ImageCapsule';
import TopHeader from '../components/TopHeader';
import GridProductCard from '../components/ui/GridProductCard';

type UiProduct = {
  id: string;
  title: string;
  priceMrp?: number;
  priceSale?: number;
  images: string[];
  description?: string | null;
  brand?: string | null;
  color?: string | null;
  gender?: string | null;
};

const toUiProduct = (p: ApiProduct): UiProduct => {
  const anyP = p as any;
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
    gender: anyP.gender ?? anyP.category?.gender ?? null,
  };
};

const GENDERS = ['Women', 'Men'] as const;
type Gender = (typeof GENDERS)[number];

function inferGender(p: UiProduct): Gender {
  if (p.gender?.toLowerCase() === 'men') return 'Men';
  if (p.gender?.toLowerCase() === 'women') return 'Women';
  const hay = `${p.title} ${p.brand ?? ''} ${p.color ?? ''} ${p.description ?? ''}`.toLowerCase();
  if (hay.includes("men's") || hay.includes('mens') || hay.includes(' men ')) return 'Men';
  return 'Women';
}

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [gender, setGender] = React.useState<Gender>('Women');
  const [all, setAll] = React.useState<UiProduct[]>([]);
  const [loading, setLoading] = React.useState(true);

  // 🔹 NEW: search state
  const [searchVisible, setSearchVisible] = React.useState(false);
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const apiItems: ApiProduct[] = await listProducts();
        const uiItems = (apiItems ?? []).map(toUiProduct);
        if (mounted) setAll(uiItems);
      } catch (e) {
        console.log('[Home] products load error:', e);
        if (mounted) setAll([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // 🔹 filter by gender
  const genderFiltered = React.useMemo(
    () => all.filter((p) => inferGender(p) === gender),
    [all, gender]
  );

  // 🔹 filter by search query
  const data = React.useMemo(() => {
    if (!query.trim()) return genderFiltered;
    const q = query.toLowerCase();
    return genderFiltered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.brand ?? '').toLowerCase().includes(q) ||
        (p.color ?? '').toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q)
    );
  }, [genderFiltered, query]);

  const chips = ['Oversized T-shirt', 'Shirt', 'Jeans', 'Cargos & Parachutes', 'Hoodies'];
  const looks = [
    { title: 'Y2K', uri: 'https://images.unsplash.com/photo-1503342217505-b0a15cf70489' },
    { title: 'Old Money', uri: 'https://images.unsplash.com/photo-1516822003754-cca485356ecb' },
  ];

  const accent = gender === 'Men' ? colors.electricBlue : colors.electricPink;

  const Header = (
    <View style={{ paddingTop: insets.top + 4 }}>
      <TopHeader
        accentColor={accent}
        onCart={() => navigation.navigate('Cart')}
        onSearch={() => setSearchVisible((prev) => !prev)} // ✅ toggle search
        onWishlist={() => navigation.navigate('Profile')}
        onProfile={() => navigation.navigate('Profile')}
      />

      {/* ✅ search bar */}
      {searchVisible && (
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search products..."
            placeholderTextColor={colors.textDim}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      )}

      <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
        <SegmentedToggle
          value={gender}
          onChange={(v) => setGender(v as Gender)}
          options={[
            { label: 'MAN', value: 'Men' },
            { label: 'WOMAN', value: 'Women' },
          ]}
          activeColors={{ Men: colors.electricBlue, Women: colors.electricPink }}
        />
      </View>

      <FlatList
        data={chips}
        keyExtractor={(x) => x}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14 }}
        renderItem={({ item, index }) => (
          <Chip
            label={item}
            active={index === 0}
            onPress={() => navigation.navigate('Explore')}
          />
        )}
      />

      <View style={{ marginTop: 8 }}>
        <Text style={[styles.sectionTitle, { paddingHorizontal: 16 }]}>
          What's your next iconic look?
        </Text>
        <FlatList
          data={looks}
          keyExtractor={(x) => x.title}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 }}
          renderItem={({ item }) => <ImageCapsule title={item.title} uri={item.uri} />}
        />
      </View>

      <Text style={[styles.sectionTitle, { paddingHorizontal: 16, marginTop: 6 }]}>
        {gender === 'Women' ? 'Trending for Women' : 'Trending for Men'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loader]}>
        <ActivityIndicator size="large" color={accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={Header}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 16, justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <GridProductCard
            item={{
              id: item.id,
              title: item.title,
              priceMrp: item.priceMrp,
              priceSale: item.priceSale,
              images: item.images,
            }}
            accentColor={accent}
            onPress={() => navigation.navigate('Product', { id: item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loader: { alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { color: colors.text, fontSize: 22, fontWeight: '900' },

  // 🔹 search styles
  searchBox: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchInput: {
    color: colors.text,
    fontSize: 16,
  },
});
