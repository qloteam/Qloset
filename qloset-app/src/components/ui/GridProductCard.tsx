// qloset-app/src/components/ui/GridProductCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { colors } from './colors';

type Item = {
  id: string;
  title: string;
  priceMrp?: number;
  priceSale?: number;
  images?: any;   // ← can be string[], string (json), or undefined
  image?: string; // ← some lists may send a single field
  img?: string;
  stock?: number;
};

function firstImage(item: Item): string | undefined {
  // images as array
  if (Array.isArray(item.images) && item.images.length > 0) {
    return item.images[0];
  }
  // images as JSON string
  if (typeof item.images === 'string') {
    try {
      const arr = JSON.parse(item.images);
      if (Array.isArray(arr) && arr[0]) return arr[0];
    } catch {
      // if it's just a plain string URL, use it
      if (/^https?:\/\//i.test(item.images)) return item.images;
    }
  }
  // fallbacks commonly seen in lists
  if (typeof item.image === 'string') return item.image;
  if (typeof item.img === 'string') return item.img;
  return undefined;
}

function formatMoney(n?: number) {
  if (n == null) return '';
  return `₹${Number(n).toFixed(0)}`;
}

export default function GridProductCard({
  item,
  onPress,
  accentColor = colors.electricPink,
}: {
  item: Item;
  onPress?: () => void;
  accentColor?: string;
}) {
  const src = firstImage(item);
  const sale = item.priceSale ?? item.priceMrp ?? 0;
  const mrp = item.priceMrp ?? item.priceSale ?? 0;
  const showStrike =
    item.priceMrp != null &&
    item.priceSale != null &&
    (item.priceSale as number) < (item.priceMrp as number);

  const isOOS = typeof item.stock === 'number' && item.stock <= 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.card, isOOS && styles.cardOOS]}>
      {src ? (
        <Image source={{ uri: src }} style={styles.img} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder} />
      )}

      {isOOS && (
        <View style={styles.oosBadge}>
          <Text style={styles.oosText}>Out of stock</Text>
        </View>
      )}

      <View style={styles.bottom}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.priceRow}>
          <Text style={[styles.sale, { color: accentColor }]}>{formatMoney(sale)}</Text>
          {showStrike && <Text style={styles.mrp}>{formatMoney(mrp)}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ---- layout constants
const W = Dimensions.get('window').width;
const H_PAD = 16;
const COL_GAP = 12;
const CARD_W = (W - H_PAD * 2 - COL_GAP) / 2;
const CARD_H = 260;
const RADIUS = 18;

const styles = StyleSheet.create({
  card: { width: CARD_W, height: CARD_H, borderRadius: RADIUS, backgroundColor: '#1f2026', overflow: 'hidden', marginBottom: COL_GAP },
  cardOOS: { opacity: 0.9 },
  img: { position: 'absolute', width: '100%', height: '100%' },
  placeholder: { position: 'absolute', width: '100%', height: '100%', backgroundColor: '#262730' },
  oosBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'crimson', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, zIndex: 1 },
  oosText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 14, paddingVertical: 14, backgroundColor: 'rgba(0,0,0,0.28)' },
  title: { color: colors.text, fontWeight: '900', fontSize: 16, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sale: { fontWeight: '900', fontSize: 16 },
  mrp: { color: '#B3B3BB', textDecorationLine: 'line-through', fontSize: 15 },
});
