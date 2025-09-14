// src/screens/CheckoutScreen.tsx
import { fetchProfile } from '@/db/profile';
import * as React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../state/CartContext';
import { checkoutOrder, type CheckoutItem } from '../lib/api'; // ✅ safe helper
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export default function CheckoutScreen() {
  const nav = useNavigation<any>();
  const { items, total, clear } = useCart();

  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [line1, setLine1] = React.useState('');
  const [landmark, setLandmark] = React.useState('');
  const [pincode, setPincode] = React.useState('');

  const [tbyb, setTbyb] = React.useState(true);
  const [lat, setLat] = React.useState<number | null>(null);
  const [lng, setLng] = React.useState<number | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [locLoading, setLocLoading] = React.useState(false);

  type SavedAddress = {
    id: string;
    label?: string | null;
    line1: string;
    line2?: string | null;
    pincode: string;
    is_default?: boolean | null;
  };

  const { user } = useAuth();
  const [addresses, setAddresses] = React.useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string | null>(null);

  // 🔒 Stronger guard: if unsigned, push to Auth instead of just alerting.
  React.useEffect(() => {
    if (user) return;

    const tryNavigate = (name: string, params?: any) => {
      try {
        // @ts-ignore
        nav.navigate(name, params);
        return true;
      } catch {
        return false;
      }
    };

    if (tryNavigate('EmailAuthScreen', { redirect: 'Checkout' })) return;
    if (tryNavigate('Login', { redirect: 'Checkout' })) return;
    if (tryNavigate('LoginScreen', { redirect: 'Checkout' })) return;
    if (tryNavigate('Auth')) return;

    Alert.alert('Please sign-in to checkout');
    // @ts-ignore
    nav.goBack?.();
  }, [user, nav]);

  // 👤 Auto-fill name & phone for signed-in users
  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) return;
      try {
        const prof = await fetchProfile(user.id);

        if (!alive) return;

        const pickedName =
          prof?.name ??
          // @ts-ignore
          user.user_metadata?.full_name ??
          // @ts-ignore
          user.user_metadata?.name ??
          '';

        const pickedPhone =
          prof?.phone ??
          // @ts-ignore
          user.user_metadata?.phone ??
          '';

        if (pickedName) setName((n) => (n ? n : pickedName));
        if (pickedPhone) setPhone((p) => (p ? p : String(pickedPhone)));
      } catch {
        // ignore – user can still proceed
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  // 📦 Load saved addresses for user
  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user) return;
      const { data, error } = await supabase
        .from('addresses')
        .select('id,label,line1,line2,pincode,is_default')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (!mounted) return;
      if (!error && data) {
        const list = data as SavedAddress[];
        setAddresses(list);
        const def = list.find((a) => a.is_default);
        setSelectedAddressId(def?.id ?? list[0]?.id ?? null);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  const useMyLocation = async () => {
    try {
      setLocLoading(true);
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return Alert.alert(
          'Permission needed',
          canAskAgain
            ? 'Please allow location so we can check serviceability at your address.'
            : 'Location permission was denied. Enable it from Settings to auto-fill your address.'
        );
      }
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLat(coords.latitude);
      setLng(coords.longitude);

      try {
        const places = await Location.reverseGeocodeAsync(coords);
        const first = places?.[0];
        if (first?.postalCode) {
          const onlyDigits = first.postalCode.replace(/\D/g, '').slice(0, 6);
          if (onlyDigits) setPincode(onlyDigits);
        }
        if (!line1 && (first?.name || first?.street)) {
          const addr = [first.name, first.street].filter(Boolean).join(' ');
          if (addr) setLine1(addr);
        }
      } catch {
        /* ignore reverse geocode errors */
      }

      Alert.alert(
        'Location added',
        `Lat: ${coords.latitude.toFixed(5)}, Lng: ${coords.longitude.toFixed(5)}`
      );
    } catch (e: any) {
      Alert.alert('Location error', String(e?.message || e));
    } finally {
      setLocLoading(false);
    }
  };

  const placeOrder = async () => {
    // basic client validation (kept as you had)
    if (!name.trim()) return Alert.alert('Please enter your name');
    if (!/^\d{10}$/.test(phone)) return Alert.alert('Enter a valid 10-digit phone');
    if (!line1.trim()) return Alert.alert('Please enter address line');
    if (!/^\d{6}$/.test(pincode)) return Alert.alert('Enter a valid 6-digit pincode');
    if (!items.length) return Alert.alert('Your cart is empty');

    if (!selectedAddressId) {
      return Alert.alert('Please select or enter an address');
    }

    try {
      setLoading(true);

      // 🔹 Build items for API
      const checkoutItems: CheckoutItem[] = items.map((i: any) => {
        const price =
          typeof i.price === 'number'
            ? i.price
            : typeof i.priceSale === 'number'
            ? i.priceSale
            : typeof i.priceMrp === 'number'
            ? i.priceMrp
            : 0; // server recomputes anyway
        return {
          variantId: i.variantId,
          qty: i.qty,
          price,
        };
      });

      // 🔹 Call race-safe checkout
      const orderRes = await checkoutOrder({
        addressId: selectedAddressId,
        items: checkoutItems,
        tbyb,
        // token: authToken, // add if your API requires auth header
      });

      // normalize shape and show success
      const ord: any = orderRes;
      const orderId = ord?.id ?? ord?.orderId ?? '—';
      const subtotal = ord?.subtotal ?? total ?? 0;

      clear();
      Alert.alert(
        'Order placed',
        `Order ID: ${orderId}\nTotal: ₹${subtotal}\nTBYB: ${tbyb ? 'Yes' : 'No'}`
      );
    } catch (e: any) {
      if (e?.status === 409) {
        Alert.alert(
          'Out of stock',
          'One or more items just went out of stock. Please review your cart.'
        );
      } else {
        Alert.alert('Checkout failed', String(e?.message || e));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#121216' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.h1}>Checkout</Text>

          {/* Contact */}
          <View style={styles.card}>
            <Text style={styles.section}>Contact</Text>

            {user ? (
              <>
                <View style={styles.readonlyRow}>
                  <Text style={styles.readonlyLabel}>Name</Text>
                  <Text style={styles.readonlyValue}>{name || '—'}</Text>
                </View>
                <View style={styles.readonlyRow}>
                  <Text style={styles.readonlyLabel}>Phone</Text>
                  <Text style={styles.readonlyValue}>{phone || '—'}</Text>
                </View>
                {/* If you want to allow editing here, switch to inputs with editable={false} */}
              </>
            ) : (
              <>
                <TextInput
                  placeholder="Full name"
                  placeholderTextColor="#888"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Phone (10 digits)"
                  placeholderTextColor="#888"
                  keyboardType="number-pad"
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.input}
                  maxLength={10}
                />
                <TouchableOpacity
                  onPress={() => {
                    try {
                      // @ts-ignore
                      nav.navigate('EmailAuthScreen', { redirect: 'Checkout' });
                    } catch {
                      Alert.alert('Please sign-in to continue');
                    }
                  }}
                  style={[styles.cta, { marginTop: 4 }]}
                >
                  <Text style={styles.ctaText}>Sign in / Sign up</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Address */}
          <View style={styles.card}>
            <Text style={styles.section}>Address</Text>
            {user && addresses.length > 0 ? (
              <View style={{ marginBottom: 8 }}>
                <Text style={[styles.subheading]}>Use this address</Text>
                {addresses.map((a) => {
                  const selected = selectedAddressId === a.id;
                  return (
                    <TouchableOpacity
                      key={a.id}
                      onPress={() => setSelectedAddressId(a.id)}
                      style={[
                        styles.addressBox,
                        {
                          borderColor: selected ? '#FF3366' : '#2A2A2F',
                          backgroundColor: selected ? '#1E1E22' : '#2A2A2F',
                        },
                      ]}
                    >
                      <Text style={{ fontWeight: '700', color: '#fff' }}>
                        {a.label ? `${a.label} — ` : ''}
                        {a.line1}
                      </Text>
                      {a.line2 ? <Text style={{ color: '#aaa' }}>{a.line2}</Text> : null}
                      <Text style={{ color: '#aaa' }}>{a.pincode}</Text>
                      {a.is_default ? (
                        <Text style={{ color: '#10B981', marginTop: 4 }}>Default</Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  onPress={() => {
                    const chosen = addresses.find((x) => x.id === selectedAddressId);
                    if (!chosen) return;
                    setLine1(chosen.line1 || '');
                    setPincode(chosen.pincode || '');
                  }}
                  style={styles.useBtn}
                >
                  <Text style={{ color: 'white', fontWeight: '800' }}>Use selected address</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <TextInput
              placeholder="Address line"
              placeholderTextColor="#888"
              value={line1}
              onChangeText={setLine1}
              style={styles.input}
            />
            <TextInput
              placeholder="Landmark (optional)"
              placeholderTextColor="#888"
              value={landmark}
              onChangeText={setLandmark}
              style={styles.input}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TextInput
                placeholder="Pincode"
                placeholderTextColor="#888"
                keyboardType="number-pad"
                value={pincode}
                onChangeText={setPincode}
                style={[styles.input, { flex: 1 }]}
                maxLength={6}
              />
              <TouchableOpacity onPress={useMyLocation} style={styles.locBtn} disabled={locLoading}>
                {locLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ fontWeight: '700', color: '#fff' }}>Use my location</Text>
                )}
              </TouchableOpacity>
            </View>
            {lat != null && lng != null && (
              <Text style={styles.coords}>
                Using location • {lat.toFixed(4)}, {lng.toFixed(4)}
              </Text>
            )}
          </View>

          {/* TBYB */}
          <View style={styles.card}>
            <Text style={styles.section}>Try Before You Buy</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={[styles.toggle, tbyb && styles.toggleOn]}
                onPress={() => setTbyb(true)}
              >
                <Text style={[styles.toggleText, tbyb && styles.toggleTextOn]}>Enabled</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggle, !tbyb && styles.toggleOn]}
                onPress={() => setTbyb(false)}
              >
                <Text style={[styles.toggleText, !tbyb && styles.toggleTextOn]}>Disabled</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Summary */}
          <View style={styles.card}>
            <Text style={styles.section}>Summary</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
              Total: ₹{total}
            </Text>
          </View>

          {/* CTA */}
          <TouchableOpacity style={styles.cta} onPress={placeOrder} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>Place order</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    rowGap: 12,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#1E1E22',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  h1: { fontSize: 28, fontWeight: '900', marginBottom: 4, color: '#fff' },
  section: { fontSize: 16, fontWeight: '800', marginBottom: 6, color: '#fff' },
  subheading: { fontWeight: '700', fontSize: 14, marginBottom: 8, color: '#fff' },
  input: {
    backgroundColor: '#2A2A2F',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  locBtn: {
    backgroundColor: '#2A2A2F',
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    minWidth: 140,
    alignItems: 'center',
  },
  coords: { marginTop: 6, color: '#aaa' },
  toggle: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#2A2A2F',
  },
  toggleOn: { backgroundColor: '#FF3366' },
  toggleText: { fontWeight: '700', color: '#aaa' },
  toggleTextOn: { color: '#fff' },
  addressBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  useBtn: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FF3366',
    alignItems: 'center',
    marginBottom: 6,
  },
  cta: {
    backgroundColor: '#FF3366',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  ctaText: { color: '#fff', fontWeight: '900', fontSize: 18 },

  // New read-only styles
  readonlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  readonlyLabel: { color: '#bbb' },
  readonlyValue: { color: '#fff', fontWeight: '600' },
});
