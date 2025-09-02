// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Safe even if you’re not using Reanimated; must be LAST if present
      'react-native-reanimated/plugin',
    ],
    // If you import code from outside the app folder (monorepo),
    // uncomment the next line so Babel transpiles it for RN:
    // babelrcRoots: [".", "../*"],
  };
};
