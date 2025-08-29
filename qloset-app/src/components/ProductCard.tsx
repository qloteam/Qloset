import * as React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Badge from './ui/Badge';

export type ProductCardProps = {
  id: string;
  title: string;
  price: number;
  mrp?: number;               // optional strike price for discount
  image?: string | null;
  badges?: string[];          // e.g., ['Deal','New']
  onPress?: () => void;
};

export default function ProductCard({ title, price, mrp, image, badges = [], onPress }: ProductCardProps) {
  const hasDiscount = typeof mrp === 'number' && mrp > price;
  const pct = hasDiscount ? Math.round(((mrp! - price) / mrp!) * 100) : null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
      <View>
        <Image
          source={image ? { uri: image } : require('../../assets/placeholder.png')}
          style={styles.img}
          resizeMode="cover"
        />
        <View style={styles.badges}>
          {badges.slice(0,2).map((b) => <Badge key={b} title={b} tone={b==='Deal'?'danger':'brand'} style={{ marginRight: 6 }} />)}
          {pct ? <Badge title={`-${pct}%`} tone="danger" /> : null}
        </View>
      </View>
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.price}>₹{price}</Text>
          {hasDiscount ? <Text style={styles.mrp}>₹{mrp}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1f1f23',
    borderRadius: 16,
    overflow: 'hidden',
  },
  img: { width: '100%', height: 180, backgroundColor: '#2a2a31' },
  badges: { position: 'absolute', top: 8, left: 8, flexDirection: 'row' },
  meta: { padding: 12, gap: 6 },
  title: { fontSize: 16, fontWeight: '800', color: '#fff' },
  price: { fontSize: 15, color: '#fff', fontWeight: '800' },
  mrp: { color: '#aaa', textDecorationLine: 'line-through' },
});
