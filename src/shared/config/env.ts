/**
 * 환경 변수 설정
 *
 * Expo public env:
 * - EXPO_PUBLIC_API_URL (권장): http://api.dongdong.io:3000/api/v1
 */

const apiUrl =
  process.env.EXPO_PUBLIC_API_URL || "http://api.dongdong.io:3000/api/v1";

export const config = {
  API_URL: apiUrl,
  TIMEOUT: 60000, // 60초
  ENV: __DEV__ ? "development" : "production",
};

export default config;
