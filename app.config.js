// Dynamic Expo config to avoid hardcoding secrets in repo.
// - API base: EXPO_PUBLIC_API_URL (used in code)
// - Kakao native app key: EXPO_PUBLIC_KAKAO_APP_KEY (or KAKAO_APP_KEY)
//
// Note: @react-native-seoul/kakao-login requires a development build (not Expo Go).

const appJson = require("./app.json");

module.exports = () => {
  const base = appJson.expo || {};
  const kakaoAppKey =
    process.env.EXPO_PUBLIC_KAKAO_APP_KEY || process.env.KAKAO_APP_KEY;

  const plugins = Array.isArray(base.plugins) ? [...base.plugins] : [];
  const hasUpdatesPlugin = plugins.some((p) => {
    if (typeof p === "string") return p === "expo-updates";
    if (Array.isArray(p)) return p[0] === "expo-updates";
    return false;
  });

  const hasKakaoPlugin = plugins.some((p) => {
    if (typeof p === "string") return p === "@react-native-seoul/kakao-login";
    if (Array.isArray(p)) return p[0] === "@react-native-seoul/kakao-login";
    return false;
  });

  const hasCleartextPlugin = plugins.some((p) => {
    if (typeof p === "string") return p === "./plugins/withCleartextTraffic";
    if (Array.isArray(p)) return p[0] === "./plugins/withCleartextTraffic";
    return false;
  });

  if (!hasUpdatesPlugin) {
    plugins.push("expo-updates");
  }

  // Allow HTTP API calls on Android 9+ (required for current DEV server: http://api.dongdong.io:3000)
  if (!hasCleartextPlugin) {
    plugins.push("./plugins/withCleartextTraffic");
  }

  if (kakaoAppKey && !hasKakaoPlugin) {
    // Force-inject Kakao AppKey meta-data to avoid "no-op" login on some devices/builds.
    plugins.push(["./plugins/withKakaoAppKeyMetaData", { kakaoAppKey }]);

    plugins.push([
      "@react-native-seoul/kakao-login",
      // IMPORTANT: This MUST be a Kotlin version supported by Expo's expo-root-project KSP mapping.
      // If omitted, this plugin can fall back to an old Kotlin (e.g. 1.5.x) and break the build:
      // "Can't find KSP version for Kotlin version ..."
      // If set to an older-but-mapped Kotlin (e.g. 2.0.x), we observed KSP internal compiler errors.
      // Use a current mapped Kotlin version.
      { kakaoAppKey, kotlinVersion: "2.2.10" },
    ]);
  }

  return {
    ...base,
    plugins,
    runtimeVersion: base.runtimeVersion ?? { policy: "appVersion" },
    updates: {
      ...(base.updates || {}),
      fallbackToCacheTimeout: 0,
    },
  };
};


