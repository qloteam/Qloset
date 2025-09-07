import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, radius, shadow } from './colors';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Sunglasses: 'glasses-outline',
  Watches: 'time-outline',
  Necklace: 'diamond-outline',
  Bracelets: 'bandage-outline',
  Rings: 'radio-button-on-outline',
  Bags: 'bag-handle-outline',
};

export default function AccessoryCard({ title }: { title: string }) {
  const name = ICONS[title] ?? 'pricetag-outline';
  return (
    <View style={styles.wrap}>
      <View style={styles.red}>
        <Ionicons name={name} size={28} color="#fff" />
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const TILE = 68;

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: TILE + 24, marginBottom: 8 },
  red: {
    width: TILE,
    height: TILE,
    borderRadius: radius.lg,
    backgroundColor: colors.redTile,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  title: { color: colors.text, fontWeight: '800', marginTop: 8, fontSize: 13 },
});
