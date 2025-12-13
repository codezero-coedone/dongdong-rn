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
const patientConditionSchema = z.object({
    diagnosis: z.string().optional(),
    mobility: z.enum(["independent", "assistance", "total"], {
        required_error: "환자의 거동 상태를 선택해주세요",
    }),
    assistiveDevice: z.enum(["none", "cane", "wheelchair"]).optional(),
    otherAssistiveDevice: z.string().optional(),
    notes: z.string().max(200, "200자 이내로 입력해주세요").optional(),
});

type PatientConditionFormData = z.infer<typeof patientConditionSchema>;

export default function PatientConditionScreen() {
    const router = useRouter();

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<PatientConditionFormData>({
        resolver: zodResolver(patientConditionSchema),
        mode: "onChange",
        defaultValues: {
            diagnosis: "",
            mobility: undefined,
            assistiveDevice: "none",
            otherAssistiveDevice: "",
            notes: "",
        },
    });

    const notes = watch("notes");

    const onSubmit = (data: PatientConditionFormData) => {
        console.log("Patient Condition Submitted:", data);
        // TODO: Save patient condition to store/backend
        router.replace("/(tabs)");
    };

    const handleSkip = () => {
        router.replace("/(tabs)");
    };

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
                        <Text className="text-xl font-bold text-gray-900 mb-8 leading-8">
                            환자의 현재 증상 혹은 질환 및 상태를{"\n"}모두 입력해 주세요.
                        </Text>

                        {/* 진단명 */}
                        <View className="mb-6">
                            <Text className="text-base font-medium text-gray-900 mb-2">
                                진단명
                            </Text>
                            <Controller
                                control={control}
                                name="diagnosis"
                                render={({ field: { onChange, value, onBlur } }) => (
                                    <TextInput
                                        className="h-14 px-4 border border-gray-200 rounded-xl bg-white text-base text-gray-900"
                                        placeholder="진단명을 입력해 주세요."
                                        placeholderTextColor="#9CA3AF"
                                        value={value}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                    />
                                )}
                            />
                        </View>

                        {/* 환자의 거동 상태 */}
                        <View className="mb-6">
                            <View className="flex-row mb-2">
                                <Text className="text-base font-medium text-gray-900">
                                    환자의 거동 상태
                                </Text>
                                <Text className="text-red-500 ml-1">*</Text>
                            </View>
                            <Controller
                                control={control}
                                name="mobility"
                                render={({ field: { onChange, value } }) => (
                                    <View className="flex-row border border-gray-200 rounded-xl overflow-hidden">
                                        {[
                                            { label: "자립 가능", value: "independent" },
                                            { label: "부축 필요", value: "assistance" },
                                            { label: "전적 도움", value: "total" },
                                        ].map((option, index) => (
                                            <Pressable
                                                key={option.value}
                                                onPress={() => onChange(option.value)}
                                                className={`flex-1 h-12 items-center justify-center ${value === option.value ? "bg-blue-50" : "bg-white"
                                                    } ${index !== 2 ? "border-r border-gray-200" : ""}`}
                                            >
                                                <Text
                                                    className={`text-base font-medium ${value === option.value
                                                        ? "text-blue-600"
                                                        : "text-gray-500"
                                                        }`}
                                                >
                                                    {option.label}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                )}
                            />
                            {errors.mobility && (
                                <Text className="text-red-500 text-sm mt-1">
                                    {errors.mobility.message}
                                </Text>
                            )}
                        </View>

                        {/* 보조기구 사용 */}
                        <View className="mb-6">
                            <Text className="text-base font-medium text-gray-900 mb-2">
                                보조기구 사용
                            </Text>
                            <Controller
                                control={control}
                                name="assistiveDevice"
                                render={({ field: { onChange, value } }) => (
                                    <View className="flex-row border border-gray-200 rounded-xl overflow-hidden mb-3">
                                        {[
                                            { label: "없음", value: "none" },
                                            { label: "지팡이", value: "cane" },
                                            { label: "휠체어", value: "wheelchair" },
                                        ].map((option, index) => (
                                            <Pressable
                                                key={option.value}
                                                onPress={() => onChange(option.value)}
                                                className={`flex-1 h-12 items-center justify-center ${value === option.value ? "bg-blue-50" : "bg-white"
                                                    } ${index !== 2 ? "border-r border-gray-200" : ""}`}
                                            >
                                                <Text
                                                    className={`text-base font-medium ${value === option.value
                                                        ? "text-blue-600"
                                                        : "text-gray-500"
                                                        }`}
                                                >
                                                    {option.label}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                )}
                            />
                            <Controller
                                control={control}
                                name="otherAssistiveDevice"
                                render={({ field: { onChange, value, onBlur } }) => (
                                    <TextInput
                                        className="h-14 px-4 border border-gray-200 rounded-xl bg-white text-base text-gray-900"
                                        placeholder="기타"
                                        placeholderTextColor="#9CA3AF"
                                        value={value}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                    />
                                )}
                            />
                        </View>

                        {/* 특이사항 */}
                        <View className="mb-6">
                            <Text className="text-base font-medium text-gray-900 mb-2">
                                특이사항
                            </Text>
                            <Controller
                                control={control}
                                name="notes"
                                render={({ field: { onChange, value, onBlur } }) => (
                                    <View className="border border-gray-200 rounded-xl bg-white p-4 h-32">
                                        <TextInput
                                            className="flex-1 text-base text-gray-900 leading-5"
                                            placeholder="환자의 특이 상태, 복용할 약, 주의사항 등을 입력할 수 있는 영역입니다."
                                            placeholderTextColor="#9CA3AF"
                                            multiline
                                            textAlignVertical="top"
                                            value={value}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            maxLength={200}
                                        />
                                        <Text className="text-right text-gray-400 text-sm mt-2">
                                            {value?.length || 0}/200
                                        </Text>
                                    </View>
                                )}
                            />
                        </View>
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
                        <Button onPress={handleSubmit(onSubmit)} size="lg" fullWidth>
                            확인
                        </Button>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
