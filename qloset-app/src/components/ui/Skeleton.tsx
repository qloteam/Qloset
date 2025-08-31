import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle, View } from 'react-native';
import { radius } from './colors';

type Props = { style?: ViewStyle };

export default function Skeleton({ style }: Props) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.base, { opacity }, style]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#22222C',
    borderRadius: radius.md,
  },
});
