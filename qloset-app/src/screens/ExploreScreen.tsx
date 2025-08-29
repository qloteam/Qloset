import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ExploreScreen() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Explore</Text>
      <Text style={{ color: '#c7c7cb' }}>Coming soon… curated collections and more.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#121216', padding: 16 },
  h1: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 8 },
});
