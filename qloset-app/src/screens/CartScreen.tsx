// src/screens/CartScreen.tsx
import * as React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../state/CartContext';
import Button from '../components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function CartScreen() {
  const { items, total, clear, setQty, remove } = useCart();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [showSignInPrompt, setShowSignInPrompt] = React.useState(false);

  // --- utilities to avoid "route not handled" errors ---
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

    // 1) Direct login screens (pick the one your app actually registered)
    if (safeNavigate('Login', { redirect: 'Checkout' })) return;
    if (safeNavigate('LoginScreen', { redirect: 'Checkout' })) return;
    if (safeNavigate('EmailAuthScreen', { redirect: 'Checkout' })) return;

    // 2) If you have a dedicated Auth navigator, jump to it (its initialRoute is usually the login)
    if (safeNavigate('Auth')) return;

    // 3) Last resort: go to Profile and let user tap Sign in there
    //    (If you want auto-open, handle `openLogin` inside ProfileScreen)
    if (safeNavigate('Profile', { openLogin: true, redirect: 'Checkout' })) return;
    safeNavigate('ProfileScreen', { openLogin: true, redirect: 'Checkout' });
  }, [safeNavigate]);

  const handleCheckoutPress = () => {
    if (!user) {
      setShowSignInPrompt(true); // block navigation if unsigned
      return;
    }
    navigation.navigate('Checkout'); // unchanged for signed-in users
  };

  const renderItem = ({ item }: any) => {
    const max = item.variantStock ?? Infinity;
    const atMax = item.qty >= max && max !== Infinity;
    const atMin = item.qty <= 1;

    return (
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.meta}>{item.size}</Text>

          {/* Qty controls (unchanged) */}
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

      {/* Sign-in required modal */}
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
    gap: 8,
  },
  title: { fontWeight: '700', color: '#fff' },
  meta: { color: '#aaa', marginTop: 2 },
  price: { fontWeight: '700', color: '#fff' },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#2A2A2F',
    paddingTop: 12,
    marginTop: 12,
    gap: 12,
  },
  total: { fontSize: 16, fontWeight: '800', color: '#fff' },
  empty: { color: '#aaa' },
  clear: { color: '#aaa' },

  // Qty controls
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 12 },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyTxt: { fontSize: 18, fontWeight: '800', color: '#fff' },
  qtyVal: { minWidth: 24, textAlign: 'center', color: '#fff', fontWeight: '700' },

  // Modal styles
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#1E1E22',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2F',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 6, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 16 },
  modalRow: { flexDirection: 'row', gap: 10 },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  modalPrimary: { backgroundColor: '#FF3366' },
  modalPrimaryText: { color: '#fff', fontWeight: '800' },
  modalGhost: { backgroundColor: '#2A2A2F', borderWidth: 1, borderColor: '#3A3A40' },
  modalGhostText: { color: '#fff', fontWeight: '700' },
});
