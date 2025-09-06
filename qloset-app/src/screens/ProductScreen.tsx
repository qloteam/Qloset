// src/screens/ProductScreen.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { API_BASE } from "../lib/api";
import Button from "../components/ui/Button";
import { useCart } from "../state/CartContext";
import { useWishlist } from "../state/WishlistContext"; // ✅ use the context

type RootStackParamList = {
  Product: { id: string };
};

type Product = {
  id: string;
  title: string;
  description?: string;
  priceSale: number;
  images?: string[];
  variants: { id: string; size: string }[];
};

export default function ProductScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "Product">>();
  const nav = useNavigation();
  const { add } = useCart() as any;

  const [p, setP] = useState<Product | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  // ✅ Wishlist context
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // ✅ Load product
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/products/${route.params.id}`);
        const data = (await res.json()) as Product;
        setP(data);
        if (data?.variants?.[0]?.id) setSelected(data.variants[0].id);
      } catch (e) {
        console.warn("Failed to load product", e);
      }
    })();
  }, [route.params.id]);

  // ✅ Derived flag: is this product in wishlist?
  const isWishlisted = useMemo(
    () => (p ? wishlist.some((x) => x.id === p.id) : false),
    [wishlist, p?.id]
  );

  // ✅ Toggle via context (no AsyncStorage here)
  const toggleWishlist = () => {
    if (!p) return;
    if (isWishlisted) {
      removeFromWishlist(p.id);
    } else {
      addToWishlist({
        id: p.id,
        title: p.title,
        priceSale: p.priceSale,
        images: p.images,
      });
    }
  };

  if (!p) return <View style={{ flex: 1 }} />;

  // ✅ Add to cart
  const addToCart = () => {
    if (!selected) {
      Alert.alert("Please select a size");
      return;
    }
    const v = p.variants.find((v) => v.id === selected);
    if (!v) return;
    add(p, v, 1);
    Alert.alert("Added to cart", `${p.title} (${v.size})`);
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      {/* ✅ Product Images */}
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {(p.images?.length ? p.images : [null]).map((src, idx) => (
          <Image
            key={idx}
            source={src ? { uri: src } : require("../../assets/placeholder.png")}
            style={styles.hero}
          />
        ))}
      </ScrollView>

      {/* ✅ Product Info */}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{p.title}</Text>
          <TouchableOpacity onPress={toggleWishlist}>
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={24}
              color="red"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.price}>₹{p.priceSale}</Text>

        <Text style={styles.section}>Select size</Text>
        <View style={styles.sizesRow}>
          {p.variants.map((v) => {
            const active = selected === v.id;
            return (
              <TouchableOpacity
                key={v.id}
                onPress={() => setSelected(v.id)}
                style={[styles.sizeChip, active && styles.sizeChipActive]}
              >
                <Text style={[styles.sizeTxt, active && styles.sizeTxtActive]}>
                  {v.size}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button title="Add to cart" onPress={addToCart} />
        <View style={{ height: 12 }} />
        <Button
          title="Go to cart"
          variant="outline"
          // If your tab name is CartTab, use "CartTab" instead of "Cart"
          onPress={() => nav.navigate("Cart" as never)}
        />

        {p.description ? (
          <>
            <Text style={styles.section}>Details</Text>
            <Text style={styles.desc}>{p.description}</Text>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 32 },
  hero: { width: 360, height: 360, backgroundColor: "#f3f3f3" },
  body: { padding: 16, gap: 12 },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: { fontSize: 22, fontWeight: "800" },
  price: { fontSize: 18, fontWeight: "700" },
  section: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
    color: "#555",
    fontWeight: "700",
  },
  sizesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sizeChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  sizeChipActive: {
    borderColor: "#111",
    backgroundColor: "#111",
  },
  sizeTxt: { color: "#111", fontWeight: "700" },
  sizeTxtActive: { color: "#fff" },
  desc: { color: "#333", lineHeight: 20 },
});
