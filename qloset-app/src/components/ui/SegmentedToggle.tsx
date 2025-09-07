import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from './colors';

type Option = { label: string; value: string };
type Props = {
  value: string;
  onChange: (v: string) => void;
  options?: Option[];
  activeColors?: Record<string, string>;
};

export default function SegmentedToggle({
  value,
  onChange,
  options = [
    { label: 'MAN', value: 'Men' },
    { label: 'WOMAN', value: 'Women' },
  ],
  activeColors,
}: Props) {
  const map = activeColors ?? { Men: colors.electricBlue, Women: colors.electricPink };

  return (
    <View style={styles.wrap}>
      {options.map(o => {
        const active = value === o.value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.btn, active && { backgroundColor: map[o.value] }]}
          >
            <Text style={[styles.txt, active && styles.txtActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#1a1c22',
    borderRadius: 999,
    padding: 3,
    flexDirection: 'row',
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 999,
  },
  txt: { color: '#a7a7b0', fontWeight: '900', letterSpacing: 0.6 },
  txtActive: { color: colors.text },
});
