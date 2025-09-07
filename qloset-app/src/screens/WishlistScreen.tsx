// src/screens/WishlistScreen.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useWishlist } from "../state/WishlistContext";

// 👇– type your root stack routes used from here
type RootStackParamList = {
  Product: { id: string };
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function WishlistScreen() {
  const navigation = useNavigation<Nav>();
  const { wishlist, removeFromWishlist, hydrated } = useWishlist();

  if (!hydrated) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator />
        <Text style={{ color: "#aaa", marginTop: 10 }}>Loading your likes…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Wishlist</Text>

      {wishlist.length === 0 ? (
        <Text style={styles.empty}>No items yet — go like something!</Text>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("Product", { id: item.id })}
            >
              <Image
                source={
                  item.images?.[0]
                    ? { uri: item.images[0] }
                    : require("../../assets/placeholder.png")
                }
                style={styles.img}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.price}>₹{item.priceSale}</Text>
              </View>
              <TouchableOpacity onPress={() => removeFromWishlist(item.id)}>
                <Text style={styles.remove}>Remove</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#121215" },
  header: { color: "white", fontSize: 20, fontWeight: "800", marginBottom: 12 },
  empty: { color: "#aaa", textAlign: "center", marginTop: 20 },
  card: {
    backgroundColor: "#1e1e22",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  img: { width: 60, height: 60, borderRadius: 8, marginRight: 12, backgroundColor: "#2a2a2e" },
  title: { fontSize: 16, color: "white", marginBottom: 4, fontWeight: "600" },
  price: { fontSize: 14, color: "#FF3366" },
  remove: { color: "#FF5C7A", fontWeight: "700" },
});
