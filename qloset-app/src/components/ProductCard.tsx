import * as React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export type ProductCardProps = {
  id: string;
  title: string;
  price: number;
  image?: string | null;
  onPress?: () => void;
};

export default function ProductCard({ title, price, image, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.card}>
      <Image
        source={image ? { uri: image } : require('../../assets/placeholder.png')}
        style={styles.img}
        resizeMode="cover"
      />
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.price}>₹{price}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  img: { width: '100%', height: 180, backgroundColor: '#f3f3f3' },
  meta: { padding: 12, gap: 6 },
  title: { fontSize: 16, fontWeight: '700' },
  price: { fontSize: 15, color: '#111' },
});
