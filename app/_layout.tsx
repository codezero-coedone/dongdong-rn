import "../global.css";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import "react-native-reanimated";

import { useAuthStore } from "@/features/auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { QueryProvider } from "@/shared/lib/react-query";

function parseSemver(v: string): [number, number, number] {
  const parts = String(v || "")
    .trim()
    .split(".")
    .map((p) => Number(String(p).replace(/[^\d]/g, "")));
  const a = typeof parts[0] === "number" && !isNaN(parts[0]) ? parts[0] : 0;
  const b = typeof parts[1] === "number" && !isNaN(parts[1]) ? parts[1] : 0;
  const c = typeof parts[2] === "number" && !isNaN(parts[2]) ? parts[2] : 0;
  return [a, b, c];
}

function compareSemver(a: string, b: string): number {
  const [a0, a1, a2] = parseSemver(a);
  const [b0, b1, b2] = parseSemver(b);
  if (a0 !== b0) return a0 - b0;
  if (a1 !== b1) return a1 - b1;
  return a2 - b2;
}

function getAppVersion(): string {
  const v =
    (Constants as any)?.expoConfig?.version ||
    (Constants as any)?.manifest?.version ||
    "0.0.0";
  return String(v);
}

function getUpdateUrl(): string | null {
  const platformUrl =
    Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_IOS_UPDATE_URL
      : process.env.EXPO_PUBLIC_ANDROID_UPDATE_URL;
  const url = platformUrl || process.env.EXPO_PUBLIC_UPDATE_URL;
  return url && String(url).trim() ? String(url).trim() : null;
}

function ForceUpdateScreen({
  appVersion,
  minVersion,
  updateUrl,
}: {
  appVersion: string;
  minVersion: string;
  updateUrl: string | null;
}) {
  return (
    <View style={styles.forceContainer}>
      <View style={styles.forceCard}>
        <Text style={styles.forceTitle}>업데이트가 필요합니다</Text>
        <Text style={styles.forceDesc}>
          안정적인 서비스 이용을 위해 앱 업데이트가 필요합니다.
        </Text>
        <View style={{ height: 12 }} />
        <View style={styles.forceMetaRow}>
          <Text style={styles.forceMetaLabel}>현재 버전</Text>
          <Text style={styles.forceMetaValue}>{appVersion}</Text>
        </View>
        <View style={styles.forceMetaRow}>
          <Text style={styles.forceMetaLabel}>최소 버전</Text>
          <Text style={styles.forceMetaValue}>{minVersion}</Text>
        </View>
        <View style={{ height: 16 }} />
        <Pressable
          disabled={!updateUrl}
          onPress={() => {
            if (!updateUrl) return;
            Linking.openURL(updateUrl).catch(() => {});
          }}
          style={[
            styles.forceButton,
            !updateUrl && styles.forceButtonDisabled,
          ]}
        >
          <Text style={styles.forceButtonText}>
            {updateUrl ? "업데이트" : "업데이트 링크 필요"}
          </Text>
        </Pressable>
        {!updateUrl && (
          <Text style={styles.forceHint}>
            스토어/다운로드 링크가 설정되지 않았습니다.
          </Text>
        )}
      </View>
    </View>
  );
}

function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // 비로그인 상태 + 인증 그룹 밖 → 권한 페이지로
      router.replace("/(auth)/permission");
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

  const appVersion = getAppVersion();
  const minVersion = process.env.EXPO_PUBLIC_MIN_APP_VERSION || "1.0.0";
  const updateUrl = getUpdateUrl();
  const needsUpdate = compareSemver(appVersion, minVersion) < 0;

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 인증 기반 라우팅
  useProtectedRoute();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (needsUpdate) {
    return (
      <ForceUpdateScreen
        appVersion={appVersion}
        minVersion={minVersion}
        updateUrl={updateUrl}
      />
    );
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
  forceContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  forceCard: {
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#fff",
  },
  forceTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  forceDesc: {
    marginTop: 8,
    color: "#6B7280",
    lineHeight: 18,
  },
  forceMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  forceMetaLabel: { color: "#6B7280" },
  forceMetaValue: { color: "#111827", fontWeight: "700" },
  forceButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  forceButtonDisabled: { backgroundColor: "#93C5FD" },
  forceButtonText: { color: "#fff", fontWeight: "800" },
  forceHint: {
    marginTop: 10,
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
  },
});
