import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
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

import { Button } from "@/shared/ui/Button";
import { apiClient } from "@/shared/api/client";
import { useGuardianCareRequestStore } from "@/features/guardian";

// 유효성 검사 스키마
const patientConditionSchema = z.object({
    diagnosis: z.string().optional(),
    mobility: z.enum(["independent", "assistance", "total"], {
        required_error: "환자의 거동 상태를 선택해주세요",
    }),
    assistiveDevice: z.enum(["none", "cane", "wheelchair"]).optional(),
    otherAssistiveDevice: z.string().optional(),
    notes: z.string().max(200, "200자 이내로 입력해주세요").optional(),

    // 간병 신청(요청) 정보
    careType: z.enum(["HOSPITAL", "HOME", "NURSING_HOME"], {
        required_error: "간병 유형을 선택해주세요",
    }),
    startDate: z
        .string()
        .regex(/^\\d{4}-\\d{2}-\\d{2}$/, "시작일은 YYYY-MM-DD 형식이어야 합니다"),
    endDate: z
        .string()
        .regex(/^\\d{4}-\\d{2}-\\d{2}$/, "종료일은 YYYY-MM-DD 형식이어야 합니다"),
    location: z.string().min(1, "간병 장소를 입력해주세요"),
    dailyRate: z.string().optional(),
    requirements: z.string().optional(),
    preferredGender: z.enum(["NONE", "MALE", "FEMALE"]).optional(),
});

type PatientConditionFormData = z.infer<typeof patientConditionSchema>;

export default function PatientConditionScreen() {
    const router = useRouter();
    const patientBasic = useGuardianCareRequestStore((s) => s.patientBasic);
    const setPatientCondition = useGuardianCareRequestStore((s) => s.setPatientCondition);
    const resetAll = useGuardianCareRequestStore((s) => s.resetAll);

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
            careType: "HOSPITAL",
            startDate: "",
            endDate: "",
            location: "",
            dailyRate: "",
            requirements: "",
            preferredGender: "NONE",
        },
    });

    const notes = watch("notes");

    const toYmd = (yyyymmdd: string): string => {
        const digits = String(yyyymmdd).replace(/\\D/g, "");
        const y = digits.slice(0, 4);
        const m = digits.slice(4, 6);
        const d = digits.slice(6, 8);
        return `${y}-${m}-${d}`;
    };

    const toIsoZ = (ymd: string): string => `${ymd}T00:00:00Z`;

    const onSubmit = async (data: PatientConditionFormData) => {
        if (!patientBasic) {
            Alert.alert("오류", "환자 기본 정보가 없습니다. 다시 입력해주세요.");
            router.replace("/(auth)/patient-info");
            return;
        }

        setPatientCondition({
            diagnosis: data.diagnosis || undefined,
            mobility: data.mobility,
            assistiveDevice: data.assistiveDevice || undefined,
            otherAssistiveDevice: data.otherAssistiveDevice || undefined,
            notes: data.notes || undefined,
        });

        const gender = patientBasic.gender === "male" ? "MALE" : "FEMALE";

        const mobilityLevel =
            data.mobility === "independent"
                ? "INDEPENDENT"
                : data.mobility === "assistance"
                    ? "PARTIAL_ASSIST"
                    : "BEDRIDDEN";

        const assistiveDevices: string[] = [];
        if (data.assistiveDevice === "cane") assistiveDevices.push("지팡이");
        if (data.assistiveDevice === "wheelchair") assistiveDevices.push("휠체어");
        if (data.otherAssistiveDevice && data.otherAssistiveDevice.trim()) {
            assistiveDevices.push(data.otherAssistiveDevice.trim());
        }

        const heightNum =
            patientBasic.height && patientBasic.height.trim()
                ? Number(patientBasic.height)
                : undefined;
        const weightNum =
            patientBasic.weight && patientBasic.weight.trim()
                ? Number(patientBasic.weight)
                : undefined;

        const dailyRateNum =
            data.dailyRate && data.dailyRate.trim()
                ? Number(String(data.dailyRate).replace(/\\D/g, ""))
                : undefined;

        try {
            // 1) 환자 등록
            const patientRes = await apiClient.post("/patients", {
                name: patientBasic.name,
                birthDate: toYmd(patientBasic.birthDateYmd8),
                gender,
                height: Number.isFinite(heightNum) ? heightNum : undefined,
                weight: Number.isFinite(weightNum) ? weightNum : undefined,
                diagnosis: data.diagnosis || undefined,
                mobilityLevel,
                assistiveDevices: assistiveDevices.length > 0 ? assistiveDevices : undefined,
                notes: data.notes || undefined,
            });

            const patient = (patientRes as any)?.data?.data;
            const patientId: string | undefined = patient?.id;
            if (!patientId) {
                throw new Error("환자 등록 응답이 올바르지 않습니다.");
            }

            // 2) 간병 신청(요청) 생성
            await apiClient.post("/care-requests", {
                patientId,
                careType: data.careType,
                startDate: toIsoZ(data.startDate),
                endDate: toIsoZ(data.endDate),
                location: data.location,
                requirements: data.requirements || undefined,
                dailyRate: Number.isFinite(dailyRateNum) ? dailyRateNum : undefined,
                preferredCaregiverGender:
                    data.preferredGender && data.preferredGender !== "NONE"
                        ? data.preferredGender
                        : undefined,
            });

            resetAll();
            Alert.alert("완료", "환자 등록과 간병 신청이 완료되었습니다.");
            router.replace("/(tabs)");
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ||
                e?.message ||
                "등록/신청 처리 중 오류가 발생했습니다.";
            Alert.alert("오류", String(msg));
        }
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

                        <View className="h-4" />
                        <Text className="text-xl font-bold text-gray-900 mb-6">
                            간병 신청 정보를 입력해 주세요.
                        </Text>

                        {/* 간병 유형 */}
                        <View className="mb-6">
                            <View className="flex-row mb-2">
                                <Text className="text-base font-medium text-gray-900">
                                    간병 유형
                                </Text>
                                <Text className="text-red-500 ml-1">*</Text>
                            </View>
                            <Controller
                                control={control}
                                name="careType"
                                render={({ field: { onChange, value } }) => (
                                    <View className="flex-row border border-gray-200 rounded-xl overflow-hidden">
                                        {[
                                            { label: "병원", value: "HOSPITAL" },
                                            { label: "가정", value: "HOME" },
                                            { label: "요양원", value: "NURSING_HOME" },
                                        ].map((opt, idx) => (
                                            <Pressable
                                                key={opt.value}
                                                onPress={() => onChange(opt.value)}
                                                className={`flex-1 h-12 items-center justify-center ${value === opt.value ? "bg-blue-50" : "bg-white"
                                                    } ${idx !== 2 ? "border-r border-gray-200" : ""}`}
                                            >
                                                <Text
                                                    className={`text-base font-medium ${value === opt.value ? "text-blue-600" : "text-gray-500"
                                                        }`}
                                                >
                                                    {opt.label}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                )}
                            />
                            {errors.careType && (
                                <Text className="text-red-500 text-sm mt-1">
                                    {errors.careType.message as any}
                                </Text>
                            )}
                        </View>

                        {/* 기간 */}
                        <View className="mb-6">
                            <View className="flex-row mb-2">
                                <Text className="text-base font-medium text-gray-900">
                                    간병 기간
                                </Text>
                                <Text className="text-red-500 ml-1">*</Text>
                            </View>
                            <Controller
                                control={control}
                                name="startDate"
                                render={({ field: { onChange, value, onBlur } }) => (
                                    <TextInput
                                        className="h-14 px-4 border border-gray-200 rounded-xl bg-white text-base text-gray-900 mb-2"
                                        placeholder="시작일 (YYYY-MM-DD)"
                                        placeholderTextColor="#9CA3AF"
                                        value={value}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                    />
                                )}
                            />
                            {errors.startDate && (
                                <Text className="text-red-500 text-sm mt-1">
                                    {errors.startDate.message}
                                </Text>
                            )}
                            <Controller
                                control={control}
                                name="endDate"
                                render={({ field: { onChange, value, onBlur } }) => (
                                    <TextInput
                                        className="h-14 px-4 border border-gray-200 rounded-xl bg-white text-base text-gray-900"
                                        placeholder="종료일 (YYYY-MM-DD)"
                                        placeholderTextColor="#9CA3AF"
                                        value={value}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                    />
                                )}
                            />
                            {errors.endDate && (
                                <Text className="text-red-500 text-sm mt-1">
                                    {errors.endDate.message}
                                </Text>
                            )}
                        </View>

                        {/* 장소 */}
                        <View className="mb-6">
                            <View className="flex-row mb-2">
                                <Text className="text-base font-medium text-gray-900">
                                    간병 장소
                                </Text>
                                <Text className="text-red-500 ml-1">*</Text>
                            </View>
                            <Controller
                                control={control}
                                name="location"
                                render={({ field: { onChange, value, onBlur } }) => (
                                    <TextInput
                                        className="h-14 px-4 border border-gray-200 rounded-xl bg-white text-base text-gray-900"
                                        placeholder="예) 서울대학교병원 501호"
                                        placeholderTextColor="#9CA3AF"
                                        value={value}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                    />
                                )}
                            />
                            {errors.location && (
                                <Text className="text-red-500 text-sm mt-1">
                                    {errors.location.message}
                                </Text>
                            )}
                        </View>

                        {/* 희망 일당 */}
                        <View className="mb-6">
                            <Text className="text-base font-medium text-gray-900 mb-2">
                                희망 일당(선택)
                            </Text>
                            <Controller
                                control={control}
                                name="dailyRate"
                                render={({ field: { onChange, value, onBlur } }) => (
                                    <TextInput
                                        className="h-14 px-4 border border-gray-200 rounded-xl bg-white text-base text-gray-900"
                                        placeholder="예) 150000"
                                        placeholderTextColor="#9CA3AF"
                                        value={value}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        keyboardType="number-pad"
                                    />
                                )}
                            />
                        </View>

                        {/* 희망 간병인 성별 */}
                        <View className="mb-6">
                            <Text className="text-base font-medium text-gray-900 mb-2">
                                희망 간병인 성별(선택)
                            </Text>
                            <Controller
                                control={control}
                                name="preferredGender"
                                render={({ field: { onChange, value } }) => (
                                    <View className="flex-row border border-gray-200 rounded-xl overflow-hidden">
                                        {[
                                            { label: "무관", value: "NONE" },
                                            { label: "여성", value: "FEMALE" },
                                            { label: "남성", value: "MALE" },
                                        ].map((opt, idx) => (
                                            <Pressable
                                                key={opt.value}
                                                onPress={() => onChange(opt.value)}
                                                className={`flex-1 h-12 items-center justify-center ${value === opt.value ? "bg-blue-50" : "bg-white"
                                                    } ${idx !== 2 ? "border-r border-gray-200" : ""}`}
                                            >
                                                <Text
                                                    className={`text-base font-medium ${value === opt.value ? "text-blue-600" : "text-gray-500"
                                                        }`}
                                                >
                                                    {opt.label}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                )}
                            />
                        </View>

                        {/* 요청 사항 */}
                        <View className="mb-6">
                            <Text className="text-base font-medium text-gray-900 mb-2">
                                요청 사항(선택)
                            </Text>
                            <Controller
                                control={control}
                                name="requirements"
                                render={({ field: { onChange, value, onBlur } }) => (
                                    <View className="border border-gray-200 rounded-xl bg-white p-4 h-28">
                                        <TextInput
                                            className="flex-1 text-base text-gray-900 leading-5"
                                            placeholder="예) 식사 보조 필요, 이동 시 부축 필요"
                                            placeholderTextColor="#9CA3AF"
                                            multiline
                                            textAlignVertical="top"
                                            value={value}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            maxLength={200}
                                        />
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
