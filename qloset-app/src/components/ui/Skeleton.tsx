import * as React from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  type DimensionValue,
} from 'react-native';
import { radius } from '../../theme/tokens';

type Props = {
  height?: number;
  width?: DimensionValue;   // number | string (e.g., '100%')
  radiusOverride?: number;
};

export default function Skeleton({
  height = 16,
  width = '100%',
  radiusOverride,
}: Props) {
  const shimmer = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false, // color interpolation needs false
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  // Animated color (interpolated). TS doesn't like animated values in a ViewStyle,
  // so we cast just this one when passing the style below.
  const bg = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1b1b20', '#24242a'],
  });

  return (
    <Animated.View
      style={[
        styles.base,
        {
          height,
          width, // DimensionValue (number | string)
          borderRadius: radiusOverride ?? radius.md,
          backgroundColor: bg as any, // <-- allow animated color
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {},
});
