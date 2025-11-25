import { useCaregiverRegistrationStore } from "@/features/caregiver";
import {
  Button,
  ChipSelect,
  DAY_OPTIONS,
  Header,
  Select,
  TagInput,
  TIME_OPTIONS,
  WORK_TIME_OPTIONS,
} from "@/shared/ui";
import { useRouter } from "expo-router";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MAX_INTRODUCTION_LENGTH = 200;

export default function WorkPreferenceScreen() {
  const router = useRouter();
  const {
    workPreference,
    updateWorkPreference,
    isStepValid,
    resetRegistration,
  } = useCaregiverRegistrationStore();

  // 지역 추가
  const handleAddLocation = () => {
    // TODO: 지역 검색 모달 열기
    const newLocation = {
      id: Date.now().toString(),
      label: "새 지역",
    };
    updateWorkPreference({
      locations: [...workPreference.locations, newLocation],
    });
  };

  // 지역 삭제
  const handleRemoveLocation = (id: string) => {
    updateWorkPreference({
      locations: workPreference.locations.filter((loc) => loc.id !== id),
    });
  };

  const isFormValid = isStepValid(3);

  const handleComplete = () => {
    if (!isFormValid) return;
    console.log("Registration complete:", { workPreference });
    // TODO: API 호출 후 완료 화면으로 이동
    // resetRegistration(); // 완료 후 상태 초기화
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <Header title="희망 근무 환경 설정" />

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

            {/* 희망 근무 지역 */}
            <View className="px-6 mt-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                희망 근무 지역
              </Text>
              <TagInput
                tags={workPreference.locations}
                onRemove={handleRemoveLocation}
                onAdd={handleAddLocation}
                placeholder="+ 추가하기"
              />
            </View>

            {/* 희망 근무 요일 */}
            <View className="px-6 mt-8">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                희망 근무 요일
              </Text>
              <ChipSelect
                options={DAY_OPTIONS}
                values={workPreference.workDays}
                onChange={(values) =>
                  updateWorkPreference({ workDays: values })
                }
              />
            </View>

            {/* 희망 근무 시간 */}
            <View className="px-6 mt-8">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                희망 근무 시간
              </Text>

              {/* 시작/종료 시간 */}
              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <Select
                    options={TIME_OPTIONS}
                    value={workPreference.startTime}
                    onChange={(value) =>
                      updateWorkPreference({ startTime: value })
                    }
                    placeholder="시작시간"
                  />
                </View>
                <View className="flex-1">
                  <Select
                    options={TIME_OPTIONS}
                    value={workPreference.endTime}
                    onChange={(value) =>
                      updateWorkPreference({ endTime: value })
                    }
                    placeholder="종료시간"
                  />
                </View>
              </View>

              {/* 시간 옵션 */}
              <ChipSelect
                options={WORK_TIME_OPTIONS}
                values={workPreference.timeOptions}
                onChange={(values) =>
                  updateWorkPreference({ timeOptions: values })
                }
              />
            </View>

            {/* 자기소개 */}
            <View className="px-6 mt-8">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                자기소개
              </Text>
              <View className="border border-gray-200 rounded-xl p-4">
                <TextInput
                  value={workPreference.introduction}
                  onChangeText={(text) =>
                    updateWorkPreference({
                      introduction: text.slice(0, MAX_INTRODUCTION_LENGTH),
                    })
                  }
                  placeholder="보호자에게 노출될 자기소개글을 입력해주세요!"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="min-h-[100px] text-base text-gray-900"
                />
                <Text className="text-sm text-gray-400 text-right mt-2">
                  {workPreference.introduction.length}/{MAX_INTRODUCTION_LENGTH}
                </Text>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* 다음 버튼 */}
        <View className="px-6 pb-8">
          <Button onPress={handleComplete} disabled={!isFormValid}>
            완료
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
