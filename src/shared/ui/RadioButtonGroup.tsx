import { Pressable, Text, View } from "react-native";

export interface RadioOption<T extends string> {
  value: T;
  label: string;
}

export interface RadioButtonGroupProps<T extends string> {
  options: RadioOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  disabled?: boolean;
}

export function RadioButtonGroup<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
}: RadioButtonGroupProps<T>) {
  return (
    <View className="flex-row gap-3">
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={`flex-1 h-14 rounded-xl items-center justify-center ${
              isSelected ? "bg-blue-500" : "bg-white border border-gray-200"
            } ${disabled ? "opacity-50" : ""}`}
          >
            <Text
              className={`text-base font-medium ${
                isSelected ? "text-white" : "text-gray-400"
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// 성별 선택용 프리셋
export const GENDER_OPTIONS: RadioOption<"male" | "female">[] = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
];
