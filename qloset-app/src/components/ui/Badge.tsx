import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius } from './colors';

type Props = {
  text: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
  style?: ViewStyle;
};

export default function Badge({ text, tone = 'default', style }: Props) {
  const bg =
    tone === 'success'
      ? colors.success
      : tone === 'warning'
      ? colors.warning
      : tone === 'danger'
      ? colors.danger
      : colors.chipBg;

  const fg = tone === 'default' ? colors.text : colors.primaryText;

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: fg }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.xl,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '800' },
});
