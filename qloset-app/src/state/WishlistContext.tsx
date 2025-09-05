// src/state/WishlistContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Product = {
  id: string;
  title: string;
  priceSale: number;
  images?: string[];
};

type WishlistContextType = {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      const data = await AsyncStorage.getItem("wishlist");
      if (data) setWishlist(JSON.parse(data));
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev; // avoid duplicates
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
