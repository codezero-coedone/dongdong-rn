import type { CaregiverRegistrationForm } from "@/entities/caregiver";
import { Header } from "@/shared/ui";
import { useRouter } from "expo-router";
import { useState } from "react";
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

type Gender = "male" | "female" | null;

export default function CaregiverRegisterScreen() {
  const router = useRouter();

  const [form, setForm] = useState<CaregiverRegistrationForm>({
    name: "",
    birthDate: "",
    gender: null,
    phone: "",
    address: "",
    addressDetail: "",
    idCardImage: undefined,
    criminalRecord: undefined,
  });

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
    console.log("신분증 사진 업로드");
  };

  // 범죄경력회보서 업로드
  const handleCriminalRecordUpload = async () => {
    // TODO: 이미지/PDF 피커로 파일 선택
    console.log("범죄경력회보서 업로드");
  };

  // 폼 유효성 검사
  const isFormValid =
    form.name.length > 0 &&
    form.birthDate.length === 8 &&
    form.gender !== null &&
    form.phone.length === 13 &&
    form.address.length > 0 &&
    form.idCardImage !== undefined;

  // 다음 단계로
  const handleNext = () => {
    if (!isFormValid) return;
    // TODO: 다음 화면으로 이동 또는 API 호출
    console.log("Form submitted:", form);
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
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="홍길동"
                placeholderTextColor="#9CA3AF"
                className="h-14 px-4 border border-gray-200 rounded-xl text-base text-gray-900"
              />
            </View>

            {/* 생년월일 */}
            <View className="px-6 mb-4">
              <Text className="text-sm text-gray-600 mb-2">생년월일</Text>
              <TextInput
                value={form.birthDate}
                onChangeText={(text) =>
                  setForm({
                    ...form,
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
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setForm({ ...form, gender: "male" })}
                  className={`flex-1 h-14 rounded-xl items-center justify-center ${
                    form.gender === "male"
                      ? "bg-blue-500"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-base font-medium ${
                      form.gender === "male" ? "text-white" : "text-gray-400"
                    }`}
                  >
                    남성
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setForm({ ...form, gender: "female" })}
                  className={`flex-1 h-14 rounded-xl items-center justify-center ${
                    form.gender === "female"
                      ? "bg-blue-500"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-base font-medium ${
                      form.gender === "female" ? "text-white" : "text-gray-400"
                    }`}
                  >
                    여성
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* 연락처 */}
            <View className="px-6 mb-4">
              <Text className="text-sm text-gray-600 mb-2">연락처</Text>
              <TextInput
                value={form.phone}
                onChangeText={(text) =>
                  setForm({ ...form, phone: formatPhoneNumber(text) })
                }
                placeholder="174"
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
                    form.address ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {form.address || "주소를 검색해 주세요."}
                </Text>
              </Pressable>
              <TextInput
                value={form.addressDetail}
                onChangeText={(text) =>
                  setForm({ ...form, addressDetail: text })
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
                {form.idCardImage ? (
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
                {form.criminalRecord ? (
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
          <Pressable
            onPress={handleNext}
            disabled={!isFormValid}
            className={`h-14 rounded-xl items-center justify-center ${
              isFormValid ? "bg-blue-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                isFormValid ? "text-white" : "text-gray-400"
              }`}
            >
              다음
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
