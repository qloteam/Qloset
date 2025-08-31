import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius } from './colors';

type Props = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'solid' | 'outline' | 'ghost';
  style?: ViewStyle;
};

export default function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = 'solid',
  style,
}: Props) {
  const isSolid = variant === 'solid';
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        isSolid && styles.solid,
        isOutline && styles.outline,
        variant === 'ghost' && styles.ghost,
        disabled && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isSolid ? colors.primaryText : colors.text} />
      ) : (
        <Text
          style={[
            styles.text,
            isSolid && { color: colors.primaryText },
            !isSolid && { color: colors.text },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  solid: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.line,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  text: {
    fontWeight: '800',
    fontSize: 16,
  },
});
