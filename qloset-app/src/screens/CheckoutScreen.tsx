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
import { useCart } from '../state/CartContext';
import { API_BASE } from '../lib/api';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';


export default function CheckoutScreen() {
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

  

  // Saved addresses from Profile
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
      const def = list.find(a => a.is_default);
      setSelectedAddressId(def?.id ?? list[0]?.id ?? null);
    }
  }
  load();
  return () => { mounted = false; };
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
        /* best effort reverse geocode */
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
    if (!name.trim()) return Alert.alert('Please enter your name');
    if (!/^\d{10}$/.test(phone)) return Alert.alert('Enter a valid 10-digit phone');
    if (!line1.trim()) return Alert.alert('Please enter address line');
    if (!/^\d{6}$/.test(pincode)) return Alert.alert('Enter a valid 6-digit pincode');
    if (!items.length) return Alert.alert('Your cart is empty');

    try {
      setLoading(true);
      const payload = {
        userPhone: phone,
        tbyb,
        addressId: selectedAddressId,
        address: { name, phone, line1, landmark, pincode, lat, lng },
        items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
      };
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // better error message extraction (e.g., “Location not in serviceable region”)
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok || !data.ok) {
        const msg =
          (typeof data?.message === 'string'
            ? data.message
            : Array.isArray(data?.message)
            ? data.message.join(', ')
            : data?.error) || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      clear();
      Alert.alert(
        'Order placed',
        `Order ID: ${data.orderId}\nTotal: ₹${data.subtotal}\nTBYB: ${tbyb ? 'Yes' : 'No'}`
      );
    } catch (e: any) {
      Alert.alert('Checkout failed', String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.h1}>Checkout</Text>

          {/* Contact */}
          <View style={styles.card}>
            <TextInput
              placeholder="Full name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Phone (10 digits)"
              keyboardType="number-pad"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              maxLength={10}
            />
          </View>

          {/* Address */}
          <View style={styles.card}>
            <Text style={styles.section}>Address</Text>
            {user && addresses.length > 0 ? (
  <View style={{ marginBottom: 8 }}>
    <Text style={{ fontWeight: '700', fontSize: 14, marginBottom: 8 }}>
      Use this address
    </Text>

    {addresses.map((a) => {
      const selected = selectedAddressId === a.id;
      return (
        <TouchableOpacity
          key={a.id}
          onPress={() => setSelectedAddressId(a.id)}
          style={{
            padding: 12,
            borderRadius: 12,
            borderWidth: selected ? 2 : 1,
            borderColor: selected ? '#111827' : '#E5E7EB',
            backgroundColor: selected ? '#111827' : '#F3F4F6',
            marginBottom: 10,
          }}
        >
          <Text style={{ fontWeight: '700', color: selected ? 'white' : 'black' }}>
            {a.label ? `${a.label} — ` : ''}{a.line1}
          </Text>
          {a.line2 ? (
            <Text style={{ color: selected ? 'white' : 'black' }}>{a.line2}</Text>
          ) : null}
          <Text style={{ color: selected ? '#D1FAE5' : '#4B5563' }}>{a.pincode}</Text>
          {a.is_default ? (
            <Text style={{ color: '#10B981', marginTop: 4 }}>Default</Text>
          ) : null}
        </TouchableOpacity>
      );
    })}

    <TouchableOpacity
      onPress={() => {
        const chosen = addresses.find(x => x.id === selectedAddressId);
        if (!chosen) return;
        // Fill your checkout inputs from the selected address:
        setLine1(chosen.line1 || '');
        // If you want line2 to show as landmark, uncomment next line:
        // setLandmark(chosen.line2 || '');
        setPincode(chosen.pincode || '');
      }}
      style={{
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#111827',
        alignItems: 'center',
        marginBottom: 6,
      }}
    >
      <Text style={{ color: 'white', fontWeight: '800' }}>Use selected address</Text>
    </TouchableOpacity>
  </View>
) : null}

            <TextInput
              placeholder="Address line"
              value={line1}
              onChangeText={setLine1}
              style={styles.input}
            />
            <TextInput
              placeholder="Landmark (optional)"
              value={landmark}
              onChangeText={setLandmark}
              style={styles.input}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TextInput
                placeholder="Pincode"
                keyboardType="number-pad"
                value={pincode}
                onChangeText={setPincode}
                style={[styles.input, { flex: 1 }]}
                maxLength={6}
              />
              <TouchableOpacity onPress={useMyLocation} style={styles.locBtn} disabled={locLoading}>
                {locLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={{ fontWeight: '700' }}>Use my location</Text>
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
            <Text style={{ fontSize: 16, fontWeight: '700' }}>Total: ₹{total}</Text>
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
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    elevation: 1,
  },
  h1: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
  section: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  input: {
    backgroundColor: '#f4f4f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  locBtn: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    minWidth: 140,
    alignItems: 'center',
  },
  coords: { marginTop: 6, color: '#6b7280' },
  toggle: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  toggleOn: { backgroundColor: '#111827' },
  toggleText: { fontWeight: '700', color: '#111827' },
  toggleTextOn: { color: '#fff' },
  cta: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  ctaText: { color: '#fff', fontWeight: '900', fontSize: 18 },
});
