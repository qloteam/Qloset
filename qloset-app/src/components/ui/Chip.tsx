import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius } from './colors';

export default function Chip({
  label,
  active,
  onPress,
  style,
}: { label: string; active?: boolean; onPress?: () => void; style?: ViewStyle }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.active, style]}>
      <Text style={[styles.text, active && styles.textActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.chipBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.xl,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  active: { backgroundColor: colors.chipBgActive, borderColor: colors.chipBgActive },
  text: { color: colors.text, fontSize: 13, fontWeight: '700' },
  textActive: { color: colors.text },
});
