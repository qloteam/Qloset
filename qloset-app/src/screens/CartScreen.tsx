// src/screens/CartScreen.tsx
import * as React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../state/CartContext';
import Button from '../components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

function firstImageFromAny(obj: any): string | undefined {
  const val = obj?.images;
  if (Array.isArray(val) && val.length) return val[0];
  if (typeof val === 'string') {
    try {
      const arr = JSON.parse(val);
      if (Array.isArray(arr) && arr[0]) return arr[0];
    } catch {
      if (/^https?:\/\//i.test(val)) return val;
    }
  }
  if (typeof obj?.image === 'string') return obj.image;
  if (typeof obj?.img === 'string') return obj.img;
  return undefined;
}

export default function CartScreen() {
  const { items, total, clear, setQty, remove } = useCart();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [showSignInPrompt, setShowSignInPrompt] = React.useState(false);

  const getNavChain = React.useCallback(() => {
    const chain: any[] = [];
    let nav: any = navigation;
    while (nav && typeof nav.getState === 'function') {
      chain.push(nav);
      nav = typeof nav.getParent === 'function' ? nav.getParent() : undefined;
    }
    return chain;
  }, [navigation]);

  const navigatorHasRoute = (nav: any, routeName: string) => {
    const st = nav?.getState?.();
    return Array.isArray(st?.routeNames) && st.routeNames.includes(routeName);
  };

  const safeNavigate = React.useCallback(
    (routeName: string, params?: any) => {
      for (const nav of getNavChain()) {
        if (navigatorHasRoute(nav, routeName)) {
          nav.navigate(routeName as never, params as never);
          return true;
        }
      }
      return false;
    },
    [getNavChain]
  );

  const goToSignIn = React.useCallback(() => {
    setShowSignInPrompt(false);
    if (safeNavigate('Login', { redirect: 'Checkout' })) return;
    if (safeNavigate('LoginScreen', { redirect: 'Checkout' })) return;
    if (safeNavigate('EmailAuthScreen', { redirect: 'Checkout' })) return;
    if (safeNavigate('Auth')) return;
    if (safeNavigate('Profile', { openLogin: true, redirect: 'Checkout' })) return;
    safeNavigate('ProfileScreen', { openLogin: true, redirect: 'Checkout' });
  }, [safeNavigate]);

  const handleCheckoutPress = () => {
    if (!user) {
      setShowSignInPrompt(true);
      return;
    }
    navigation.navigate('Checkout');
  };

  const renderItem = ({ item }: any) => {
    const max = item.variantStock ?? Infinity;
    const atMax = item.qty >= max && max !== Infinity;
    const atMin = item.qty <= 1;

    // ✅ Prefer product.images, fallback to item.images
    const imgSrc = firstImageFromAny(item.product || item);

    return (
      <View style={styles.row}>
        <Image
          source={imgSrc ? { uri: imgSrc } : require('../../assets/placeholder.png')}
          style={styles.img}
          resizeMode="cover"
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.meta}>{item.size}</Text>

          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={[styles.qtyBtn, atMin && styles.qtyBtnDisabled]}
              onPress={() => {
                if (atMin) remove(item.productId, item.variantId);
                else setQty(item.productId, item.variantId, item.qty - 1);
              }}
            >
              <Text style={styles.qtyTxt}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qtyVal}>{item.qty}</Text>

            <TouchableOpacity
              style={[styles.qtyBtn, atMax && styles.qtyBtnDisabled]}
              disabled={atMax}
              onPress={() => setQty(item.productId, item.variantId, item.qty + 1)}
            >
              <Text style={styles.qtyTxt}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.price}>₹{item.price * item.qty}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Your cart</Text>

      <FlatList
        data={items}
        keyExtractor={(i) => `${i.productId}:${i.variantId}`}
        ListEmptyComponent={<Text style={styles.empty}>Your cart is empty.</Text>}
        contentContainerStyle={{ gap: 8 }}
        renderItem={renderItem}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Total: ₹{total}</Text>
        <Button title="Checkout" onPress={handleCheckoutPress} />
      </View>

      <TouchableOpacity onPress={clear} style={{ marginTop: 12 }}>
        <Text style={styles.clear}>Clear cart</Text>
      </TouchableOpacity>

      <Modal
        visible={showSignInPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignInPrompt(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Please sign-in to checkout</Text>
            <Text style={styles.modalSubtitle}>
              You need an account to place orders and track delivery.
            </Text>

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalGhost]}
                onPress={() => setShowSignInPrompt(false)}
              >
                <Text style={styles.modalGhostText}>Not now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalPrimary]}
                onPress={goToSignIn}
              >
                <Text style={styles.modalPrimaryText}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 70, backgroundColor: '#121216' },
  h1: { fontSize: 24, fontWeight: '800', marginBottom: 12, color: '#fff' },
  row: {
    backgroundColor: '#1E1E22',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  img: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#2A2A2F' },
  title: { fontWeight: '700', color: '#fff' },
  meta: { color: '#aaa', marginTop: 2 },
  price: { fontWeight: '700', color: '#fff' },
  footer: { borderTopWidth: 1, borderTopColor: '#2A2A2F', paddingTop: 12, marginTop: 12, gap: 12 },
  total: { fontSize: 16, fontWeight: '800', color: '#fff' },
  empty: { color: '#aaa' },
  clear: { color: '#aaa' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 12 },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2A2A2F', alignItems: 'center', justifyContent: 'center' },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyTxt: { fontSize: 18, fontWeight: '800', color: '#fff' },
  qtyVal: { minWidth: 24, textAlign: 'center', color: '#fff', fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: '85%', backgroundColor: '#1E1E22', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2F' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 6, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 16 },
  modalRow: { flexDirection: 'row', gap: 10 },
  modalBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, minWidth: 120, alignItems: 'center' },
  modalPrimary: { backgroundColor: '#FF3366' },
  modalPrimaryText: { color: '#fff', fontWeight: '800' },
  modalGhost: { backgroundColor: '#2A2A2F', borderWidth: 1, borderColor: '#3A3A40' },
  modalGhostText: { color: '#fff', fontWeight: '700' },
});
