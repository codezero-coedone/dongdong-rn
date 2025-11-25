import { Modal, Pressable, Text, View } from "react-native";

export interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  onClose: () => void;
}

export function AlertModal({
  visible,
  title,
  message,
  primaryButtonText = "확인",
  secondaryButtonText,
  onPrimaryPress,
  onSecondaryPress,
  onClose,
}: AlertModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <View className="bg-white rounded-2xl mx-6 w-[90%] max-w-[340px] overflow-hidden">
          {/* Close Button */}
          <Pressable
            onPress={onClose}
            className="absolute top-4 right-4 z-10"
            hitSlop={8}
          >
            <Text className="text-xl text-gray-400">✕</Text>
          </Pressable>

          {/* Content */}
          <View className="px-6 pt-12 pb-6">
            <Text className="text-xl font-bold text-gray-900 text-center mb-4">
              {title}
            </Text>
            <Text className="text-base text-gray-500 text-center leading-6">
              {message}
            </Text>
          </View>

          {/* Buttons */}
          <View className="px-6 pb-6 gap-3">
            <Pressable
              onPress={onPrimaryPress}
              className="bg-blue-500 py-4 rounded-xl"
            >
              <Text className="text-white text-base font-semibold text-center">
                {primaryButtonText}
              </Text>
            </Pressable>

            {secondaryButtonText && onSecondaryPress && (
              <Pressable
                onPress={onSecondaryPress}
                className="bg-gray-100 py-4 rounded-xl"
              >
                <Text className="text-gray-700 text-base font-medium text-center">
                  {secondaryButtonText}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
