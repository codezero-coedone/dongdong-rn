import { Header } from "@/shared/ui";
import { useEffect, useState } from "react";
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

export default function PhoneVerifyScreen() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 타이머 로직
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // 타이머 포맷 (분:초)
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs.toString().padStart(2, "0")}초`;
  };

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

  // 인증번호 전송
  const handleSendCode = () => {
    if (!phoneNumber || phoneNumber.length < 13) return;

    setIsLoading(true);
    // TODO: 실제 인증번호 전송 API 호출
    setTimeout(() => {
      setIsCodeSent(true);
      setTimer(180); // 3분
      setIsLoading(false);
    }, 1000);
  };

  // 재전송
  const handleResend = () => {
    handleSendCode();
  };

  // 인증 완료
  const handleVerify = () => {
    if (!isFormValid) return;

    setIsLoading(true);
    // TODO: 실제 인증 확인 API 호출
    console.log({
      name,
      birthDate,
      gender,
      phoneNumber,
      verificationCode,
    });
  };

  // 폼 유효성 검사
  const isFormValid =
    name.length > 0 &&
    birthDate.length === 8 &&
    gender !== null &&
    phoneNumber.length === 13 &&
    verificationCode.length >= 4 &&
    isCodeSent;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <Header title="휴대폰 인증" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1 px-6"
            contentContainerStyle={{ paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* 이름 */}
            <View className="mt-6">
              <Text className="text-sm text-gray-600 mb-2">이름</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="홍길동"
                placeholderTextColor="#9CA3AF"
                className="h-14 px-4 border border-gray-200 rounded-xl text-base text-gray-900"
              />
            </View>

            {/* 생년월일 */}
            <View className="mt-6">
              <Text className="text-sm text-gray-600 mb-2">생년월일</Text>
              <TextInput
                value={birthDate}
                onChangeText={(text) =>
                  setBirthDate(text.replace(/[^0-9]/g, "").slice(0, 8))
                }
                placeholder="20060101"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={8}
                className="h-14 px-4 border border-gray-200 rounded-xl text-base text-gray-900"
              />
            </View>

            {/* 성별 */}
            <View className="mt-6">
              <Text className="text-sm text-gray-600 mb-2">성별</Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setGender("male")}
                  className={`flex-1 h-14 rounded-xl items-center justify-center ${
                    gender === "male"
                      ? "bg-blue-500"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-base font-medium ${
                      gender === "male" ? "text-white" : "text-gray-400"
                    }`}
                  >
                    남성
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setGender("female")}
                  className={`flex-1 h-14 rounded-xl items-center justify-center ${
                    gender === "female"
                      ? "bg-blue-500"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-base font-medium ${
                      gender === "female" ? "text-white" : "text-gray-400"
                    }`}
                  >
                    여성
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* 휴대폰 번호 */}
            <View className="mt-6">
              <Text className="text-sm text-gray-600 mb-2">휴대폰 번호</Text>
              <View className="flex-row gap-3">
                <TextInput
                  value={phoneNumber}
                  onChangeText={(text) =>
                    setPhoneNumber(formatPhoneNumber(text))
                  }
                  placeholder="010-1234-5678"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  maxLength={13}
                  className="flex-1 h-14 px-4 border border-gray-200 rounded-xl text-base text-gray-900"
                />
                <Pressable
                  onPress={isCodeSent ? handleResend : handleSendCode}
                  disabled={phoneNumber.length < 13 || isLoading}
                  className={`h-14 px-4 rounded-xl items-center justify-center border ${
                    phoneNumber.length >= 13
                      ? "border-gray-300 bg-white"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      phoneNumber.length >= 13
                        ? "text-gray-700"
                        : "text-gray-400"
                    }`}
                  >
                    {isCodeSent ? "재전송" : "전송"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* 인증번호 입력 */}
            <View className="mt-6">
              <Text className="text-sm text-gray-600 mb-2">인증번호 입력</Text>
              <View className="relative">
                <TextInput
                  value={verificationCode}
                  onChangeText={(text) =>
                    setVerificationCode(text.replace(/[^0-9]/g, "").slice(0, 6))
                  }
                  placeholder="인증번호를 입력해주세요."
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={isCodeSent}
                  className={`h-14 px-4 pr-20 rounded-xl text-base ${
                    isCodeSent
                      ? "border-2 border-blue-500 text-gray-900"
                      : "border border-gray-200 text-gray-400 bg-gray-50"
                  }`}
                />
                {isCodeSent && timer > 0 && (
                  <View className="absolute right-4 top-0 bottom-0 justify-center">
                    <Text className="text-sm text-blue-500 font-medium">
                      {formatTimer(timer)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* 인증 완료 버튼 */}
        <View className="px-6 pb-8">
          <Pressable
            onPress={handleVerify}
            disabled={!isFormValid || isLoading}
            className={`h-14 rounded-xl items-center justify-center ${
              isFormValid ? "bg-blue-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                isFormValid ? "text-white" : "text-gray-400"
              }`}
            >
              인증 완료
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
