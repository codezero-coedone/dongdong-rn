// SecureStore 및 AsyncStorage 키 상수
export const STORAGE_KEYS = {
  // Auth
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
  AUTO_LOGIN: "auto_login_enabled",

  // Onboarding
  ONBOARDING_COMPLETE: "onboarding_complete",
  ONBOARDING_SLIDES_COMPLETE: "onboarding_slides_complete",
  FIRST_LAUNCH: "first_launch",

  // Settings
  NOTIFICATION_ENABLED: "notification_enabled",
  LANGUAGE: "language",
  THEME: "theme",

  // Cache
  CAREGIVER_DRAFT: "caregiver_registration_draft",
  GUARDIAN_DRAFT: "guardian_registration_draft",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
