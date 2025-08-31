import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, radius } from './colors';

export default function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textDim}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: '#1A1A22',
    color: colors.text,
    borderWidth: 1,
    borderColor: '#222231',
  },
});
