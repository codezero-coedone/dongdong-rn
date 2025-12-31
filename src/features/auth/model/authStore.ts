import { secureStorage } from "@/shared/lib/storage";
import { apiClient } from "@/shared/api/client";
import { create } from "zustand";
import type { AuthStore, SocialProvider, User } from "./types";
import { login as kakaoNativeLogin } from "@react-native-seoul/kakao-login";

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

    const formatKakaoError = (e: unknown): Error => {
      const raw = (e as any)?.message ? String((e as any).message) : String(e);
      if (/keyhash/i.test(raw)) {
        return new Error(
          [
            "Android keyhash가 Kakao Developers 콘솔에 등록되지 않았습니다.",
            "",
            "조치:",
            "- Kakao Developers > 내 애플리케이션 > 플랫폼(Android)",
            "- 패키지: kr.slicemind.dongdong.guardian",
            "- 현재 설치 채널(Play 내부테스트/사이드로드)에 맞는 keyhash를 추가 등록",
            "",
            "등록 후 앱을 재설치(Play 내부테스트 링크)하고 다시 시도해 주세요.",
          ].join("\n"),
        );
      }
      return new Error(raw || "카카오 로그인에 실패했습니다.");
    };

    try {
      if (provider !== "kakao") {
        throw new Error("현재는 카카오 로그인만 지원합니다.");
      }

      if (typeof kakaoNativeLogin !== "function") {
        throw new Error(
          "카카오 로그인 모듈이 로딩되지 않았습니다. (Expo Go 불가 / 빌드 시 EXPO_PUBLIC_KAKAO_APP_KEY 설정 필요)",
        );
      }

      const withTimeout = async <T,>(p: Promise<T>, ms: number): Promise<T> => {
        let t: any;
        try {
          return await Promise.race([
            p,
            new Promise<T>((_, reject) => {
              t = setTimeout(() => {
                reject(
                  new Error(
                    "카카오 로그인 화면이 열리지 않습니다. (카카오톡/Chrome 설치 여부를 확인해 주세요)",
                  ),
                );
              }, ms);
            }),
          ]);
        } finally {
          if (t) clearTimeout(t);
        }
      };

      const kakaoToken: any = await withTimeout(kakaoNativeLogin(), 12000);
      const accessToken: string | undefined = kakaoToken?.accessToken;
      if (!accessToken) {
        throw new Error("카카오 accessToken을 가져올 수 없습니다.");
      }

      const res = await apiClient.post("/auth/social", {
        provider: "KAKAO",
        accessToken,
      });

      const data = (res as any)?.data?.data;
      const access_token: string | undefined = data?.access_token;
      const refresh_token: string | undefined = data?.refresh_token;
      const u = data?.user;

      if (!access_token || !refresh_token || !u) {
        throw new Error("서버 응답 형식이 올바르지 않습니다.");
      }

      const user: User = {
        id: String(u.id),
        email: u.email ?? null,
        name: u.name ?? "",
        provider: "kakao",
      } as any;

      await secureStorage.setToken(access_token);
      await secureStorage.set("refresh_token", refresh_token);
      await secureStorage.setUser(user);

      set({
        user,
        token: access_token,
        refreshToken: refresh_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw formatKakaoError(error);
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

      const res = await apiClient.post("/auth/refresh", {
        refresh_token: refreshToken,
      });
      const data = (res as any)?.data?.data;
      const access_token: string | undefined = data?.access_token;
      const refresh_token: string | undefined = data?.refresh_token;
      if (!access_token || !refresh_token) return false;

      await secureStorage.setToken(access_token);
      await secureStorage.set("refresh_token", refresh_token);
      set({ token: access_token, refreshToken: refresh_token });
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
