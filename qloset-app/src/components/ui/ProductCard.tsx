import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Badge from './Badge';
import { colors } from './colors';

type Product = {
  id: string;
  title: string;
  priceMrp: number;
  priceSale: number;
  images?: any;
  image?: string;
  img?: string;
};

function firstImage(item: Product): string | undefined {
  if (Array.isArray(item.images) && item.images.length) return item.images[0];
  if (typeof item.images === 'string') {
    try {
      const arr = JSON.parse(item.images);
      if (Array.isArray(arr) && arr[0]) return arr[0];
    } catch {
      if (/^https?:\/\//i.test(item.images)) return item.images;
    }
  }
  if (typeof item.image === 'string') return item.image;
  if (typeof item.img === 'string') return item.img;
  return undefined;
}

export default function ProductCard({
  item,
  onPress,
}: {
  item: Product;
  onPress: () => void;
}) {
  const src = firstImage(item);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imgWrap}>
        {src ? (
          <Image source={{ uri: src }} style={styles.img} resizeMode="cover" />
        ) : (
          <View style={[styles.img, { backgroundColor: colors.line }]} />
        )}
        <View style={styles.badges}>
          <Badge text="New" />
          {item.priceSale < item.priceMrp && (
            <Badge
              text={`-${Math.round(((item.priceMrp - item.priceSale) / item.priceMrp) * 100)}%`}
              style={{ marginLeft: 6, backgroundColor: '#ef4444' }}
            />
          )}
        </View>
      </View>

      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.price}>₹{item.priceSale}</Text>
          {item.priceSale < item.priceMrp && (
            <Text style={styles.mrp}>₹{item.priceMrp}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden' },
  imgWrap: { position: 'relative' },
  img: { width: '100%', height: 170 },
  badges: { position: 'absolute', top: 8, left: 8, flexDirection: 'row' },
  meta: { padding: 12 },
  title: { color: colors.text, fontWeight: '800', marginBottom: 6 },
  price: { color: '#fff', fontWeight: '900' },
  mrp: { color: colors.textDim, textDecorationLine: 'line-through' },
});
