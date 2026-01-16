import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Keyboard, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LanguagePickerModal, type AppLocale } from "@/shared/ui/LanguagePickerModal";
import { getAppLocale, setAppLocale } from "@/shared/lib/locale";

function OnboardingIllustration1() {
  return (
    <View style={styles.imageWrapper} accessibilityElementsHidden importantForAccessibility="no">
      <Image
        source={require("@/assets/images/onboarding-1.png")}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

export default function OnboardingStep1() {
  const router = useRouter();
  const [locale, setLocale] = useState<AppLocale>("ko");
  const [langOpen, setLangOpen] = useState(false);

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
        title: "Start care with confidence",
        desc:
          "Connect with professional caregivers quickly.\n" +
          "Understand care needs clearly and begin stable care with the right match.",
        next: "Next",
      };
    }
    return {
      header: "로그인",
      title: "안심되는 돌봄 시작",
      desc:
        "전문 간병인과의 연결을 쉽고 빠르게.\n" +
        "필요한 돌봄을 정확히 이해하고, 가장 적합한 간병인을 추천해 안정적인 돌봄을 시작할 수 있어요.",
      next: "다음",
    };
  })();

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
          <OnboardingIllustration1 />
          <View style={{ flex: 1 }} />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t.next}
            style={styles.button}
            activeOpacity={0.9}
            onPress={() => router.push("/onboarding/step2")}
          >
            <Text style={styles.buttonText}>{t.next}</Text>
          </TouchableOpacity>
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
  image: { width: 154, height: 125 },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24, backgroundColor: "#FFFFFF" },
  button: {
    backgroundColor: "#0066FF",
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
});

