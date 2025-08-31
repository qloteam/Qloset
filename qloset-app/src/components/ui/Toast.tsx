import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from './colors';

type ToastCtx = { show: (msg: string) => void };
const Ctx = createContext<ToastCtx>({ show: () => {} });

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const y = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const show = (m: string) => {
    setMsg(m);
    Animated.parallel([
      Animated.timing(y, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(y, { toValue: 60, duration: 180, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        ]).start(() => setMsg(null));
      }, 1500);
    });
  };

  const value = useMemo(() => ({ show }), []);

  return (
    <Ctx.Provider value={value}>
      {children}
      {msg ? (
        <Animated.View style={[styles.wrap, { transform: [{ translateY: y }], opacity }]}>
          <Text style={styles.text}>{msg}</Text>
        </Animated.View>
      ) : null}
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: '#272733',
    borderColor: '#313144',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  text: { color: colors.text, textAlign: 'center', fontWeight: '700' },
});
