// src/screens/ProductScreen.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RouteProp, useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { API_BASE } from "../lib/api";
import Button from "../components/ui/Button";
import { useCart } from "../state/CartContext";
import { useWishlist } from "../state/WishlistContext";

type RootStackParamList = {
  Product: { id: string };
};

type Product = {
  id: string;
  title: string;
  description?: string;
  priceSale: number;
  images?: string[];
  variants: { id: string; size: string; stockQty: number }[];
};

export default function ProductScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "Product">>();
  const nav = useNavigation();
  const { add } = useCart() as any;

  const [p, setP] = useState<Product | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Wishlist context
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const loadProduct = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/products/${route.params.id}`);
      const data = (await res.json()) as Product;
      setP(data);
      if (data?.variants?.[0]?.id) setSelected((prev) => prev ?? data.variants[0].id);
    } catch (e) {
      console.warn("Failed to load product", e);
    } finally {
      setRefreshing(false);
    }
  }, [route.params.id]);

  // initial load
  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // refetch on focus
  useFocusEffect(
    useCallback(() => {
      loadProduct();
    }, [loadProduct])
  );

  // total stock across variants
  const totalStock = useMemo(
    () => (p?.variants ?? []).reduce((s, v) => s + (v?.stockQty ?? 0), 0),
    [p?.variants]
  );

  // stock for currently selected variant
  const selectedStock = useMemo(() => {
    if (!p || !selected) return 0;
    const v = p.variants.find((x) => x.id === selected);
    return v?.stockQty ?? 0;
  }, [p, selected]);

  // is this product in wishlist?
  const isWishlisted = useMemo(
    () => (p ? wishlist.some((x) => x.id === p.id) : false),
    [wishlist, p?.id]
  );

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

  if (!p) {
    return (
      <ScrollView
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadProduct();
            }}
          />
        }
      />
    );
  }

  // Add to cart with stock guards
  const addToCart = () => {
    if (totalStock <= 0) {
      Alert.alert("Out of stock", "This product is currently unavailable.");
      return;
    }
    if (!selected) {
      Alert.alert("Please select a size");
      return;
    }
    const v = p.variants.find((x) => x.id === selected);
    if (!v) return;
    if ((v.stockQty ?? 0) <= 0) {
      Alert.alert("Out of stock", "Selected size is unavailable.");
      return;
    }
    add(p, v, 1);
    Alert.alert("Added to cart", `${p.title} (${v.size})`);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.wrap}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadProduct();
          }}
        />
      }
    >
      {/* Images */}
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {(p.images?.length ? p.images : [null]).map((src, idx) => (
          <Image
            key={idx}
            source={src ? { uri: src } : require("../../assets/placeholder.png")}
            style={styles.hero}
          />
        ))}
      </ScrollView>

      {/* Info */}
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

        {/* Out-of-stock badge for whole product */}
        {totalStock <= 0 ? (
          <Text style={styles.oosProduct}>Out of stock</Text>
        ) : null}

        <Text style={styles.section}>Select size</Text>
        <View style={styles.sizesRow}>
          {p.variants.map((v) => {
            const active = selected === v.id;
            const isDisabled = (v.stockQty ?? 0) <= 0;
            return (
              <TouchableOpacity
                key={v.id}
                onPress={() => !isDisabled && setSelected(v.id)}
                disabled={isDisabled}
                style={[
                  styles.sizeChip,
                  active && styles.sizeChipActive,
                  isDisabled && styles.sizeChipDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.sizeTxt,
                    active && styles.sizeTxtActive,
                    isDisabled && styles.sizeTxtDisabled,
                  ]}
                >
                  {v.size}
                  {isDisabled ? " (OOS)" : ""}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected variant stock hint */}
        {selected ? (
          <Text style={styles.variantStock}>
            {selectedStock > 0 ? `${selectedStock} left` : "Selected size out of stock"}
          </Text>
        ) : null}

        <Button title="Add to cart" onPress={addToCart} disabled={totalStock <= 0} />
        <View style={{ height: 12 }} />
        <Button
          title="Go to cart"
          variant="outline"
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

  oosProduct: {
    marginTop: 6,
    color: "crimson",
    fontWeight: "700",
  },

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
  sizeChipDisabled: {
    opacity: 0.5,
  },

  sizeTxt: { color: "#111", fontWeight: "700" },
  sizeTxtActive: { color: "#fff" },
  sizeTxtDisabled: { color: "#666" },

  variantStock: { marginTop: 6, color: "#666" },

  desc: { color: "#333", lineHeight: 20 },
});
