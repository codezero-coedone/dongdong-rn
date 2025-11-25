import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

/**
 * Web에서는 SecureStore를 사용할 수 없으므로 localStorage 폴백
 */
const isWeb = Platform.OS === "web";

export const secureStorage = {
  async getToken(): Promise<string | null> {
    try {
      if (isWeb) {
        return localStorage.getItem(TOKEN_KEY);
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Failed to get token:", error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      if (isWeb) {
        localStorage.setItem(TOKEN_KEY, token);
        return;
      }
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error("Failed to set token:", error);
    }
  },

  async removeToken(): Promise<void> {
    try {
      if (isWeb) {
        localStorage.removeItem(TOKEN_KEY);
        return;
      }
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Failed to remove token:", error);
    }
  },

  async getUser<T>(): Promise<T | null> {
    try {
      let userJson: string | null;
      if (isWeb) {
        userJson = localStorage.getItem(USER_KEY);
      } else {
        userJson = await SecureStore.getItemAsync(USER_KEY);
      }
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error("Failed to get user:", error);
      return null;
    }
  },

  async setUser<T>(user: T): Promise<void> {
    try {
      const userJson = JSON.stringify(user);
      if (isWeb) {
        localStorage.setItem(USER_KEY, userJson);
        return;
      }
      await SecureStore.setItemAsync(USER_KEY, userJson);
    } catch (error) {
      console.error("Failed to set user:", error);
    }
  },

  async removeUser(): Promise<void> {
    try {
      if (isWeb) {
        localStorage.removeItem(USER_KEY);
        return;
      }
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
      console.error("Failed to remove user:", error);
    }
  },

  async clearAll(): Promise<void> {
    await Promise.all([this.removeToken(), this.removeUser()]);
  },
};
