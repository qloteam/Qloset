import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";

const offersData = [
  { id: "1", title: "10% OFF on first order", code: "WELCOME10" },
  { id: "2", title: "Free Delivery on orders above ₹999", code: "FREESHIP" },
  { id: "3", title: "₹200 OFF on orders above ₹1999", code: "SAVE200" },
];

export default function OffersScreen() {
  const [applied, setApplied] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Offers</Text>
      <FlatList
        data={offersData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.offerRow}>
            <View>
              <Text style={styles.offerTitle}>{item.title}</Text>
              <Text style={styles.code}>Code: {item.code}</Text>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setApplied(item.code)}
            >
              <Text style={styles.buttonText}>
                {applied === item.code ? "Applied" : "Apply"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121216", padding: 20 },
  title: { color: "#fff", fontSize: 20, fontWeight: "600", marginBottom: 20 },
  offerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E1E22",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  offerTitle: { color: "#fff", fontSize: 14, fontWeight: "500" },
  code: { color: "#aaa", fontSize: 12, marginTop: 4 },
  button: { backgroundColor: "#FF3366", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  buttonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
