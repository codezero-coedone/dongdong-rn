module.exports = function (api) {
  api.cache(true);
  return {
    // NativeWind v4: use as a preset (it returns { plugins: [...] }),
    // not as a Babel plugin entry (which would error in CI/EAS).
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
    plugins: [],
  };
};


