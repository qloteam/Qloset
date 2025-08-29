import * as React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';

export default function HeroBanner({
  title = 'Try Before You Buy',
  subtitle = 'Available in T. Nagar / Pondy Bazaar',
  onPress,
  image,
}: { title?: string; subtitle?: string; onPress?: () => void; image?: string }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.wrap}>
      <ImageBackground
        source={image ? { uri: image } : require('../../assets/placeholder.png')}
        imageStyle={{ borderRadius: 16 }}
        style={styles.bg}
      >
        <View style={styles.overlay} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{subtitle}</Text>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginBottom: 12 },
  bg: { height: 160, borderRadius: 16, overflow: 'hidden', padding: 16, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  title: { color: '#fff', fontSize: 22, fontWeight: '900' },
  sub: { color: '#e5e5e5', marginTop: 2, fontWeight: '600' },
});
