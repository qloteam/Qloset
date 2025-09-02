// metro.config.js — Expo
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Keep this false — the experimental resolver can break Babel helpers on Hermes
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
