import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
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
import { z } from "zod";

import { AlreadyRegisteredModal } from "@/features/auth/ui/modals/AlreadyRegisteredModal";
import { AuthService } from "@/services/auth.service";

// 유효성 검사 스키마
const signupSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  birthDate: z
    .string()
    .length(8, "생년월일 8자리를 입력해주세요")
    .regex(/^\d+$/, "숫자만 입력해주세요")
    .refine((val) => {
      const year = parseInt(val.substring(0, 4));
      const month = parseInt(val.substring(4, 6));
      const day = parseInt(val.substring(6, 8));
      const date = new Date(year, month - 1, day);
      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    }, "올바른 날짜가 아닙니다"),
  gender: z.enum(["male", "female"], {
    required_error: "성별을 선택해주세요",
  }),
  phoneNumber: z
    .string()
    .min(10, "휴대폰 번호를 입력해주세요")
    .regex(/^010\d{8}$/, "올바른 휴대폰 번호 형식이 아닙니다 (010-XXXX-XXXX)"),
  verificationCode: z.string().optional(),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const router = useRouter();
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      birthDate: "",
      gender: undefined,
      phoneNumber: "",
      verificationCode: "",
    },
  });

  const phoneNumber = watch("phoneNumber");
  const verificationCode = watch("verificationCode");

  // 타이머 로직
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 휴대폰 번호 포맷팅 (010-1234-5678)
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
  const handleSendVerification = async () => {
    const phone = phoneNumber.replace(/-/g, "");
    if (phone.length !== 11 || !phone.startsWith("010")) {
      setError("phoneNumber", {
        message: "올바른 휴대폰 번호를 입력해주세요",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 가입 여부 확인
      const isRegistered = await AuthService.checkUserExists(phone);
      if (isRegistered) {
        setIsAlreadyRegistered(true);
        return;
      }

      const success = await AuthService.sendVerificationCode(phone);
      if (success) {
        setIsVerificationSent(true);
        setTimer(180); // 3분
        Alert.alert("알림", "인증번호가 전송되었습니다.");
      }
    } catch (error) {
      Alert.alert("오류", "인증번호 전송에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    setIsAlreadyRegistered(false);
    router.replace("/(auth)/login");
  };

  // 최종 회원가입/인증 완료
  const onSubmit = async (data: SignupFormData) => {
    if (!isVerificationSent) return;
    if (!data.verificationCode || data.verificationCode.length < 4) {
      setError("verificationCode", { message: "인증번호를 입력해주세요" });
      return;
    }

    setIsLoading(true);
    try {
      const phone = data.phoneNumber.replace(/-/g, "");
      const isValidCode = await AuthService.verifyCode(
        phone,
        data.verificationCode
      );

      if (isValidCode) {
        // 약관 동의 화면으로 이동
        router.push("/(auth)/terms");
      } else {
        setError("verificationCode", { message: "인증번호가 일치하지 않습니다" });
      }
    } catch (error) {
      Alert.alert("오류", "인증 확인 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 입력 필드 컴포넌트
  const renderInput = (
    name: keyof SignupFormData,
    label: string,
    placeholder: string,
    keyboardType: "default" | "number-pad" | "phone-pad" = "default",
    maxLength?: number,
    formatter?: (val: string) => string
  ) => (
    <View className="mb-6">
      <View className="flex-row mb-2">
        <Text className="text-base font-medium text-gray-900">{label}</Text>
        <Text className="text-red-500 ml-1">*</Text>
      </View>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value, onBlur } }) => {
          const hasError = !!errors[name];
          const isValidField = value && !hasError && !errors[name]; // 간단한 체크

          return (
            <View className="relative">
              <TextInput
                className={`h-14 px-4 border rounded-xl bg-white text-base text-gray-900 ${hasError ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                value={value as string}
                onBlur={onBlur}
                onChangeText={(text) => {
                  const formatted = formatter ? formatter(text) : text;
                  onChange(formatted);
                  if (name === "phoneNumber") {
                    // 폰번호 변경 시 인증 상태 초기화
                    if (isVerificationSent) {
                      setIsVerificationSent(false);
                      setTimer(0);
                      setValue("verificationCode", "");
                    }
                  }
                }}
                keyboardType={keyboardType}
                maxLength={maxLength}
              />
              <View className="absolute right-4 top-0 bottom-0 justify-center">
                {hasError && (
                  <Ionicons name="alert-circle" size={24} color="#EF4444" />
                )}
                {!hasError && value && (
                  <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      {/* 헤더 */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" size={24} color="#111" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-bold text-gray-900 mr-10">
          회원가입
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1 px-6 pt-8"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {/* 이름 */}
            {renderInput("name", "이름", "홍길동")}

            {/* 생년월일 */}
            {renderInput(
              "birthDate",
              "생년월일",
              "19900101",
              "number-pad",
              8,
              (text) => text.replace(/[^0-9]/g, "")
            )}

            {/* 성별 */}
            <View className="mb-6">
              <View className="flex-row mb-2">
                <Text className="text-base font-medium text-gray-900">
                  성별
                </Text>
                <Text className="text-red-500 ml-1">*</Text>
              </View>
              <Controller
                control={control}
                name="gender"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={() => onChange("male")}
                      className={`flex-1 h-12 rounded-xl items-center justify-center border ${value === "male"
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-gray-200"
                        }`}
                    >
                      <Text
                        className={`text-base font-medium ${value === "male" ? "text-blue-600" : "text-gray-400"
                          }`}
                      >
                        남성
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => onChange("female")}
                      className={`flex-1 h-12 rounded-xl items-center justify-center border ${value === "female"
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-gray-200"
                        }`}
                    >
                      <Text
                        className={`text-base font-medium ${value === "female" ? "text-blue-600" : "text-gray-400"
                          }`}
                      >
                        여성
                      </Text>
                    </Pressable>
                  </View>
                )}
              />
            </View>

            {/* 휴대폰 번호 */}
            <View className="mb-6">
              <View className="flex-row mb-2">
                <Text className="text-base font-medium text-gray-900">
                  휴대폰 번호
                </Text>
                <Text className="text-red-500 ml-1">*</Text>
              </View>
              <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, value } }) => {
                  const hasError = !!errors.phoneNumber;
                  return (
                    <View className="relative">
                      <TextInput
                        className={`h-14 px-4 border rounded-xl bg-white text-base text-gray-900 ${hasError
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200"
                          }`}
                        placeholder="010-1234-5678"
                        placeholderTextColor="#9CA3AF"
                        value={value}
                        onChangeText={(text) => {
                          onChange(formatPhoneNumber(text));
                          if (isVerificationSent) {
                            setIsVerificationSent(false);
                            setTimer(0);
                            setValue("verificationCode", "");
                          }
                        }}
                        keyboardType="phone-pad"
                        maxLength={13}
                      />
                      <View className="absolute right-4 top-0 bottom-0 justify-center">
                        {hasError && (
                          <Ionicons
                            name="alert-circle"
                            size={24}
                            color="#EF4444"
                          />
                        )}
                        {!hasError && value.length === 13 && (
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="#3B82F6"
                          />
                        )}
                      </View>
                    </View>
                  );
                }}
              />
            </View>

            {/* 인증번호 입력 (조건부 렌더링) */}
            {isVerificationSent && (
              <View className="mb-6">
                <Text className="text-base font-medium text-gray-900 mb-2">
                  인증번호를 입력해주세요
                </Text>
                <Controller
                  control={control}
                  name="verificationCode"
                  render={({ field: { onChange, value } }) => (
                    <View className="relative">
                      <TextInput
                        className="h-14 px-4 border border-gray-200 rounded-xl bg-white text-base text-gray-900"
                        placeholder="인증번호"
                        placeholderTextColor="#9CA3AF"
                        value={value}
                        onChangeText={(text) =>
                          onChange(text.replace(/[^0-9]/g, "").slice(0, 6))
                        }
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                      <View className="absolute right-4 top-0 bottom-0 justify-center flex-row items-center gap-2">
                        <Text className="text-gray-400 text-sm">
                          {formatTimer(timer)}
                        </Text>
                        {value?.length === 6 && (
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="#3B82F6"
                          />
                        )}
                      </View>
                    </View>
                  )}
                />
              </View>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* 하단 버튼 */}
        <View className="px-6 pb-8 pt-4 bg-white border-t border-gray-100">
          {!isVerificationSent ? (
            <Pressable
              onPress={handleSendVerification}
              disabled={
                isLoading ||
                !!errors.name ||
                !!errors.birthDate ||
                !!errors.gender ||
                !!errors.phoneNumber ||
                !watch("name") ||
                !watch("birthDate") ||
                !watch("gender") ||
                !watch("phoneNumber")
              }
              className={`h-14 rounded-xl items-center justify-center ${isLoading ||
                !!errors.name ||
                !!errors.birthDate ||
                !!errors.gender ||
                !!errors.phoneNumber ||
                !watch("name") ||
                !watch("birthDate") ||
                !watch("gender") ||
                !watch("phoneNumber")
                ? "bg-gray-200"
                : "bg-blue-500"
                }`}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  className={`text-lg font-semibold ${isLoading ? "text-gray-400" : "text-white"
                    }`}
                >
                  인증번호 받기
                </Text>
              )}
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading || !verificationCode}
              className={`h-14 rounded-xl items-center justify-center ${isLoading || !verificationCode ? "bg-gray-200" : "bg-blue-500"
                }`}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  className={`text-lg font-semibold ${isLoading ? "text-gray-400" : "text-white"
                    }`}
                >
                  인증 완료
                </Text>
              )}
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* 이미 가입된 회원 모달 */}
      <AlreadyRegisteredModal
        visible={isAlreadyRegistered}
        onClose={() => setIsAlreadyRegistered(false)}
        onLogin={handleLoginRedirect}
      />
    </SafeAreaView>
  );
}
