import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { color } from './tokens';

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: color.bg,
    card: color.card,
    primary: color.text,
    text: color.text,
    border: color.line,
  },
};

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NavThemeProvider value={navTheme as any}>
      <StatusBar style="light" />
      {children}
    </NavThemeProvider>
  );
}
