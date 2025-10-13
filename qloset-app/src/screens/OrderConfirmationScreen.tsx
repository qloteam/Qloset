import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { color, radius, spacing } from '../theme/tokens';

export default function OrderConfirmationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { paymentMethod, total } = (route.params as any) || {};

  // ✅ fixed: reset to MainTabs → Home
  const onContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' as never, params: { screen: 'Home' } as never }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ Order Confirmed!</Text>
      <Text style={styles.text}>Thank you for shopping with Qloset.</Text>

      {paymentMethod && (
        <Text style={styles.text}>
          Payment Method:{' '}
          <Text style={styles.bold}>{paymentMethod.toUpperCase()}</Text>
        </Text>
      )}

      {total && (
        <Text style={styles.text}>Total: ₹{total}</Text>
      )}

      <TouchableOpacity style={styles.btn} onPress={onContinue}>
        <Text style={styles.btnText}>Continue Shopping</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(3),
  },
  title: {
    color: color.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing(2),
  },
  text: {
    color: color.textMuted,
    fontSize: 16,
    marginBottom: spacing(1),
    textAlign: 'center',
  },
  bold: { color: color.text, fontWeight: '700' },
  btn: {
    marginTop: spacing(3),
    backgroundColor: color.text,
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(4),
    borderRadius: radius.md,
  },
  btnText: {
    color: color.bg,
    fontSize: 16,
    fontWeight: '700',
  },
});
