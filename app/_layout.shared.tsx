import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import "react-native-reanimated";
import "../global.css";

import { useAuthStore } from "@/features/auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { QueryProvider } from "@/shared/lib/react-query";
import { DevOverlay } from "@/shared/devtools/DevOverlay";
import { devlog } from "@/shared/devtools/devlog";
import { secureStorage } from "@/shared/lib/storage";
import { STORAGE_KEYS } from "@/shared/constants/storage";

// ==========================================================
// Typography defaults (pixel alignment)
// - Prevent Android extra font padding from shifting baselines.
// - Prevent device fontScale differences from making Guardian/Caregiver look mismatched.
// ==========================================================
try {
  (Text as any).defaultProps = (Text as any).defaultProps || {};
  (Text as any).defaultProps.allowFontScaling = false;
  (Text as any).defaultProps.style = [
    Platform.OS === "android" ? { includeFontPadding: false } : null,
    (Text as any).defaultProps.style,
  ].filter(Boolean);

  (TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
  (TextInput as any).defaultProps.allowFontScaling = false;
  (TextInput as any).defaultProps.style = [
    Platform.OS === "android" ? { includeFontPadding: false } : null,
    (TextInput as any).defaultProps.style,
  ].filter(Boolean);
} catch {
  // ignore
}

/**
 * ============================================
 * SEALED GUARDRAILS (v0.1) — DO NOT BREAK
 * ============================================
 * - Guardian 앱은 "WebView 컨테이너"다.
 * - 토큰/인증 소유권은 RN 앱이 단일 소유한다.
 * - 공통 경계선(분기 금지): 온보딩 → 권한 → 카카오 → SMS → 인증완료
 * - v0.1 Guardian은 인증 전에는 permission(1회) → login 으로만 이동한다(권한 루프 금지).
 * - (auth) 내의 네이티브 환자등록/role-selection 등은 v0.1 플로우에서 사용 금지(Dead path).
 *   정리는 v0.1 완주 후 일괄 처리한다.
 */

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
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "onboarding";

    const DEVTOOLS_ENABLED = Boolean(__DEV__ || process.env.EXPO_PUBLIC_DEVTOOLS === "1");

    // 온보딩(슬라이드) + 권한 온보딩은 1회만 노출 (무한 루프 방지)
    const decide = async () => {
      let onboardingComplete = false;
      let slidesComplete = false;
      try {
        const [v1, v2] = await Promise.all([
          secureStorage.get(STORAGE_KEYS.ONBOARDING_COMPLETE),
          secureStorage.get(STORAGE_KEYS.ONBOARDING_SLIDES_COMPLETE),
        ]);
        onboardingComplete = v1 === "1" || v1 === "true";
        slidesComplete = v2 === "1" || v2 === "true";
      } catch {
        onboardingComplete = false;
        slidesComplete = false;
      }

      if (DEVTOOLS_ENABLED) {
        devlog({
          scope: "NAV",
          level: "info",
          message: `route: auth=${String(isAuthenticated)} loading=${String(isLoading)} slides=${String(slidesComplete)} perm=${String(onboardingComplete)} seg=${segments.join("/")}`,
        });
      }

      if (!isAuthenticated) {
        // 미인증 상태: 첫 실행에는 온보딩(2a/2b/2c) → 권한(1회) → 로그인(온보딩 step3)
        const target = !slidesComplete
          ? "/onboarding"
          : !onboardingComplete
            ? "/(auth)/permission"
            : "/onboarding/step3";

        // Allow-list: auth(permission), onboarding(1~3)
        const inAllowedAuth =
          inAuthGroup && (segments[1] === "permission" || segments[1] === "login");
        const inAllowedOnboarding = inOnboardingGroup;

        if (!inAllowedAuth && !inAllowedOnboarding) {
          router.replace(target);
          return;
        }

        // If permission already done, do not stay on permission screen.
        if (inAuthGroup && segments[1] === "permission" && onboardingComplete) {
          router.replace("/onboarding/step3");
          return;
        }

        // If slides not done, do not allow jumping into auth screens (permission/login) yet.
        // Onboarding(2a/2b/2c) 안에서는 자유롭게 이동(push) 가능해야 한다.
        if (!slidesComplete && inAuthGroup) {
          router.replace("/onboarding");
          return;
        }

        // If slides done and permission done, do not stay on onboarding step1/2.
        if (slidesComplete && onboardingComplete && inOnboardingGroup && segments[1] !== "step3") {
          router.replace("/onboarding/step3");
          return;
        }
        return;
      }

      // 인증 완료면 auth 그룹을 벗어나 탭으로
      if (isAuthenticated && (inAuthGroup || inOnboardingGroup)) {
        router.replace("/(tabs)");
      }
    };

    void decide();
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
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [bootReady, setBootReady] = useState<boolean>(false);

  const appVersion = getAppVersion();
  const minVersion = process.env.EXPO_PUBLIC_MIN_APP_VERSION || "1.0.0";
  const updateUrl = getUpdateUrl();
  const needsUpdate = compareSemver(appVersion, minVersion) < 0;

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useProtectedRoute();

  // ==========================================================
  // Boot route stabilization gate
  // - Prevents "brief wrong screen flash then redirect" on cold start.
  // - We keep showing LoadingScreen until we are sitting on the correct flow group
  //   (onboarding/permission/login vs tabs) for the current auth state.
  // ==========================================================
  useEffect(() => {
    if (isLoading) {
      setBootReady(false);
      return;
    }

    const decide = async () => {
      let onboardingComplete = false;
      let slidesComplete = false;
      try {
        const [v1, v2] = await Promise.all([
          secureStorage.get(STORAGE_KEYS.ONBOARDING_COMPLETE),
          secureStorage.get(STORAGE_KEYS.ONBOARDING_SLIDES_COMPLETE),
        ]);
        onboardingComplete = v1 === "1" || v1 === "true";
        slidesComplete = v2 === "1" || v2 === "true";
      } catch {
        onboardingComplete = false;
        slidesComplete = false;
      }

      const seg0 = segments[0] || "";
      const seg1 = segments[1] || "";

      // Authenticated → must be in tabs (no onboarding/auth flashes)
      if (isAuthenticated) {
        const ok = seg0 === "(tabs)";
        if (!ok) {
          setBootReady(false);
          router.replace("/(tabs)");
          return;
        }
        setBootReady(true);
        return;
      }

      // Unauthenticated → must be in onboarding or permission/login per SSOT
      const target = !slidesComplete
        ? "/onboarding"
        : !onboardingComplete
          ? "/(auth)/permission"
          : "/onboarding/step3";

      const inAuthGroup = seg0 === "(auth)";
      const inOnboardingGroup = seg0 === "onboarding";

      const inAllowedAuth =
        inAuthGroup && (seg1 === "permission" || seg1 === "login");
      const inAllowedOnboarding = inOnboardingGroup;

      const ok = inAllowedAuth || inAllowedOnboarding;
      if (!ok) {
        setBootReady(false);
        router.replace(target);
        return;
      }
      setBootReady(true);
    };

    void decide();
  }, [isLoading, isAuthenticated, segments, router]);

  if (isLoading || !bootReady) {
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


