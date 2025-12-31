const { withAndroidManifest, AndroidConfig } = require("@expo/config-plugins");

/**
 * Force allow HTTP (cleartext) traffic on Android.
 *
 * Some builds did not reflect `android.usesCleartextTraffic=true` from app.json,
 * causing Axios "Network Error" when calling http://api.dongdong.io:3000/...
 *
 * This plugin explicitly sets:
 *   <application android:usesCleartextTraffic="true" />
 */
module.exports = function withCleartextTraffic(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    app.$["android:usesCleartextTraffic"] = "true";
    return config;
  });
};


