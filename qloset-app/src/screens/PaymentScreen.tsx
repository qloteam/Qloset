import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { color, radius, shadow, spacing } from '../theme/tokens';

// 🧭 Type definition for params received from CheckoutScreen
type PaymentRouteParams = {
  total?: number;
  tbyb?: boolean;
  name?: string;
  phone?: string;
  addressId?: string;
};

const PAYMENT_OPTIONS = [
  { id: 'cod', label: 'Cash on Delivery' },
  { id: 'upi', label: 'UPI' },
  { id: 'credit', label: 'Credit Card' },
  { id: 'debit', label: 'Debit Card' },
];

export default function PaymentScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const navigation = useNavigation();

  // ✅ Correctly typed useRoute for params (this line fixes your error)
  const route = useRoute() as { params?: PaymentRouteParams };
  const { total, tbyb, name, phone } = route.params || {};

  // ⚙️ Handle confirmation of payment
  const handleConfirm = async () => {
    if (!selected) return Alert.alert('Please select a payment method');

    // 💰 COD → confirm instantly
    if (selected === 'cod') {
      Alert.alert(
        'Order Placed',
        `Your order has been placed successfully with Cash on Delivery.\nTotal: ₹${total}`
      );
      navigation.navigate('OrderConfirmation' as never);
      return;
    }

    // 💳 Other payment methods → placeholder API call
    try {
      await fetch('http://localhost:3001/orders/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: selected,
          total,
          tbyb,
          name,
          phone,
        }),
      });

      Alert.alert('Payment Successful', `Total paid: ₹${total}`);
      navigation.navigate('OrderConfirmation' as never);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Payment</Text>

      {/* 🧾 Order Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>Name: {name}</Text>
        <Text style={styles.summaryText}>Phone: {phone}</Text>
        <Text style={styles.summaryText}>Total: ₹{total}</Text>
        <Text style={styles.summaryText}>
          Try Before You Buy: {tbyb ? 'Yes' : 'No'}
        </Text>
      </View>

      <Text style={styles.subheader}>Select Payment Method</Text>

      <FlatList
        data={PAYMENT_OPTIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.option,
              selected === item.id && styles.optionSelected,
            ]}
            onPress={() => setSelected(item.id)}
          >
            <Text
              style={[
                styles.optionText,
                selected === item.id && styles.optionTextSelected,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: spacing(4) }}
      />

      <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Confirm Payment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
    padding: spacing(2),
  },
  header: {
    color: color.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing(2),
  },
  subheader: {
    color: color.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing(1),
    marginTop: spacing(2),
  },
  summaryCard: {
    backgroundColor: color.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.line,
    padding: spacing(2),
    marginBottom: spacing(2),
    ...shadow.card,
  },
  summaryText: {
    color: color.text,
    fontSize: 16,
    marginBottom: spacing(0.5),
  },
  option: {
    backgroundColor: color.card,
    borderColor: color.line,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(2),
    marginBottom: spacing(1.5),
    ...shadow.card,
  },
  optionSelected: {
    borderColor: color.text,
    backgroundColor: color.cardAlt,
  },
  optionText: {
    color: color.textMuted,
    fontSize: 16,
  },
  optionTextSelected: {
    color: color.text,
    fontWeight: '600',
  },
  confirmBtn: {
    marginTop: spacing(2),
    backgroundColor: color.text,
    paddingVertical: spacing(2),
    borderRadius: radius.md,
    alignItems: 'center',
  },
  confirmText: {
    color: color.bg,
    fontSize: 16,
    fontWeight: '600',
  },
});
