//Tell to use transformer for svg files
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Tell Metro to use the SVG transformer

module.exports = config;
