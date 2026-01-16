import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthStore } from "@/features/auth";
import { devlog } from "@/shared/devtools/devlog";
import { LanguagePickerModal, type AppLocale } from "@/shared/ui/LanguagePickerModal";
import { getAppLocale, setAppLocale } from "@/shared/lib/locale";
import { LoginFailModal } from "@/shared/ui/LoginFailModal";

function OnboardingIllustration3() {
  return (
    <View style={styles.imageWrapper} accessibilityElementsHidden importantForAccessibility="no">
      <Image
        source={require("@/assets/images/onboarding-3.png")}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

export default function OnboardingStep3Login() {
  const router = useRouter();
  const socialLogin = useAuthStore((s) => s.socialLogin);
  const isLoading = useAuthStore((s) => s.isLoading);
  const DEVTOOLS_ENABLED = Boolean(__DEV__ || process.env.EXPO_PUBLIC_DEVTOOLS === "1");
  const [locale, setLocale] = useState<AppLocale>("ko");
  const [langOpen, setLangOpen] = useState(false);
  const [failOpen, setFailOpen] = useState(false);

  useEffect(() => {
    Keyboard.dismiss();
    void (async () => {
      const v = await getAppLocale();
      setLocale(v);
    })();
  }, []);

  const t = (() => {
    if (locale === "en") {
      return {
        header: "Login",
        title: "Use personalized care service",
        desc: "Match, manage and journal care in one place.",
        kakao: "Start with Kakao",
      };
    }
    return {
      header: "로그인",
      title: "맞춤 돌봄 서비스 이용",
      desc: "간병 매칭부터 관리까지 한 곳에서 해결\n보호자·환자 모두에게 편리한 통합 돌봄 서비스 제공",
      kakao: "카카오 시작하기",
    };
  })();

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
      setFailOpen(true);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.frame}>
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text style={styles.headerTitle}>{t.header}</Text>
          <TouchableOpacity
            onPress={() => setLangOpen(true)}
            style={styles.langBtn}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="언어 선택"
          >
            <Text style={styles.langText}>A</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.description}>{t.desc}</Text>

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
              <Text style={styles.kakaoText}>{t.kakao}</Text>
            </TouchableOpacity>

            {isLoading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator />
                <Text style={styles.loadingText}>카카오 로그인 진행 중…</Text>
              </View>
            )}
          </View>
        </View>

        <LanguagePickerModal
          visible={langOpen}
          value={locale}
          onClose={() => setLangOpen(false)}
          onSelect={(v) => {
            setLocale(v);
            setLangOpen(false);
            void setAppLocale(v);
          }}
        />

        <LoginFailModal visible={failOpen} onClose={() => setFailOpen(false)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  frame: { flex: 1, width: "100%", maxWidth: 375, alignSelf: "center", backgroundColor: "#FFFFFF" },
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
  headerSide: { width: 24 },
  headerTitle: { fontSize: 17, fontWeight: "600", color: "#000000" },
  langBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  langText: { fontSize: 14, fontWeight: "900", color: "#111827" },
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
  imageWrapper: { marginTop: 80, justifyContent: "center" },
  image: { width: 150, height: 120 },
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

