import { useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthStore } from "@/features/auth";

export default function SignupScreen() {
  const router = useRouter();
  const socialLogin = useAuthStore((s) => s.socialLogin);

  const handleKakaoSignup = async () => {
    try {
      await socialLogin("kakao");
      router.replace("/(auth)/role-selection");
    } catch (e: any) {
      console.log("kakao signup error:", e);
      Alert.alert("오류", "카카오 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <View className="items-center py-4 border-b border-gray-100">
        <Text className="text-base font-medium text-gray-900">회원가입</Text>
      </View>

      <View className="flex-1 px-6 pt-10">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          카카오로 시작하기
        </Text>
        <Text className="text-base text-gray-500 mb-10">
          로그인/회원가입은 카카오톡만 지원합니다.
        </Text>

        <Pressable
          onPress={handleKakaoSignup}
          className="flex-row items-center justify-center h-14 rounded-xl bg-[#FEE500]"
        >
          <Text className="text-base font-semibold text-[#191919]">
            카카오로 계속
          </Text>
        </Pressable>

        <View className="h-12" />

        <Pressable
          onPress={() => router.replace("/(auth)/login")}
          className="h-12 items-center justify-center"
        >
          <Text className="text-gray-500">이미 계정이 있어요 (로그인)</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}


