import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import { colors, radius } from './colors';

export default function ImageCapsule({ title, uri }: { title: string; uri: string }) {
  return (
    <View style={styles.wrap}>
      <Image source={{ uri }} style={styles.img} />
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 170, marginRight: 12 },
  img: { width: '100%', height: 110, borderRadius: radius.lg, backgroundColor: '#222' },
  title: { color: colors.text, marginTop: 8, fontWeight: '800' },
});
