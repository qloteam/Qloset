import * as React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, Animated } from 'react-native';
import { color, radius } from '../../theme/tokens';

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'solid' | 'outline' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function Button({ title, onPress, disabled, variant = 'solid', style, textStyle }: Props) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const animate = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 20, bounciness: 6 }).start();

  const bg =
    variant === 'solid' ? { backgroundColor: color.brand } :
    variant === 'outline' ? { backgroundColor: 'transparent', borderWidth: 1, borderColor: color.text } :
    { backgroundColor: 'transparent' };

  const txt =
    variant === 'solid' ? { color: '#fff' } :
    { color: color.text };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        android_ripple={{ color: '#ffffff22' }}
        onPressIn={() => animate(0.98)}
        onPressOut={() => animate(1)}
        disabled={disabled}
        style={[styles.base, bg, disabled && { opacity: 0.5 }, style]}
      >
        <Text style={[styles.text, txt, textStyle]}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontWeight: '800', fontSize: 16 },
});
