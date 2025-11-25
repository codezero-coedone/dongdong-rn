import { Header } from "@/shared/ui";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GuardianRegisterScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <Header title="보호자 정보 입력" />

      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-lg text-gray-500">
          보호자 등록 화면 (준비 중)
        </Text>
      </View>
    </SafeAreaView>
  );
}
