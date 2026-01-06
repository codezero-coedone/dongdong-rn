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
import "../global.css";

import { useAuthStore } from "@/features/auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { QueryProvider } from "@/shared/lib/react-query";
import { DevOverlay } from "@/shared/devtools/DevOverlay";

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
          style={[styles.forceButton, !updateUrl && styles.forceButtonDisabled]}
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
  const { isAuthenticated, isLoading, isSignupComplete } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/permission");
    } else if (isAuthenticated && !isSignupComplete && !inAuthGroup) {
      // 로그인 후, RN 네이티브 회원가입(환자등록) 완료 전에는 WebView로 가지 않는다.
      router.replace("/(auth)/role-selection");
    } else if (isAuthenticated && isSignupComplete && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isSignupComplete, isLoading, segments, router]);
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

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
        <DevOverlay />
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
    backgroundColor: "#0B1220",
    padding: 20,
  },
  forceCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  forceTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  forceDesc: {
    marginTop: 8,
    fontSize: 14,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 20,
  },
  forceMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  forceMetaLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
  },
  forceMetaValue: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  forceButton: {
    marginTop: 8,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  forceButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  forceButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  forceHint: {
    marginTop: 10,
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    lineHeight: 16,
  },
});


