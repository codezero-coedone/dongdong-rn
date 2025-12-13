import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
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
import { z } from "zod";

import { Button } from "@/shared/ui/Button";

// 유효성 검사 스키마
const patientInfoSchema = z.object({
    relationship: z.string().optional(),
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
    gender: z.enum(["male", "female"]).optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
});

type PatientInfoFormData = z.infer<typeof patientInfoSchema>;

export default function PatientInfoScreen() {
    const router = useRouter();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<PatientInfoFormData>({
        resolver: zodResolver(patientInfoSchema),
        mode: "onChange",
        defaultValues: {
            relationship: "",
            name: "",
            birthDate: "",
            gender: undefined,
            height: "",
            weight: "",
        },
    });

    const onSubmit = (data: PatientInfoFormData) => {
        console.log("Patient Info Submitted:", data);
        // TODO: Save patient info to store/backend
        router.push("/(auth)/patient-condition");
    };

    const handleSkip = () => {
        router.replace("/(tabs)");
    };

    // 입력 필드 렌더링 헬퍼
    const renderInput = (
        name: keyof PatientInfoFormData,
        label: string,
        placeholder: string,
        required: boolean = false,
        keyboardType: "default" | "number-pad" = "default",
        maxLength?: number
    ) => (
        <View className="mb-6">
            <View className="flex-row mb-2">
                <Text className="text-base font-medium text-gray-900">{label}</Text>
                {required && <Text className="text-red-500 ml-1">*</Text>}
            </View>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, value, onBlur } }) => {
                    const hasError = !!errors[name];
                    return (
                        <TextInput
                            className={`h-14 px-4 border rounded-xl bg-white text-base text-gray-900 ${hasError ? "border-red-300 bg-red-50" : "border-gray-200"
                                }`}
                            placeholder={placeholder}
                            placeholderTextColor="#9CA3AF"
                            value={value as string}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            keyboardType={keyboardType}
                            maxLength={maxLength}
                        />
                    );
                }}
            />
            {errors[name] && (
                <Text className="text-red-500 text-sm mt-1">
                    {errors[name]?.message}
                </Text>
            )}
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
                    환자 정보 입력
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
                        <Text className="text-xl font-bold text-gray-900 mb-8">
                            환자 정보를 입력해 주세요.
                        </Text>

                        {/* 환자와 관계 */}
                        {renderInput("relationship", "환자와 관계", "자녀, 남편 등")}

                        {/* 이름 */}
                        {renderInput("name", "이름", "이름을 입력해주세요.", true)}

                        {/* 생년월일 */}
                        {renderInput(
                            "birthDate",
                            "생년월일",
                            "20060101",
                            true,
                            "number-pad",
                            8
                        )}

                        {/* 성별 */}
                        <View className="mb-6">
                            <Controller
                                control={control}
                                name="gender"
                                render={({ field: { onChange, value } }) => (
                                    <View className="flex-row gap-0 border border-gray-200 rounded-xl overflow-hidden">
                                        <Pressable
                                            onPress={() => onChange("male")}
                                            className={`flex-1 h-12 items-center justify-center ${value === "male" ? "bg-blue-50" : "bg-white"
                                                } ${value === "male" ? "border-r border-blue-200" : ""}`}
                                        >
                                            <Text
                                                className={`text-base font-medium ${value === "male" ? "text-blue-600" : "text-gray-500"
                                                    }`}
                                            >
                                                남성
                                            </Text>
                                        </Pressable>
                                        <View className="w-[1px] bg-gray-200" />
                                        <Pressable
                                            onPress={() => onChange("female")}
                                            className={`flex-1 h-12 items-center justify-center ${value === "female" ? "bg-blue-50" : "bg-white"
                                                }`}
                                        >
                                            <Text
                                                className={`text-base font-medium ${value === "female" ? "text-blue-600" : "text-gray-500"
                                                    }`}
                                            >
                                                여성
                                            </Text>
                                        </Pressable>
                                    </View>
                                )}
                            />
                        </View>

                        {/* 키 */}
                        {renderInput("height", "키", "170", false, "number-pad")}

                        {/* 몸무게 */}
                        {renderInput("weight", "몸무게", "76", false, "number-pad")}
                    </ScrollView>
                </TouchableWithoutFeedback>

                {/* 하단 버튼 */}
                <View className="px-6 pb-8 pt-4 bg-white border-t border-gray-100 flex-row gap-3">
                    <View className="flex-1">
                        <Button
                            onPress={handleSkip}
                            variant="outline"
                            size="lg"
                            fullWidth
                        >
                            나중에 하기
                        </Button>
                    </View>
                    <View className="flex-1">
                        <Button
                            onPress={handleSubmit(onSubmit)}
                            size="lg"
                            fullWidth
                        >
                            다음
                        </Button>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
