import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color, radius } from '../../theme/tokens';

export default function Badge({ title, tone='danger' }: { title: string; tone?: 'danger'|'brand'|'muted' }) {
  const tones = {
    danger: { bg: color.danger, fg: '#fff' },
    brand:  { bg: color.brand, fg: '#fff' },
    muted:  { bg: '#2a2a31', fg: '#fff' },
  }[tone];
  return (
    <View style={[styles.base, { backgroundColor: tones.bg }]}>
      <Text style={[styles.txt, { color: tones.fg }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
  txt: { fontSize: 12, fontWeight: '900' },
});
