module.exports = function (api) {
  api.cache(true);
  return {
    // NativeWind v4:
    // - Keep `jsxImportSource: "nativewind"` on the Expo preset.
    // - `nativewind/babel` must be used as a *preset* (it expands to underlying plugins).
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Reanimated is included in deps; keep its plugin last for safety (no-op if unused).
    plugins: ["react-native-reanimated/plugin"],
  };
};


