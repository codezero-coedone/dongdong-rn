// 앱 정보
export const APP = {
  NAME: "동동",
  VERSION: "1.0.0",
  BUILD: "1",
} as const;

// API 관련
export const API = {
  BASE_URL: __DEV__
    ? "http://localhost:3000/api"
    : "https://api.dongdong.com/api",
  TIMEOUT: 30000, // 30초
} as const;

// 인증 관련
export const AUTH = {
  TOKEN_EXPIRY: 60 * 60 * 1000, // 1시간
  REFRESH_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7일
  VERIFICATION_TIMEOUT: 180, // 3분 (초)
  VERIFICATION_RESEND_DELAY: 60, // 1분 (초)
} as const;

// 유효성 검사 규칙
export const VALIDATION = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 20,
  },
  PHONE: {
    LENGTH: 13, // 010-1234-5678
    PATTERN: /^010-\d{4}-\d{4}$/,
  },
  BIRTH_DATE: {
    LENGTH: 8, // YYYYMMDD
    PATTERN: /^\d{8}$/,
  },
  INTRODUCTION: {
    MAX_LENGTH: 200,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 20,
    PATTERN: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  },
} as const;

// 페이지네이션
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// 이미지
export const IMAGE = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
  QUALITY: 0.8,
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1080,
} as const;
