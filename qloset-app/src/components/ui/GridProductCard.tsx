import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors } from './colors';

type Item = {
  id: string;
  title: string;
  priceMrp?: number;
  priceSale?: number;
  images: string[];
};

export default function GridProductCard({
  item,
  onPress,
  accentColor = colors.electricPink, // pass blue for Men, pink for Women
}: {
  item: Item;
  onPress?: () => void;
  accentColor?: string;
}) {
  const src = item.images?.[0];
  const hasImg = !!src;

  const sale = item.priceSale ?? item.priceMrp ?? 0;
  const mrp = item.priceMrp ?? item.priceSale ?? 0;
  const showStrike = item.priceMrp && item.priceSale && item.priceSale < item.priceMrp;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
      {hasImg ? (
        <Image source={{ uri: src }} style={styles.img} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder} />
      )}

      {/* Bottom overlay content */}
      <View style={styles.bottom}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={[styles.sale, { color: accentColor }]}>
            {formatMoney(sale)}
          </Text>
          {showStrike && (
            <Text style={styles.mrp}>{formatMoney(mrp)}</Text>
          )}
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
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: RADIUS,
    backgroundColor: '#1f2026',
    overflow: 'hidden',
    marginBottom: COL_GAP,
  },
  img: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  placeholder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#262730',
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingVertical: 14,
    // subtle dark overlay for legibility
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  title: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 16,
    marginBottom: 6,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sale: { fontWeight: '900', fontSize: 16 },
  mrp: {
    color: '#B3B3BB',
    textDecorationLine: 'line-through',
    fontSize: 15,
  },
});

function formatMoney(n?: number) {
  if (n == null) return '';
  // Keep it simple and consistent with your screenshots:
  // e.g., $899.00 — change the symbol if you like.
  return `$${Number(n).toFixed(2)}`;
}
