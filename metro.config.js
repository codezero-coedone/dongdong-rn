const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// NOTE:
// NativeWind v4 uses a Babel plugin (`nativewind/babel`) for native.
// In EAS, the `nativewind/metro` wrapper can hang Metro bundling at 0%.
// Keep Metro config minimal and deterministic.
module.exports = config;
