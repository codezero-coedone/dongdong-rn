import { secureStorage } from "@/shared/lib/storage";
import { create } from "zustand";
import type { AuthStore, User } from "./types";

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  setToken: (token: string | null) => {
    set({ token });
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
      };
      const mockToken = "mock_token_" + Date.now();

      await secureStorage.setToken(mockToken);
      await secureStorage.setUser(mockUser);

      set({
        user: mockUser,
        token: mockToken,
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
      };
      const mockToken = "mock_token_" + Date.now();

      await secureStorage.setToken(mockToken);
      await secureStorage.setUser(mockUser);

      set({
        user: mockUser,
        token: mockToken,
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
      await secureStorage.clearAll();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const [token, user] = await Promise.all([
        secureStorage.getToken(),
        secureStorage.getUser<User>(),
      ]);

      if (token && user) {
        // TODO: 토큰 유효성 검증 API 호출
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
