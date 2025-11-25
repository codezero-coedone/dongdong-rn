import "../global.css";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import "react-native-reanimated";

import { useAuthStore } from "@/features/auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { QueryProvider } from "@/shared/lib/react-query";

function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // 비로그인 상태 + 인증 그룹 밖 → 로그인 페이지로
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // 로그인 상태 + 인증 그룹 안 → 홈으로
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments, router]);
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isLoading, checkAuth } = useAuthStore();

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 인증 기반 라우팅
  useProtectedRoute();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <QueryProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              title: "Modal",
              headerShown: true,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
