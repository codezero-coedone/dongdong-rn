import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Accordion } from "@/shared/ui/Accordion";
import { Button } from "@/shared/ui/Button";
import { Checkbox } from "@/shared/ui/Checkbox";

export default function TermsScreen() {
    const router = useRouter();
    const [agreements, setAgreements] = useState({
        termsOfService: false,
        privacyPolicy: false,
        marketing: false,
    });

    const allChecked =
        agreements.termsOfService && agreements.privacyPolicy && agreements.marketing;

    const requiredChecked = agreements.termsOfService && agreements.privacyPolicy;

    const handleAllAgree = () => {
        const newValue = !allChecked;
        setAgreements({
            termsOfService: newValue,
            privacyPolicy: newValue,
            marketing: newValue,
        });
    };

    const toggleAgreement = (key: keyof typeof agreements) => {
        setAgreements((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSignup = () => {
        if (!requiredChecked) return;

        // TODO: 실제 회원가입 API 호출 (약관 동의 정보 포함)
        console.log("Signup with agreements:", agreements);

        // 역할 선택 화면으로 이동
        router.push("/(auth)/role-selection");
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-white">
            {/* 헤더 */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <Pressable onPress={() => router.back()} className="p-2">
                    <Ionicons name="chevron-back" size={24} color="#111" />
                </Pressable>
                <Text className="flex-1 text-center text-lg font-bold text-gray-900 mr-10">
                    권한 동의
                </Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-8">
                <Text className="text-xl font-bold text-gray-900 mb-2">
                    약관에 동의하시면
                </Text>
                <Text className="text-xl font-bold text-gray-900 mb-8">
                    회원가입이 완료됩니다.
                </Text>

                {/* 약관 전체 동의 */}
                <View className="mb-6 border rounded-xl border-gray-200 p-4 bg-gray-50">
                    <Checkbox
                        checked={allChecked}
                        onPress={handleAllAgree}
                        label="모두 동의하기"
                    />
                </View>

                {/* 개별 약관 */}
                <View className="gap-2">
                    <Accordion
                        title={
                            <Checkbox
                                checked={agreements.termsOfService}
                                onPress={() => toggleAgreement("termsOfService")}
                                label="이용약관"
                                required
                            />
                        }
                    >
                        <View className="bg-gray-50 p-4 rounded-lg">
                            <Text className="text-base font-bold text-gray-900 mb-2">
                                제1조(목적)
                            </Text>
                            <Text className="text-gray-600 leading-5">
                                이 약관은 회사(전자상거래 사업자)가 운영하는 사이버 몰(이하
                                "몰"이라 한다)에서 제공하는 인터넷 관련 서비스(이하 "서비스"라
                                한다)를 이용함에 있어 사이버 몰과 이용자의 권리, 의무 및
                                책임사항을 규정함을 목적으로 합니다.
                            </Text>
                        </View>
                    </Accordion>

                    <Accordion
                        title={
                            <Checkbox
                                checked={agreements.privacyPolicy}
                                onPress={() => toggleAgreement("privacyPolicy")}
                                label="개인정보 처리 방침"
                                required
                            />
                        }
                    >
                        <View className="bg-gray-50 p-4 rounded-lg">
                            <Text className="text-base font-bold text-gray-900 mb-2">
                                개인정보 수집 및 이용
                            </Text>
                            <Text className="text-gray-600 leading-5">
                                회사는 이용자의 개인정보를 중요시하며, "정보통신망 이용촉진 및
                                정보보호"에 관한 법률을 준수하고 있습니다. 회사는 개인정보처리방침을
                                통하여 고객님께서 제공하시는 개인정보가 어떠한 용도와 방식으로
                                이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지
                                알려드립니다.
                            </Text>
                        </View>
                    </Accordion>

                    <Accordion
                        title={
                            <Checkbox
                                checked={agreements.marketing}
                                onPress={() => toggleAgreement("marketing")}
                                label="마케팅 정보 수신 동의"
                            />
                        }
                    >
                        <View className="bg-gray-50 p-4 rounded-lg">
                            <Text className="text-base font-bold text-gray-900 mb-2">
                                마케팅 정보 수신
                            </Text>
                            <Text className="text-gray-600 leading-5">
                                이벤트 및 혜택 정보를 수신하시겠습니까? 동의를 거부하시더라도
                                서비스 이용에는 제한이 없습니다.
                            </Text>
                        </View>
                    </Accordion>
                </View>
            </ScrollView>

            {/* 하단 버튼 */}
            <View className="px-6 pb-8 pt-4 bg-white border-t border-gray-100">
                <Button
                    onPress={handleSignup}
                    disabled={!requiredChecked}
                    size="lg"
                >
                    가입하기
                </Button>
            </View>
        </SafeAreaView>
    );
}
