import {
  Button,
  CAREGIVER_CERTIFICATE_OPTIONS,
  EXPERIENCE_OPTIONS,
  Header,
  MultiSelect,
  RadioButtonGroup,
} from "@/shared/ui";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ExperienceType = "newcomer" | "experienced" | null;

export default function CaregiverQualificationScreen() {
  const router = useRouter();

  const [certificates, setCertificates] = useState<string[]>([]);
  const [experience, setExperience] = useState<ExperienceType>(null);

  // 폼 유효성 검사
  const isFormValid = certificates.length > 0 && experience !== null;

  const handleNext = () => {
    if (!isFormValid) return;
    console.log({ certificates, experience });
    // TODO: 다음 화면으로 이동
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <Header title="자격증 및 경력 등록" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* 주의사항 */}
            <View className="mx-6 mt-4 p-4 bg-yellow-50 rounded-xl">
              <Text className="text-sm font-semibold text-yellow-700 mb-2">
                주의해 주세요!
              </Text>
              <View className="gap-1">
                <Text className="text-sm text-yellow-700 leading-5">
                  1. 개인정보(주민등록번호, 주소 등)를 반드시 가리신 후 촬영해
                  주세요.
                </Text>
                <Text className="text-sm text-yellow-700 leading-5">
                  2. 자격증 명칭과 동일한 자격증 사진을 전체 이미지가 보이도록
                  촬영해주세요.
                </Text>
                <Text className="text-sm text-yellow-700 leading-5">
                  3. 등록한 자격증은 인감 지원 시 보호자가 확인할 수 있습니다.
                </Text>
              </View>
            </View>

            {/* 자격증 선택 (멀티 셀렉트) */}
            <View className="px-6 mt-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                보유한 자격증을 등록해 주세요.
              </Text>
              <MultiSelect
                options={CAREGIVER_CERTIFICATE_OPTIONS}
                values={certificates}
                onChange={setCertificates}
              />
            </View>

            {/* 경력 선택 (라디오 버튼) */}
            <View className="px-6 mt-8">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                간병 경력이 있으신가요?
              </Text>
              <RadioButtonGroup
                options={EXPERIENCE_OPTIONS}
                value={experience}
                onChange={setExperience}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* 다음 버튼 */}
        <View className="px-6 pb-8">
          <Button onPress={handleNext} disabled={!isFormValid}>
            다음
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
