import * as React from 'react';
import { Pressable, Text, StyleSheet, Animated } from 'react-native';
import { color, radius } from '../../theme/tokens';

export default function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void; }) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const animate = (to:number) => Animated.spring(scale,{toValue:to,useNativeDriver:true,speed:20,bounciness:8}).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animate(0.98)}
        onPressOut={() => animate(1)}
        android_ripple={{ color: '#ffffff22' }}
        style={[
          styles.base,
          selected ? styles.sel : styles.norm,
        ]}
      >
        <Text style={[styles.txt, selected ? styles.txtSel : styles.txtNorm]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  norm: { backgroundColor: '#141419', borderColor: '#2a2a31' },
  sel:  { backgroundColor: '#ffffff', borderColor: '#ffffff' },
  txt: { fontWeight: '800', letterSpacing: 0.2 },
  txtNorm: { color: '#ffffff' },
  txtSel:  { color: '#111111' },
});
