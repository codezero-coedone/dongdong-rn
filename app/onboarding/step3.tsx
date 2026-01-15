import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthStore } from "@/features/auth";
import { devlog } from "@/shared/devtools/devlog";

function OnboardingIllustration3() {
  return (
    <View style={styles.illWrap} accessibilityElementsHidden importantForAccessibility="no">
      <View style={[styles.illBlob, { backgroundColor: "rgba(59,130,246,0.20)", transform: [{ translateX: 14 }, { translateY: 12 }] }]} />
      <View style={styles.illIconCircle}>
        <Ionicons name="heart-outline" size={44} color="#111827" />
      </View>
    </View>
  );
}

export default function OnboardingStep3Login() {
  const router = useRouter();
  const socialLogin = useAuthStore((s) => s.socialLogin);
  const isLoading = useAuthStore((s) => s.isLoading);
  const DEVTOOLS_ENABLED = Boolean(__DEV__ || process.env.EXPO_PUBLIC_DEVTOOLS === "1");

  useEffect(() => {
    Keyboard.dismiss();
  }, []);

  const handleKakao = async () => {
    try {
      if (DEVTOOLS_ENABLED) devlog({ scope: "NAV", level: "info", message: "onboarding.step3: press kakao" });
      await socialLogin("kakao");
      if (DEVTOOLS_ENABLED) devlog({ scope: "NAV", level: "info", message: "onboarding.step3: kakao ok -> /(tabs)" });
      router.replace("/(tabs)");
    } catch (e: any) {
      if (DEVTOOLS_ENABLED) {
        devlog({
          scope: "NAV",
          level: "error",
          message: "onboarding.step3: kakao fail",
          meta: { status: e?.response?.status, message: e?.response?.data?.message || e?.message },
        });
      }
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "카카오 로그인에 실패했습니다. (키 설정/네트워크 상태를 확인해 주세요.)";
      Alert.alert("오류", String(msg));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="뒤로">
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>로그인</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>맞춤 돌봄 서비스 이용</Text>
        <Text style={styles.description}>
          간병 매칭부터 관리까지 한 곳에서 해결{"\n"}
          보호자·환자 모두에게 편리한 통합 돌봄 서비스 제공
        </Text>

        <View style={{ height: 80 }} />
        <OnboardingIllustration3 />
        <View style={{ flex: 1 }} />

        <View style={{ width: "100%", paddingBottom: 24 }}>
          <TouchableOpacity
            onPress={() => void handleKakao()}
            disabled={isLoading}
            activeOpacity={isLoading ? 1 : 0.9}
            style={[styles.kakaoBtn, isLoading && styles.kakaoBtnDisabled]}
          >
            <Text style={styles.kakaoText}>카카오 시작하기</Text>
          </TouchableOpacity>

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
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#70737C29",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: { fontSize: 17, fontWeight: "600", color: "#000000" },
  content: { flex: 1, alignItems: "center", paddingHorizontal: 24 },
  title: {
    marginTop: 60,
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 32,
    textAlign: "center",
    color: "#171719",
  },
  description: {
    marginTop: 42,
    maxWidth: 335,
    fontSize: 17,
    fontWeight: "500",
    lineHeight: 24,
    textAlign: "center",
    color: "#171719",
  },
  illWrap: { width: 180, height: 180, alignItems: "center", justifyContent: "center" },
  illBlob: { position: "absolute", width: 120, height: 120, borderRadius: 60 },
  illIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  kakaoBtn: {
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE500",
  },
  kakaoBtnDisabled: { opacity: 0.7 },
  kakaoText: { fontSize: 16, fontWeight: "800", color: "#191919" },
  loadingRow: { marginTop: 12, alignItems: "center" },
  loadingText: { marginTop: 8, color: "#6B7280" },
});

