//Tell to use transformer for svg files
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Tell Metro to use the SVG transformer
config.transformer.babelTransformerPath =
  require.resolve("react-native-svg-transformer");

// Remove 'svg' from assetExts and add it to sourceExts so it's treated as code
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg",
);
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

module.exports = config;
