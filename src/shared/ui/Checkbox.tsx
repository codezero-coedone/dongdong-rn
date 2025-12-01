import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface CheckboxProps {
    checked: boolean;
    onPress: () => void;
    label: string;
    required?: boolean;
}

export function Checkbox({
    checked,
    onPress,
    label,
    required = false,
}: CheckboxProps) {
    return (
        <Pressable
            onPress={onPress}
            className="flex-row items-center py-3"
            hitSlop={8}
        >
            <View
                className={`w-6 h-6 rounded-md items-center justify-center border mr-3 ${checked ? "bg-primary border-primary" : "bg-white border-gray-300"
                    }`}
            >
                {checked && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text className="flex-1 text-base text-gray-900">
                {label}
                {required && <Text className="text-blue-500"> (필수)</Text>}
                {!required && <Text className="text-gray-400"> (선택)</Text>}
            </Text>
        </Pressable>
    );
}
