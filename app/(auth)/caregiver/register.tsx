import { useCaregiverRegistrationStore } from "@/features/caregiver";
import { Button, GENDER_OPTIONS, Header, RadioButtonGroup } from "@/shared/ui";
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

export default function CaregiverRegisterScreen() {
  const router = useRouter();
  const { basicInfo, updateBasicInfo, isStepValid } =
    useCaregiverRegistrationStore();

  // 전화번호 포맷
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
      7,
      11
    )}`;
  };

  // 주소 검색
  const handleAddressSearch = () => {
    // TODO: 주소 검색 모달/화면 열기
    console.log("주소 검색");
  };

  // 신분증 사진 업로드
  const handleIdCardUpload = async () => {
    // TODO: 이미지 피커로 신분증 사진 선택
    updateBasicInfo({ idCardImage: "uploaded" });
  };

  // 범죄경력회보서 업로드
  const handleCriminalRecordUpload = async () => {
    // TODO: 이미지/PDF 피커로 파일 선택
    updateBasicInfo({ criminalRecord: "uploaded" });
  };

  const isFormValid = isStepValid(1);

  // 다음 단계로
  const handleNext = () => {
    if (!isFormValid) return;
    router.push("/(auth)/caregiver/qualification");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <Header title="기본 정보 입력" />

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
            {/* 경고 배너 */}
            <View className="mx-6 mt-4 px-4 py-3 bg-blue-50 rounded-xl">
              <Text className="text-sm text-blue-600 text-center">
                허위 정보 기재 시 계정 제재 가능성 고지 알림
              </Text>
            </View>

            {/* 섹션 타이틀 */}
            <View className="px-6 mt-6 mb-4">
              <Text className="text-lg font-bold text-gray-900">
                간병인 정보를 입력해주세요
              </Text>
            </View>

            {/* 이름 */}
            <View className="px-6 mb-4">
              <Text className="text-sm text-gray-600 mb-2">이름</Text>
              <TextInput
                value={basicInfo.name}
                onChangeText={(text) => updateBasicInfo({ name: text })}
                placeholder="홍길동"
                placeholderTextColor="#9CA3AF"
                className="h-14 px-4 border border-gray-200 rounded-xl text-base text-gray-900"
              />
            </View>

            {/* 생년월일 */}
            <View className="px-6 mb-4">
              <Text className="text-sm text-gray-600 mb-2">생년월일</Text>
              <TextInput
                value={basicInfo.birthDate}
                onChangeText={(text) =>
                  updateBasicInfo({
                    birthDate: text.replace(/[^0-9]/g, "").slice(0, 8),
                  })
                }
                placeholder="20060101"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={8}
                className="h-14 px-4 border border-gray-200 rounded-xl text-base text-gray-900"
              />
            </View>

            {/* 성별 */}
            <View className="px-6 mb-4">
              <Text className="text-sm text-gray-600 mb-2">성별</Text>
              <RadioButtonGroup
                options={GENDER_OPTIONS}
                value={basicInfo.gender}
                onChange={(value) => updateBasicInfo({ gender: value })}
              />
            </View>

            {/* 연락처 */}
            <View className="px-6 mb-4">
              <Text className="text-sm text-gray-600 mb-2">연락처</Text>
              <TextInput
                value={basicInfo.phone}
                onChangeText={(text) =>
                  updateBasicInfo({ phone: formatPhoneNumber(text) })
                }
                placeholder="010-1234-5678"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={13}
                className="h-14 px-4 border border-gray-200 rounded-xl text-base text-gray-900"
              />
            </View>

            {/* 주소 */}
            <View className="px-6 mb-4">
              <Text className="text-sm text-gray-600 mb-2">주소</Text>
              <Pressable
                onPress={handleAddressSearch}
                className="h-14 px-4 border border-gray-200 rounded-xl justify-center"
              >
                <Text
                  className={`text-base ${
                    basicInfo.address ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {basicInfo.address || "주소를 검색해 주세요."}
                </Text>
              </Pressable>
              <TextInput
                value={basicInfo.addressDetail}
                onChangeText={(text) =>
                  updateBasicInfo({ addressDetail: text })
                }
                placeholder="상세주소"
                placeholderTextColor="#9CA3AF"
                className="h-14 px-4 border border-gray-200 rounded-xl text-base text-gray-900 mt-2"
              />
            </View>

            {/* 신분증 사진 */}
            <View className="px-6 mb-4">
              <Text className="text-sm text-gray-600 mb-2">신분증 사진</Text>
              <Pressable
                onPress={handleIdCardUpload}
                className="h-32 border border-gray-200 rounded-xl items-center justify-center bg-gray-50"
              >
                {basicInfo.idCardImage ? (
                  <View className="items-center">
                    <Text className="text-2xl mb-1">✓</Text>
                    <Text className="text-sm text-gray-600">업로드 완료</Text>
                  </View>
                ) : (
                  <View className="items-center">
                    <View className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 items-center justify-center mb-2">
                      <Text className="text-xl text-gray-400">+</Text>
                    </View>
                    <Text className="text-sm text-gray-500">
                      신분증 사진 등록하기
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            {/* 범죄경력회보서 (선택) */}
            <View className="px-6 mb-4">
              <Text className="text-sm text-gray-600 mb-2">
                범죄경력회보서 (선택사항)
              </Text>
              <Pressable
                onPress={handleCriminalRecordUpload}
                className="h-24 border border-gray-200 rounded-xl items-center justify-center bg-gray-50"
              >
                {basicInfo.criminalRecord ? (
                  <View className="items-center">
                    <Text className="text-2xl mb-1">✓</Text>
                    <Text className="text-sm text-gray-600">업로드 완료</Text>
                  </View>
                ) : (
                  <View className="items-center">
                    <Text className="text-xl text-gray-400 mb-1">+</Text>
                    <Text className="text-sm text-gray-500">
                      PDF 또는 사진을 업로드해주세요
                    </Text>
                  </View>
                )}
              </Pressable>
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
