module.exports = function (api) {
  api.cache(true);
  return {
    // NativeWind: `nativewind/babel` is a Babel plugin.
    // If this is misconfigured, `className` styling will silently do nothing in Android builds.
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: ["nativewind/babel"],
  };
};


