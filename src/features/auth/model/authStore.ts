import { secureStorage } from "@/shared/lib/storage";
import { create } from "zustand";
import type { AuthStore, SocialProvider, User } from "./types";

const AUTO_LOGIN_KEY = "auto_login_enabled";

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  autoLoginEnabled: true, // 기본값: 자동 로그인 활성화

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  setToken: (token: string | null) => {
    set({ token });
  },

  setAutoLogin: async (enabled: boolean) => {
    await secureStorage.set(AUTO_LOGIN_KEY, JSON.stringify(enabled));
    set({ autoLoginEnabled: enabled });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // TODO: 실제 API 호출로 대체
      // const response = await authApi.login({ email, password });

      // 임시 Mock 데이터
      const mockUser: User = {
        id: "1",
        email,
        name: email.split("@")[0],
        provider: "email",
      };
      const mockToken = "mock_token_" + Date.now();
      const mockRefreshToken = "mock_refresh_" + Date.now();

      await secureStorage.setToken(mockToken);
      await secureStorage.set("refresh_token", mockRefreshToken);
      await secureStorage.setUser(mockUser);

      set({
        user: mockUser,
        token: mockToken,
        refreshToken: mockRefreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (email: string, password: string, name: string) => {
    set({ isLoading: true });
    try {
      // TODO: 실제 API 호출로 대체
      // const response = await authApi.signup({ email, password, name });

      // 임시 Mock 데이터
      const mockUser: User = {
        id: "1",
        email,
        name,
        provider: "email",
      };
      const mockToken = "mock_token_" + Date.now();
      const mockRefreshToken = "mock_refresh_" + Date.now();

      await secureStorage.setToken(mockToken);
      await secureStorage.set("refresh_token", mockRefreshToken);
      await secureStorage.setUser(mockUser);

      set({
        user: mockUser,
        token: mockToken,
        refreshToken: mockRefreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  socialLogin: async (provider: SocialProvider) => {
    set({ isLoading: true });
    try {
      // TODO: 실제 소셜 로그인 SDK 호출
      // if (provider === 'kakao') {
      //   const kakaoToken = await kakaoLogin();
      //   const response = await authApi.socialLogin({ provider, token: kakaoToken.accessToken });
      // }

      // 임시 Mock 데이터
      const mockUser: User = {
        id: "social_" + Date.now(),
        email: `${provider}_user@example.com`,
        name: `${provider} 사용자`,
        provider,
      };
      const mockToken = "mock_social_token_" + Date.now();
      const mockRefreshToken = "mock_social_refresh_" + Date.now();

      await secureStorage.setToken(mockToken);
      await secureStorage.set("refresh_token", mockRefreshToken);
      await secureStorage.setUser(mockUser);

      set({
        user: mockUser,
        token: mockToken,
        refreshToken: mockRefreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      // 자동 로그인 설정은 유지하고 나머지만 삭제
      const autoLoginEnabled = get().autoLoginEnabled;
      await secureStorage.clearAll();
      await secureStorage.set(AUTO_LOGIN_KEY, JSON.stringify(autoLoginEnabled));

      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  refreshAuth: async () => {
    try {
      const refreshToken = await secureStorage.get("refresh_token");
      if (!refreshToken) return false;

      // TODO: 실제 토큰 갱신 API 호출
      // const response = await authApi.refreshToken({ refreshToken });

      // 임시 Mock: 토큰 갱신 성공
      const newToken = "refreshed_token_" + Date.now();
      const newRefreshToken = "refreshed_refresh_" + Date.now();

      await secureStorage.setToken(newToken);
      await secureStorage.set("refresh_token", newRefreshToken);

      set({
        token: newToken,
        refreshToken: newRefreshToken,
      });

      return true;
    } catch {
      // 토큰 갱신 실패 시 로그아웃
      await get().logout();
      return false;
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // 자동 로그인 설정 확인
      const autoLoginSetting = await secureStorage.get(AUTO_LOGIN_KEY);
      const autoLoginEnabled = autoLoginSetting !== "false"; // 기본값 true

      set({ autoLoginEnabled });

      // 자동 로그인이 비활성화된 경우
      if (!autoLoginEnabled) {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      const [token, refreshToken, user] = await Promise.all([
        secureStorage.getToken(),
        secureStorage.get("refresh_token"),
        secureStorage.getUser<User>(),
      ]);

      if (token && user) {
        // TODO: 토큰 유효성 검증 API 호출
        // 토큰이 만료된 경우 refreshAuth 호출
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else if (refreshToken) {
        // 액세스 토큰이 없지만 리프레시 토큰이 있는 경우 갱신 시도
        const success = await get().refreshAuth();
        if (!success) {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch {
      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
