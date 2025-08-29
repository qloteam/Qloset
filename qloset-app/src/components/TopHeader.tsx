import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TopHeader({ title = 'Qloset', subtitle }: { title?: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  sub: {
    marginTop: 2,
    color: '#555',
  },
});
