// design tokens mapped from the web theme
export const colors = {
  bg: '#0B0B0F',
  card: '#15151D',
  surface: '#161619',
  line: '#242432',
  text: '#FFFFFF',
  textDim: '#A2A2AD',
  primary: '#FF3B6B',
  primaryText: '#0B0B0F',
  success: '#1FC77E',
  warning: '#F7B731',
  danger: '#FF4D4F',
  electricPink: '#FF3B6B',
  electricBlue: '#00B2FF',

  // accents
  pill: '#111827',
  accent: '#ef4444',
  chipBg: '#20202A',
  chipBgActive: '#2B2B31',

  // new for screenshot look
  redTile: '#E5252A',
};

// ✅ added: light theme palette
export const lightColors = {
  ...colors, // copy all keys so nothing breaks
  bg: '#FFFFFF',
  card: '#F5F5F5',
  surface: '#FAFAFA',
  line: '#E5E5E5',
  text: '#000000',
  textDim: '#4A4A4A',
  primary: '#007AFF',
  primaryText: '#FFFFFF',
  chipBg: '#F0F0F0',
  chipBgActive: '#DADADA',
  redTile: '#FF5252',
};

// ✅ added: helper function
export const getColors = (darkMode: boolean) =>
  darkMode ? colors : lightColors;

export const radius = { xs: 8, md: 14, lg: 18, xl: 24, pill: 999 };

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
};
