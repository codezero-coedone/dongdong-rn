import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { secureStorage } from "@/shared/lib/storage";
import { STORAGE_KEYS } from "@/shared/constants/storage";

function OnboardingIllustration2() {
  return (
    <View style={styles.illWrap} accessibilityElementsHidden importantForAccessibility="no">
      <View style={[styles.illBlob, { backgroundColor: "rgba(59,130,246,0.20)", transform: [{ translateX: 10 }, { translateY: 20 }] }]} />
      <View style={styles.illIconCircle}>
        <Ionicons name="home-outline" size={44} color="#111827" />
      </View>
    </View>
  );
}

export default function OnboardingStep2() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Keyboard.dismiss();
  }, []);

  const goNext = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // 첫 진입 이후에는 온보딩 슬라이드 재노출 방지
      await secureStorage.set(STORAGE_KEYS.ONBOARDING_SLIDES_COMPLETE, "1");
    } catch {
      // ignore
    }
    try {
      const v = await secureStorage.get(STORAGE_KEYS.ONBOARDING_COMPLETE);
      const permissionDone = v === "1" || v === "true";
      router.replace(permissionDone ? "/onboarding/step3" : "/(auth)/permission");
    } catch {
      router.replace("/(auth)/permission");
    } finally {
      setBusy(false);
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
        <Text style={styles.title}>실시간 확인으로 안심</Text>
        <Text style={styles.description}>
          현재 돌봄 상황을 언제든 확인하세요.{"\n"}
          간병 진행 현황, 간병일지, 주요 알림까지 실시간으로 공유되어 멀리 있어도 안심할 수 있어요.
        </Text>

        <View style={{ height: 80 }} />
        <OnboardingIllustration2 />
        <View style={{ flex: 1 }} />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="다음"
          style={[styles.button, busy && styles.buttonDisabled]}
          activeOpacity={0.9}
          onPress={() => void goNext()}
          disabled={busy}
        >
          <Text style={styles.buttonText}>다음</Text>
        </TouchableOpacity>
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
  illBlob: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
  },
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
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24, backgroundColor: "#FFFFFF" },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
});

