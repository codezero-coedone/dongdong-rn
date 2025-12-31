const { withAndroidManifest } = require("@expo/config-plugins");

/**
 * Ensure Kakao Native App Key is present in AndroidManifest as meta-data.
 *
 * Some environments/builds can end up missing this meta-data, causing Kakao login
 * to fail silently (no activity launched).
 *
 * <application>
 *   <meta-data android:name="com.kakao.sdk.AppKey" android:value="..." />
 * </application>
 */
module.exports = function withKakaoAppKeyMetaData(config, props = {}) {
  const kakaoAppKey =
    props.kakaoAppKey ||
    process.env.EXPO_PUBLIC_KAKAO_APP_KEY ||
    process.env.KAKAO_APP_KEY;

  if (!kakaoAppKey) return config;

  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const app = manifest.application?.[0];
    if (!app) return cfg;

    const metaData = app["meta-data"] ?? [];
    const name = "com.kakao.sdk.AppKey";

    const existing = metaData.find((m) => m?.$?.["android:name"] === name);
    if (existing) {
      existing.$["android:value"] = kakaoAppKey;
    } else {
      metaData.push({
        $: {
          "android:name": name,
          "android:value": kakaoAppKey,
        },
      });
    }

    app["meta-data"] = metaData;
    return cfg;
  });
};


