import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GuardianInfoModal } from "@/features/auth/ui/modals/GuardianInfoModal";
import { Button } from "@/shared/ui/Button";

type Role = "patient" | "guardian";

export default function RoleSelectionScreen() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isGuardianModalVisible, setIsGuardianModalVisible] = useState(false);

    const handleRoleSelect = (role: Role) => {
        if (role === "guardian") {
            setIsGuardianModalVisible(true);
        } else {
            setSelectedRole("patient");
        }
    };

    const handleGuardianConfirm = () => {
        setIsGuardianModalVisible(false);
        setSelectedRole("guardian");
    };

    const handleConfirm = () => {
        if (!selectedRole) return;
        // TODO: Save selected role to store/backend
        router.replace("/(tabs)");
    };

    const handleSkip = () => {
        router.replace("/(tabs)");
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-white">
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <Pressable onPress={() => router.back()} className="p-2">
                    <Ionicons name="chevron-back" size={24} color="#111" />
                </Pressable>
                <Text className="flex-1 text-center text-lg font-bold text-gray-900 mr-10">
                    환자 정보 입력
                </Text>
            </View>

            <View className="flex-1 px-6 pt-8">
                <Text className="text-2xl font-bold text-gray-900 mb-8 leading-9">
                    환자 본인이신가요,{"\n"}보호자이신가요?
                </Text>

                <View className="gap-4">
                    {/* Patient Card */}
                    <Pressable
                        onPress={() => handleRoleSelect("patient")}
                        className={`p-6 rounded-2xl border-2 ${selectedRole === "patient"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 bg-white"
                            }`}
                    >
                        <View className="flex-row justify-between items-start mb-2">
                            <Text
                                className={`text-lg font-bold ${selectedRole === "patient" ? "text-blue-600" : "text-gray-900"
                                    }`}
                            >
                                환자 본인입니다.
                            </Text>
                            {selectedRole === "patient" && (
                                <Ionicons name="checkmark" size={24} color="#2563EB" />
                            )}
                        </View>
                        <Text className="text-gray-500 text-sm">
                            본인의 간병이 필요한 경우 선택
                        </Text>
                    </Pressable>

                    {/* Guardian Card */}
                    <Pressable
                        onPress={() => handleRoleSelect("guardian")}
                        className={`p-6 rounded-2xl border-2 ${selectedRole === "guardian"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 bg-white"
                            }`}
                    >
                        <View className="flex-row justify-between items-start mb-2">
                            <Text
                                className={`text-lg font-bold ${selectedRole === "guardian"
                                        ? "text-blue-600"
                                        : "text-blue-500"
                                    }`}
                            >
                                보호자입니다.
                            </Text>
                            {selectedRole === "guardian" && (
                                <Ionicons name="checkmark" size={24} color="#2563EB" />
                            )}
                        </View>
                        <Text className="text-gray-500 text-sm">
                            가족 또는 지인을 대신해 간병을 신청하는 경우 선택
                        </Text>
                    </Pressable>
                </View>
            </View>

            {/* Footer Buttons */}
            <View className="px-6 pb-8 pt-4 flex-row gap-3">
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
                        onPress={handleConfirm}
                        disabled={!selectedRole}
                        size="lg"
                        fullWidth
                    >
                        확인
                    </Button>
                </View>
            </View>

            <GuardianInfoModal
                visible={isGuardianModalVisible}
                onConfirm={handleGuardianConfirm}
            />
        </SafeAreaView>
    );
}
