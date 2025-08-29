import * as React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Image } from 'expo-image';
import Badge from './ui/Badge';
import { color, radius } from '../theme/tokens';

export type ProductCardProps = {
  id: string;
  title: string;
  price: number;
  mrp?: number;
  image?: string | null;
  badges?: string[];
  onPress?: () => void;
};

export default function ProductCard({ title, price, mrp, image, badges = [], onPress }: ProductCardProps) {
  const hasDiscount = typeof mrp === 'number' && mrp > price;
  const pct = hasDiscount ? Math.round(((mrp! - price) / mrp!) * 100) : null;

  const scale = React.useRef(new Animated.Value(1)).current;
  const animate = (to:number) => Animated.spring(scale,{toValue:to,useNativeDriver:true,speed:20,bounciness:6}).start();

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animate(0.98)}
        onPressOut={() => animate(1)}
        android_ripple={{ color: '#ffffff22' }}
        style={{ borderRadius: radius.lg, overflow: 'hidden' }}
      >
        <View style={{ height: 180, backgroundColor: '#1b1b20' }}>
          <Image
            source={image || 'https://picsum.photos/600/800'}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={120}
          />
          <View style={styles.badges}>
            {badges.slice(0,2).map((b) => <Badge key={b} title={b} tone={b==='Deal'?'danger':'brand'} />)}
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
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: color.cardAlt, borderRadius: radius.lg },
  badges: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', gap: 6 },
  meta: { padding: 12, gap: 6 },
  title: { fontSize: 16, fontWeight: '900', color: '#fff' },
  price: { fontSize: 15, color: '#fff', fontWeight: '900' },
  mrp: { color: '#a6a6ad', textDecorationLine: 'line-through' },
});
