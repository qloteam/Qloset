import * as React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'solid' | 'outline' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function Button({ title, onPress, disabled, variant = 'solid', style, textStyle }: Props) {
  const styles = makeStyles();
  const base = [
    styles.base,
    variant === 'solid' && styles.solid,
    variant === 'outline' && styles.outline,
    variant === 'ghost' && styles.ghost,
    disabled && styles.disabled,
    style,
  ];
  const txt = [
    styles.text,
    (variant === 'outline' || variant === 'ghost') && styles.textDark,
    disabled && styles.textDisabled,
    textStyle,
  ];
  return (
    <TouchableOpacity activeOpacity={0.75} onPress={onPress} disabled={disabled} style={base}>
      <Text style={txt}>{title}</Text>
    </TouchableOpacity>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    base: {
      minHeight: 44,
      borderRadius: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    solid: {
      backgroundColor: '#111',
    },
    outline: {
      borderWidth: 1,
      borderColor: '#111',
      backgroundColor: '#fff',
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    text: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
    textDark: {
      color: '#111',
    },
    disabled: {
      opacity: 0.5,
    },
    textDisabled: {},
  });
