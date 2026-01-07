import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/features/auth";
import { devlog } from "@/shared/devtools/devlog";

const HERO_TITLE = "안심되는 돌봄 시작";
const HERO_DESC =
  "간병 매칭부터 관리까지 한 곳에서 해결\n보호자·환자 모두에게 편리한 통합 돌봄 서비스 제공";

// 소셜 로그인 버튼
function SocialLoginButton({
  provider,
  onPress,
}: {
  provider: "kakao";
  onPress: () => void;
}) {
  const config = {
    kakao: {
      icon: "💬", // TODO: 카카오 아이콘 교체 필요
      text: "카카오 시작하기",
      bgColor: "#FEE500",
      textColor: "#191919",
    },
  };

  const { icon, text, bgColor, textColor } = config[provider];

  return (
    <Pressable
      onPress={onPress}
      style={[styles.socialBtn, { backgroundColor: bgColor }]}
    >
      <Text style={[styles.socialIcon, { color: textColor }]}>{icon}</Text>
      <Text style={[styles.socialText, { color: textColor }]}>{text}</Text>
    </Pressable>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const socialLogin = useAuthStore((s) => s.socialLogin);
  const isLoading = useAuthStore((s) => s.isLoading);

  const DEVTOOLS_ENABLED = Boolean(__DEV__ || process.env.EXPO_PUBLIC_DEVTOOLS === "1");

  const handleSocialLogin = async () => {
    try {
      if (DEVTOOLS_ENABLED) {
        devlog({ scope: "NAV", level: "info", message: "login: press kakao" });
      }
      await socialLogin("kakao");
      if (DEVTOOLS_ENABLED) {
        devlog({ scope: "NAV", level: "info", message: "login: kakao ok -> /(tabs)" });
      }
      // guardian 앱은 WebView 컨텐츠 앱. 로그인 후 즉시 WebView 탭으로 진입.
      router.replace("/(tabs)");
    } catch (e: any) {
      console.log("social login error:", e);
      if (DEVTOOLS_ENABLED) {
        devlog({
          scope: "NAV",
          level: "error",
          message: "login: kakao fail",
          meta: { status: e?.response?.status, message: e?.response?.data?.message || e?.message },
        });
      }
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "카카오 로그인에 실패했습니다. (Expo Go 불가 / 카카오 키 설정 확인)";
      Alert.alert("오류", String(msg));
    }
  };

  // Mount trace (helps diagnose layout/gesture issues in release builds)
  // NOTE: DEV 관측은 앱 내 DBG(devlog)로 통일한다. (외부 ingest 호출 금지)

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>로그인</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.slide}>
          {/* 텍스트 영역 */}
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>{HERO_TITLE}</Text>
            <Text style={styles.heroDesc}>{HERO_DESC}</Text>
          </View>

          {/* Placeholder 이미지 영역은 UX에 도움되지 않아 제거 (필요 시 추후 실제 일러스트로 교체) */}
          <View style={styles.heroSpacer} />
        </View>
      </View>

      {/* 하단 버튼 영역 */}
      <View style={styles.footer}>
        <View style={{ width: "100%" }}>
          <SocialLoginButton provider="kakao" onPress={handleSocialLogin} />
          {isLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>카카오 로그인 진행 중…</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  body: { flex: 1 },
  slide: { flex: 1, paddingHorizontal: 24, paddingTop: 36 },
  hero: { alignItems: "center", marginBottom: 28 },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 14,
    textAlign: "center",
  },
  heroDesc: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  heroSpacer: { flex: 1 },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28, gap: 14 },
  socialBtn: {
    height: 56,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  socialIcon: { fontSize: 18, marginRight: 8 },
  socialText: { fontSize: 16, fontWeight: "700" },
  loadingRow: { marginTop: 10, alignItems: "center" },
  loadingText: { marginTop: 8, color: "#6B7280" },
});
