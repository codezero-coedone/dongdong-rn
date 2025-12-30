import { useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/features/auth";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
  provider: "kakao" | "apple";
  onPress: () => void;
}) {
  const config = {
    kakao: {
      icon: "💬", // TODO: 카카오 아이콘 교체 필요
      text: "카카오 시작하기",
      className: "bg-[#FEE500]",
      textClassName: "text-[#191919]",
    },
    apple: {
      icon: "", // TODO: 애플 아이콘 교체 필요
      text: "애플 시작하기",
      className: "bg-gray-100",
      textClassName: "text-black",
    },
  };

  const { icon, text, className, textClassName } = config[provider];

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-center h-14 rounded-xl mb-3 ${className}`}
    >
      <Text className={`text-lg mr-2 ${textClassName}`}>{icon}</Text>
      <Text className={`text-base font-semibold ${textClassName}`}>{text}</Text>
    </Pressable>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const socialLogin = useAuthStore((s) => s.socialLogin);

  const currentItem = ONBOARDING_DATA[step];
  const isLastStep = step === ONBOARDING_DATA.length - 1;

  const handleNext = () => {
    if (step < ONBOARDING_DATA.length - 1) {
      setStep(step + 1);
    }
  };

  const handleSocialLogin = async (provider: "kakao" | "apple") => {
    try {
      await socialLogin(provider);
      // 로그인 후 역할 선택(환자/보호자)로 이동
      router.replace("/(auth)/role-selection");
    } catch (e: any) {
      console.log("social login error:", e);
      // 최소 에러 처리 (UI는 추후 디자인 적용)
      router.push("/(auth)/signup");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      {/* 헤더 */}
      <View className="items-center py-4 border-b border-gray-100">
        <Text className="text-base font-medium text-gray-900">로그인</Text>
      </View>

      <View className="flex-1 px-6 pt-12">
        {/* 텍스트 영역 */}
        <View className="items-center mb-12">
          <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {currentItem.title}
          </Text>
          <Text className="text-base text-gray-500 text-center leading-6">
            {currentItem.description}
          </Text>
        </View>

        {/* 이미지 영역 (Placeholder) */}
        <View className="flex-1 items-center">
          <View className="w-full aspect-square bg-gray-200 rounded-lg" />
        </View>
      </View>

      {/* 하단 버튼 영역 */}
      <View className="px-6 pb-8 pt-4">
        {isLastStep ? (
          <View>
            <SocialLoginButton
              provider="kakao"
              onPress={() => handleSocialLogin("kakao")}
            />
            <SocialLoginButton
              provider="apple"
              onPress={() => handleSocialLogin("apple")}
            />
          </View>
        ) : (
          <Pressable
            onPress={handleNext}
            className="h-14 bg-blue-500 rounded-xl items-center justify-center"
          >
            <Text className="text-white text-lg font-semibold">다음</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
