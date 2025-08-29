import * as React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

export default function Badge({
  title, tone = 'danger', style, textStyle,
}: { title: string; tone?: 'danger'|'brand'|'muted'; style?: ViewStyle; textStyle?: TextStyle }) {
  const tones = {
    danger: { bg: '#ef4444', fg: '#fff' },
    brand:  { bg: '#111', fg: '#fff' },
    muted:  { bg: '#e5e7eb', fg: '#111' },
  }[tone];
  return (
    <View style={[styles.base, { backgroundColor: tones.bg }, style]}>
      <Text style={[styles.txt, { color: tones.fg }, textStyle]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  txt: { fontSize: 12, fontWeight: '800', letterSpacing: 0.2 },
});
