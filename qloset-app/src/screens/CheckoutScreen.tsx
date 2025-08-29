import * as React from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Button from '../components/ui/Button';
import { useCart } from '../state/CartContext';
import { API_BASE } from '../lib/api';

export default function CheckoutScreen() {
  const { items, total, clear } = useCart() as any;

  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [line1, setLine1] = React.useState('');
  const [landmark, setLandmark] = React.useState('');
  const [pincode, setPincode] = React.useState('');
  const [tbyb, setTbyb] = React.useState(true);
  const [lat, setLat] = React.useState<number | null>(null);
  const [lng, setLng] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  const useMyLocation = async () => {
    // Keep as-is if you already wired expo-location. Placeholder here:
    Alert.alert('Location', 'If you enabled expo-location earlier, this will fill lat/lng.');
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
        address: { name, phone, line1, landmark, pincode, lat, lng },
        items: items.map((i: any) => ({ variantId: i.variantId, qty: i.qty })),
      };

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      let data: any = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { data = { message: raw }; }

      if (!res.ok || data?.ok === false) {
        const msg =
          (Array.isArray(data?.message) ? data.message.join('\n') : data?.message) ||
          data?.error ||
          `HTTP ${res.status}`;
        Alert.alert('Checkout failed', msg);
        return;
      }

      clear();
      Alert.alert('Order placed', `Order ID: ${data.orderId}\nTotal: ₹${data.subtotal}\nTBYB: ${tbyb ? 'Yes' : 'No'}`);
    } catch (e: any) {
      Alert.alert('Checkout failed', String(e?.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.h1}>Checkout</Text>

      <View style={styles.card}>
        <Text style={styles.h2}>Contact</Text>
        <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
        <TextInput placeholder="Phone (10 digits)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>Address</Text>
        <TextInput placeholder="Address line" value={line1} onChangeText={setLine1} style={styles.input} />
        <TextInput placeholder="Landmark (optional)" value={landmark} onChangeText={setLandmark} style={styles.input} />
        <TextInput placeholder="Pincode" value={pincode} onChangeText={setPincode} keyboardType="number-pad" style={styles.input} />
        <TouchableOpacity onPress={useMyLocation} style={{ marginTop: 8 }}>
          <Text style={{ color: '#111', fontWeight: '600' }}>Use my current location</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>Try Before You Buy</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => setTbyb(true)} style={[styles.choice, tbyb && styles.choiceActive]}>
            <Text style={[styles.choiceTxt, tbyb && styles.choiceTxtActive]}>Enabled</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTbyb(false)} style={[styles.choice, !tbyb && styles.choiceActive]}>
            <Text style={[styles.choiceTxt, !tbyb && styles.choiceTxtActive]}>Disabled</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>Summary</Text>
        <Text style={{ fontWeight: '700' }}>Total: ₹{total}</Text>
      </View>

      <Button title={loading ? 'Placing order...' : 'Place order'} onPress={placeOrder} disabled={loading} />
      {loading ? <ActivityIndicator style={{ marginTop: 12 }} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 16, gap: 12 },
  h1: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  h2: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  input: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  choice: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  choiceActive: {
    borderColor: '#111',
    backgroundColor: '#111',
  },
  choiceTxt: { color: '#111', fontWeight: '700' },
  choiceTxtActive: { color: '#fff' },
});
