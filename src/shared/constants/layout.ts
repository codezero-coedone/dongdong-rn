import { Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

// 디바이스 크기
export const SCREEN = {
  WIDTH: width,
  HEIGHT: height,
  IS_SMALL: width < 375,
  IS_LARGE: width >= 428,
} as const;

// 간격
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// 패딩
export const PADDING = {
  horizontal: 24, // px-6
  vertical: 16,
  screen: 24,
} as const;

// Border Radius
export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Shadow
export const SHADOW = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  button: {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// 컴포넌트 높이
export const HEIGHT = {
  input: 56, // h-14
  button: 56,
  header: 56,
  tabBar: 60,
  bottomSheet: height * 0.5,
} as const;

// Font Size
export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// z-index
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 30,
  toast: 40,
  tooltip: 50,
} as const;

// Platform
export const IS_IOS = Platform.OS === "ios";
export const IS_ANDROID = Platform.OS === "android";
export const IS_WEB = Platform.OS === "web";
