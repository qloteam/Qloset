import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../components/ui/colors';
import ProductCard from '../components/ui/ProductCard';
import { listProducts } from '../lib/api';

type Product = {
  id: string;
  title: string;
  priceMrp: number;
  priceSale: number;
  images: string[];
  // the next three help with best-effort gender detection; they may or may not exist
  description?: string | null;
  brand?: string | null;
  color?: string | null;
};

const GENDERS = ['Women', 'Men'] as const;
type Gender = (typeof GENDERS)[number];

// --- best-effort gender classification without changing backend data
function inferGender(p: Product): Gender {
  const hay =
    `${p.title} ${p.brand ?? ''} ${p.color ?? ''} ${p.description ?? ''}`
      .toLowerCase();

  if (
    hay.includes("men's") ||
    hay.includes('mens') ||
    hay.includes(' men ')
  ) {
    return 'Men';
  }
  // default to Women to match catalogue focus
  return 'Women';
}

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [gender, setGender] = React.useState<Gender>('Women');
  const [all, setAll] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const items = await listProducts(); // ← existing API
        if (mounted) setAll(items ?? []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const data = React.useMemo(
    () => all.filter((p) => inferGender(p) === gender),
    [all, gender],
  );

  const Header = (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.tabs}>
        {GENDERS.map((g) => {
          const active = gender === g;
          return (
            <TouchableOpacity
              key={g}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setGender(g)}
              activeOpacity={0.9}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {g}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ marginTop: 14 }}>
        <Text style={styles.sectionTitle}>
          {gender === 'Women' ? 'Trending for Women' : 'Trending for Men'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={Header}
          contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 12 }}
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              onPress={() => navigation.navigate('Product', { id: item.id })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0c' }, // matches dark hero banner
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    backgroundColor: '#0b0b0c',
    paddingHorizontal: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 10,
    // Pull tabs down from the status bar; Safe Area already applied above
    marginTop: 6,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#1e1f22',
  },
  tabActive: {
    backgroundColor: colors.primary ?? '#e11d48',
  },
  tabText: {
    color: '#c9c9cc',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#fff',
  },

  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    paddingHorizontal: 2,
    marginBottom: 8,
  },
});
