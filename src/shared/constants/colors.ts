// 앱 전체에서 사용하는 색상 상수
export const COLORS = {
  // Primary
  primary: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6", // 메인 색상
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
  },

  // Gray
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },

  // Status
  success: {
    light: "#D1FAE5",
    main: "#10B981",
    dark: "#059669",
  },
  warning: {
    light: "#FEF3C7",
    main: "#F59E0B",
    dark: "#D97706",
  },
  error: {
    light: "#FEE2E2",
    main: "#EF4444",
    dark: "#DC2626",
  },
  info: {
    light: "#DBEAFE",
    main: "#3B82F6",
    dark: "#2563EB",
  },

  // Background
  background: {
    primary: "#FFFFFF",
    secondary: "#F9FAFB",
    tertiary: "#F3F4F6",
  },

  // Text
  text: {
    primary: "#111827",
    secondary: "#4B5563",
    tertiary: "#9CA3AF",
    disabled: "#D1D5DB",
    inverse: "#FFFFFF",
  },

  // Border
  border: {
    light: "#E5E7EB",
    default: "#D1D5DB",
    dark: "#9CA3AF",
  },

  // Social
  social: {
    kakao: "#FEE500",
    apple: "#000000",
    google: "#FFFFFF",
  },

  // Etc
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

// 타입 export
export type ColorKey = keyof typeof COLORS;
