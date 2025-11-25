import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
}

export function Header({
  title,
  showBackButton = true,
  onBackPress,
  rightElement,
}: HeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View className="flex-row items-center justify-between h-14 px-4 bg-white border-b border-gray-100">
      {/* Left: Back Button */}
      <View className="w-10">
        {showBackButton && (
          <Pressable onPress={handleBackPress} hitSlop={8}>
            <Text className="text-2xl text-gray-900">←</Text>
          </Pressable>
        )}
      </View>

      {/* Center: Title */}
      <Text className="text-base font-semibold text-gray-900">{title}</Text>

      {/* Right: Optional Element */}
      <View className="w-10 items-end">{rightElement}</View>
    </View>
  );
}
