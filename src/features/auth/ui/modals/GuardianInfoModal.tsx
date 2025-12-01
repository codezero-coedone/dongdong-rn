import { Modal, Text, View } from "react-native";

import { Button } from "@/shared/ui/Button";

interface GuardianInfoModalProps {
    visible: boolean;
    onConfirm: () => void;
}

export function GuardianInfoModal({
    visible,
    onConfirm,
}: GuardianInfoModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/50 items-center justify-center px-6">
                <View className="bg-white rounded-2xl w-full p-6 items-center">
                    <Text className="text-lg font-bold text-gray-900 mb-6">
                        보호자 회원의 정보 입력
                    </Text>

                    <View className="bg-purple-50 p-4 rounded-xl w-full mb-8">
                        <Text className="text-gray-800 text-center leading-6">
                            환자 본인이 아닌 보호자 회원이 환자의 개인 정보를 입력하는 경우,
                            보호자 회원은 환자로부터 해당 정보를 입력할 권한을 명시적으로 위임
                            받았거나 정당한 대리권을 보유하고 있어야 합니다.
                        </Text>
                    </View>

                    <Button onPress={onConfirm} fullWidth>
                        확인했습니다.
                    </Button>
                </View>
            </View>
        </Modal>
    );
}
