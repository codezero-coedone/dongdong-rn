export type SocialProvider = "kakao";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider?: SocialProvider | "email"; // 로그인 제공자
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  autoLoginEnabled: boolean; // 자동 로그인 설정
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  socialLogin: (provider: SocialProvider) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshAuth: () => Promise<boolean>; // 토큰 갱신
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAutoLogin: (enabled: boolean) => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}
