import { useCaregiverRegistrationStore } from "@/features/caregiver";
import {
  Button,
  CAREGIVER_CERTIFICATE_OPTIONS,
  EXPERIENCE_OPTIONS,
  Header,
  MultiSelect,
  RadioButtonGroup,
} from "@/shared/ui";
import { useRouter } from "expo-router";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CaregiverQualificationScreen() {
  const router = useRouter();
  const { qualification, updateQualification, isStepValid } =
    useCaregiverRegistrationStore();

  // 자격증 이미지 업로드
  const handleCertificateUpload = (certType: string) => {
    // TODO: 이미지 피커 연동
    updateQualification({
      certificateImages: {
        ...qualification.certificateImages,
        [certType]: "uploaded",
      },
    });
  };

  const isFormValid = isStepValid(2);

  const handleNext = () => {
    if (!isFormValid) return;
    router.push("/(auth)/caregiver/work-preference");
  };

  // 자격증 아코디언 렌더링
  const renderCertificateExpanded = (certType: string) => (
    <Pressable
      onPress={() => handleCertificateUpload(certType)}
      className="h-24 border border-dashed border-gray-300 rounded-xl items-center justify-center bg-gray-50"
    >
      {qualification.certificateImages[certType] ? (
        <View className="items-center">
          <Text className="text-2xl text-green-500 mb-1">✓</Text>
          <Text className="text-sm text-gray-600">업로드 완료</Text>
        </View>
      ) : (
        <View className="items-center">
          <View className="w-8 h-8 rounded-full border-2 border-dashed border-gray-400 items-center justify-center mb-2">
            <Text className="text-lg text-gray-400">+</Text>
          </View>
          <Text className="text-sm text-blue-500">자격증 등록하기</Text>
        </View>
      )}
    </Pressable>
  );

  // 경력 아코디언 렌더링
  const renderExperienceExpanded = (value: string) => {
    if (value !== "experienced") return null;

    return (
      <View className="gap-3">
        {/* 년/개월 */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextInput
              value={qualification.experienceYears}
              onChangeText={(text) =>
                updateQualification({ experienceYears: text })
              }
              placeholder="년"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              className="h-14 px-4 border border-gray-200 rounded-xl text-base text-gray-900 text-center"
            />
          </View>
          <View className="flex-1">
            <TextInput
              value={qualification.experienceMonths}
              onChangeText={(text) =>
                updateQualification({ experienceMonths: text })
              }
              placeholder="개월"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              className="h-14 px-4 border border-gray-200 rounded-xl text-base text-gray-900 text-center"
            />
          </View>
        </View>

        {/* 주요 근무 이력 */}
        <TextInput
          value={qualification.experienceDescription}
          onChangeText={(text) =>
            updateQualification({ experienceDescription: text })
          }
          placeholder="주요 근무 이력을 작성해주세요."
          placeholderTextColor="#9CA3AF"
          className="h-14 px-4 border border-gray-200 rounded-xl text-base text-gray-900"
        />

        {/* 담당했던 업무 */}
        <TextInput
          value={qualification.experienceDuties}
          onChangeText={(text) =>
            updateQualification({ experienceDuties: text })
          }
          placeholder="담당했던 업무를 작성해주세요."
          placeholderTextColor="#9CA3AF"
          className="h-14 px-4 border border-gray-200 rounded-xl text-base text-gray-900"
        />
      </View>
    );
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

            {/* 자격증 선택 (멀티 셀렉트 + 아코디언) */}
            <View className="px-6 mt-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                보유한 자격증을 등록해 주세요.
              </Text>
              <MultiSelect
                options={CAREGIVER_CERTIFICATE_OPTIONS}
                values={qualification.certificates}
                onChange={(values) =>
                  updateQualification({ certificates: values })
                }
                renderExpanded={renderCertificateExpanded}
              />
            </View>

            {/* 경력 선택 (라디오 버튼 + 아코디언) */}
            <View className="px-6 mt-8">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                간병 경력이 있으신가요?
              </Text>
              <RadioButtonGroup
                options={EXPERIENCE_OPTIONS}
                value={qualification.experience}
                onChange={(value) => updateQualification({ experience: value })}
                renderExpanded={renderExperienceExpanded}
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
