import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from './ui/colors';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TopHeader({
  onSearch,
  onWishlist,
  onCart,
  onProfile,
  locationText = 'Shreepal Complex, Suren Ro…',
  etaText = 'Delivery in 60 minutes',
  accentColor = colors.electricPink, // Men -> blue, Women -> pink (passed from parent)
}: {
  onSearch?: () => void;
  onWishlist?: () => void;
  onCart?: () => void;
  onProfile?: () => void;
  locationText?: string;
  etaText?: string;
  accentColor?: string;
}) {
  // Prefer split on " in ", but fall back to highlighting a time phrase if wording changes
  const inIdx = etaText.toLowerCase().indexOf(' in ');
  const hasSplit = inIdx !== -1;
  const prefix = hasSplit ? etaText.slice(0, inIdx) : 'Delivery in ';
  const value  = hasSplit ? etaText.slice(inIdx + 4) :
    (etaText.match(/\d+\s*(?:min|minutes|hr|hrs|hour|hours)/i)?.[0] ?? '60 minutes');

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eta}>
            {prefix} in <Text style={[styles.etaValue, { color: accentColor }]}>{value}</Text>
          </Text>

          <View style={styles.locRow}>
            <Ionicons name="location-outline" size={12} color={colors.textDim} />
            <Text style={styles.location} numberOfLines={1}>{locationText}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={onSearch} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name="search" size={16} color={colors.text} />
          </Pressable>
          <Pressable onPress={onWishlist} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name="heart-outline" size={16} color={colors.text} />
          </Pressable>
          <Pressable onPress={onCart} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name="bag-handle-outline" size={16} color={colors.text} />
          </Pressable>
          <Pressable onPress={onProfile} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name="person-outline" size={16} color={colors.text} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.bg, paddingTop: 4, paddingHorizontal: 14, paddingBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },
  eta: { color: colors.text, fontSize: 18, fontWeight: '900', lineHeight: 22 },
  etaValue: { textDecorationLine: 'underline' },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  location: { color: colors.textDim, fontSize: 11, flexShrink: 1 },
  actions: { flexDirection: 'row', marginLeft: 8, gap: 8 },
  iconBtn: {
    width: 32, height: 32, borderRadius: 999,
    backgroundColor: '#22242b',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#2b2d36',
  },
});
