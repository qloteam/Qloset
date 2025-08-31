import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { logout } from '../lib/session';
export default function ProfileScreen() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Profile</Text>
      <Text style={{ color: '#c7c7cb' }}>Sign-in, addresses, orders — coming soon.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#121216', padding: 16 },
  h1: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 8 },
});
