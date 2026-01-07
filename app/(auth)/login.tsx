import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/features/auth";
import Carousel from "react-native-reanimated-carousel";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

// 온보딩 데이터 타입
interface OnboardingItem {
  id: string;
  title: string;
  description: string;
}

// 온보딩 데이터
const ONBOARDING_DATA: OnboardingItem[] = [
  {
    id: "1",
    title: "안심되는 돌봄 시작",
    description:
      "간병 매칭부터 관리까지 한 곳에서 해결\n보호자·환자 모두에게 편리한 통합 돌봄 서비스 제공",
  },
  {
    id: "2",
    title: "실시간 확인으로 안심",
    description:
      "간병 매칭부터 관리까지 한 곳에서 해결\n보호자·환자 모두에게 편리한 통합 돌봄 서비스 제공",
  },
  {
    id: "3",
    title: "맞춤 돌봄 서비스 이용",
    description:
      "간병 매칭부터 관리까지 한 곳에서 해결\n보호자·환자 모두에게 편리한 통합 돌봄 서비스 제공",
  },
];

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
  const [step, setStep] = useState(0);
  const carouselRef = useRef<any>(null);
  const socialLogin = useAuthStore((s) => s.socialLogin);
  const isLoading = useAuthStore((s) => s.isLoading);

  const isLastStep = step === ONBOARDING_DATA.length - 1;

  const width = Dimensions.get("window").width;

  const goNext = () => {
    if (step >= ONBOARDING_DATA.length - 1) return;
    const next = step + 1;
    carouselRef.current?.scrollTo?.({ index: next, animated: true });
    setStep(next);
  };

  const tapGesture = useMemo(
    () =>
      Gesture.Tap().onEnd(() => {
        // UX: tap anywhere to proceed (in addition to swipe).
        goNext();
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step],
  );

  const handleSocialLogin = async () => {
    try {
      await socialLogin("kakao");
      // guardian 앱은 WebView 컨텐츠 앱. 로그인 후 즉시 WebView 탭으로 진입.
      router.replace("/(tabs)");
    } catch (e: any) {
      console.log("social login error:", e);
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "카카오 로그인에 실패했습니다. (Expo Go 불가 / 카카오 키 설정 확인)";
      Alert.alert("오류", String(msg));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>로그인</Text>
      </View>

      <GestureDetector gesture={tapGesture}>
        <View style={styles.body}>
          <Carousel
            ref={carouselRef}
            width={width}
            height={520}
            data={ONBOARDING_DATA}
            loop={false}
            pagingEnabled
            onSnapToItem={(idx: number) => setStep(idx)}
            renderItem={({ item }: { item: OnboardingItem }) => (
              <View style={styles.slide}>
                {/* 텍스트 영역 */}
                <View style={styles.hero}>
                  <Text style={styles.heroTitle}>{item.title}</Text>
                  <Text style={styles.heroDesc}>{item.description}</Text>
                </View>

                {/* 이미지 영역 (Placeholder) */}
                <View style={styles.imageArea}>
                  <View style={styles.imagePlaceholder} />
                </View>
              </View>
            )}
          />
        </View>
      </GestureDetector>

      {/* 하단 버튼 영역 */}
      <View style={styles.footer}>
        <View style={styles.dotsRow} pointerEvents="none">
          {ONBOARDING_DATA.map((_, i) => (
            <View
              key={String(i)}
              style={[styles.dot, i === step ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>

        {isLastStep && (
          <View style={{ width: "100%" }}>
            <SocialLoginButton provider="kakao" onPress={handleSocialLogin} />
            {isLoading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator />
                <Text style={styles.loadingText}>카카오 로그인 진행 중…</Text>
              </View>
            )}
          </View>
        )}
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
  imageArea: { flex: 1, alignItems: "center" },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#E5E7EB",
    borderRadius: 14,
  },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28, gap: 14 },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 999 },
  dotActive: { backgroundColor: "#111827" },
  dotInactive: { backgroundColor: "#D1D5DB" },
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
