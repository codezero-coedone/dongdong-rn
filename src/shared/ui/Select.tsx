import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string> {
  options: SelectOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function Select<T extends string>({
  options,
  value,
  onChange,
  placeholder = "선택",
  disabled = false,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (selectedValue: T) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={`h-14 px-4 border border-gray-200 rounded-xl flex-row items-center justify-between ${
          disabled ? "opacity-50 bg-gray-50" : "bg-white"
        }`}
      >
        <Text
          className={`text-base ${
            selectedOption ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <Text className="text-gray-400">▼</Text>
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          onPress={() => setIsOpen(false)}
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View className="bg-white rounded-t-2xl max-h-[50%]">
            <View className="h-1 w-10 bg-gray-300 rounded-full self-center my-3" />
            <ScrollView className="pb-8">
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  className={`h-14 px-6 justify-center border-b border-gray-100 ${
                    value === option.value ? "bg-blue-50" : ""
                  }`}
                >
                  <Text
                    className={`text-base ${
                      value === option.value
                        ? "text-blue-600 font-medium"
                        : "text-gray-900"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

// 시간 옵션 생성 헬퍼
export const generateTimeOptions = (): SelectOption<string>[] => {
  const options: SelectOption<string>[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const time = `${hour.toString().padStart(2, "0")}:00`;
    options.push({ value: time, label: time });
  }
  return options;
};

export const TIME_OPTIONS = generateTimeOptions();
