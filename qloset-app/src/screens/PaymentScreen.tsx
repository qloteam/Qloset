import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { color, radius, shadow, spacing } from "../theme/tokens";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "../state/CartContext";

// 🧭 Route params
type PaymentRouteParams = {
  total?: number;
  tbyb?: boolean;
  name?: string;
  phone?: string;
  addressId?: string;
};

const PAYMENT_OPTIONS = [
  { id: "cod", label: "Cash on Delivery" },
  { id: "upi", label: "UPI" },
  { id: "credit", label: "Credit Card" },
  { id: "debit", label: "Debit Card" },
];

export default function PaymentScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { items, clear } = useCart();
  const route = useRoute() as { params?: PaymentRouteParams };
  const { total, tbyb, name, phone, addressId } = route.params || {};

  // 🧾 Handle confirm payment
  const handleConfirm = async () => {
    if (!selected) return Alert.alert("Please select a payment method");

    // ✅ COD flow using Supabase directly
    if (selected === "cod") {
      try {
        setLoading(true);

        // 🔐 Check if user is logged in
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) {
          Alert.alert("Login Required", "Please sign in to place your order.");
          return;
        }

        const user = authData.user;
        console.log("🧍 User ID:", user.id);

        // 🧮 Calculate total in paise (₹ → paise)
        const totalInPaise = Math.round((total || 0) * 100);

        // 🧾 Build order payload (matches your 'orders' table)
        const orderData = {
          user_id: user.id,
          address_id: addressId,
          items: items.map((it) => ({
            variantId: it.variantId,
            qty: it.qty || 1,
          })),
          tbyb: !!tbyb,
          payment_method: "COD",
          total_in_paise: totalInPaise,
        };

        console.log("🧾 Inserting order:", orderData);

        // 🪄 Insert into Supabase
        const { data, error } = await supabase
          .from("orders")
          .insert(orderData)
          .select()
          .single();

        if (error) throw error;
        console.log("✅ Order created:", data);

        clear();
        (navigation as any).navigate("OrderConfirmation", {
          paymentMethod: "Cash on Delivery",
          total: total || 0,
        });
      } catch (err: any) {
        console.error("❌ Order creation error:", err);
        Alert.alert("Error", `Failed to place order.\n\n${err.message}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 💳 Placeholder for upcoming payment methods
    Alert.alert("Payment Pending", "Online payments (UPI/Cards) will be available soon.");
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
          Try Before You Buy: {tbyb ? "Yes" : "No"}
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

      <TouchableOpacity
        style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
        onPress={handleConfirm}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={color.bg} />
        ) : (
          <Text style={styles.confirmText}>Confirm Payment</Text>
        )}
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
    fontWeight: "700",
    marginBottom: spacing(2),
  },
  subheader: {
    color: color.text,
    fontSize: 18,
    fontWeight: "600",
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
    fontWeight: "600",
  },
  confirmBtn: {
    marginTop: spacing(2),
    backgroundColor: color.text,
    paddingVertical: spacing(2),
    borderRadius: radius.md,
    alignItems: "center",
  },
  confirmText: {
    color: color.bg,
    fontSize: 16,
    fontWeight: "600",
  },
});
