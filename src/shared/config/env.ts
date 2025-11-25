/**
 * 환경 변수 설정
 * 실제 프로덕션에서는 expo-constants나 .env 파일을 사용하세요
 */

const ENV = {
  development: {
    API_URL: "https://jsonplaceholder.typicode.com", // 테스트용 Mock API
  },
  staging: {
    API_URL: "https://staging-api.example.com",
  },
  production: {
    API_URL: "https://api.example.com",
  },
};

type Environment = keyof typeof ENV;

// 현재 환경 (실제로는 process.env나 Constants.expoConfig에서 가져옴)
const currentEnv: Environment = __DEV__ ? "development" : "production";

export const config = {
  ...ENV[currentEnv],
  TIMEOUT: 60000, // 60초
  ENV: currentEnv,
};

export default config;
