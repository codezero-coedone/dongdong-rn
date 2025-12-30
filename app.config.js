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

  if (!hasUpdatesPlugin) {
    plugins.push("expo-updates");
  }

  if (kakaoAppKey && !hasKakaoPlugin) {
    plugins.push([
      "@react-native-seoul/kakao-login",
      { kakaoAppKey, kotlinVersion: "1.9.0" },
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


