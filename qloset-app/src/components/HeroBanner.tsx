import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { color, radius, shadow } from '../theme/tokens';

export default function HeroBanner({
  title = 'Try Before You Buy',
  subtitle = 'Free size trial at your doorstep',
  onPress,
  image,
}: { title?: string; subtitle?: string; onPress?: () => void; image?: string }) {
  return (
    <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={styles.wrap}>
      <View style={[styles.card, shadow.card]}>
        <Image
          source={image || 'https://picsum.photos/1200/800'}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={120}
        />
        <LinearGradient
          colors={['transparent','rgba(0,0,0,0.55)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ marginTop: 'auto', padding: 16 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>{subtitle}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginBottom: 12 },
  card: { height: 160, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: color.card },
  title: { color: '#fff', fontSize: 22, fontWeight: '900' },
  sub: { color: '#e5e5e5', marginTop: 2, fontWeight: '600' },
});
