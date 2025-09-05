// src/screens/WishlistScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Product = {
  id: string;
  title: string;
  priceSale?: number;
  images?: string[];
};

export default function WishlistScreen({ navigation }: any) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem("wishlist");
      if (data) {
        setWishlist(JSON.parse(data));
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.log("Error loading wishlist:", err);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadWishlist);
    loadWishlist();
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Loading wishlist…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Wishlist</Text>

      {wishlist.length === 0 ? (
        <Text style={styles.empty}>No items in wishlist</Text>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("Product", { id: item.id })}
            >
              {/* ✅ Image */}
              <Image
                source={
                  item.images && item.images[0]
                    ? { uri: item.images[0] }
                    : require("../../assets/placeholder.png")
                }
                style={styles.img}
              />

              {/* ✅ Title + Price */}
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.price}>
                  ₹{item.priceSale ? item.priceSale : "—"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0b0c", padding: 16 },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
  },
  empty: { color: "#aaa", textAlign: "center", marginTop: 20 },
  card: {
    backgroundColor: "#1e1e1e",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  img: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  title: { fontSize: 16, color: "white", marginBottom: 4 },
  price: { fontSize: 14, color: "#FF3366" },
});
