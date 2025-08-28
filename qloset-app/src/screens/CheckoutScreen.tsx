import * as React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
  TextInput, Switch, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useCart } from '../state/CartContext';
import { API_BASE } from '../lib/api';
import * as Location from 'expo-location';

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

  async function useMyLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow location to verify delivery availability.');
      return;
    }
    const pos = await Location.getCurrentPositionAsync({});
    setLat(pos.coords.latitude);
    setLng(pos.coords.longitude);
    Alert.alert('Location set', `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
  }

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
        address: { name, phone, line1, landmark, pincode, lat, lng }, // ← includes coords
        items: items.map(i => ({ variantId: i.variantId, qty: i.qty }))
      };
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
      clear();
      Alert.alert('Order placed', `Order ID: ${data.orderId}\nTotal: ₹${data.subtotal}\nTBYB: ${tbyb ? 'Yes' : 'No'}`);
    } catch (e: any) {
      Alert.alert('Checkout failed', String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return <View style={styles.container}><Text>Your cart is empty.</Text></View>;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Delivery details</Text>

        <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Phone (10 digits)" keyboardType="phone-pad" value={phone} onChangeText={setPhone} maxLength={10} />
        <TextInput style={styles.input} placeholder="Address line" value={line1} onChangeText={setLine1} />
        <TextInput style={styles.input} placeholder="Landmark (optional)" value={landmark} onChangeText={setLandmark} />
        <TextInput style={styles.input} placeholder="Pincode (service area only)" keyboardType="number-pad" value={pincode} onChangeText={setPincode} maxLength={6} />

        {/* ← Add the button right here */}
        <TouchableOpacity onPress={useMyLocation} style={{ marginTop: 8 }}>
          <Text>Use my current location</Text>
        </TouchableOpacity>
        {lat != null && lng != null && (
          <Text style={{ marginTop: 4, color: '#666' }}>
            Using: {lat.toFixed(5)}, {lng.toFixed(5)}
          </Text>
        )}

        <View style={styles.rowBetween}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Try-Before-You-Buy</Text>
          <Switch value={tbyb} onValueChange={setTbyb} />
        </View>

        <Text style={{ marginTop: 8, color: '#666' }}>Total: ₹{total}</Text>

        <TouchableOpacity style={styles.cta} onPress={placeOrder} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Place order</Text>}
        </TouchableOpacity>

        <Text style={{ marginTop: 10, color: '#888' }}>
          * Orders are currently limited to our T. Nagar / Pondy Bazaar service area.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginTop: 10 },
  rowBetween: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cta: { marginTop: 16, backgroundColor: '#111', padding: 14, borderRadius: 12, alignItems: 'center' }
});
