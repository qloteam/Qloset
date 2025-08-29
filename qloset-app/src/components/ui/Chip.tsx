import * as React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function Chip({ label, selected, onPress, style, textStyle }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.base, selected ? styles.sel : styles.norm, style]}
    >
      <Text style={[styles.txt, selected ? styles.txtSel : styles.txtNorm, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  norm: { backgroundColor: '#fff', borderColor: '#ddd' },
  sel:  { backgroundColor: '#111', borderColor: '#111' },
  txt: { fontWeight: '700' },
  txtNorm: { color: '#111' },
  txtSel:  { color: '#fff' },
});
