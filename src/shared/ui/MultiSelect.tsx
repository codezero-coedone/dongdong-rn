import { Pressable, Text, View } from "react-native";

export interface MultiSelectOption<T extends string> {
  value: T;
  label: string;
}

export interface MultiSelectProps<T extends string> {
  options: MultiSelectOption<T>[];
  values: T[];
  onChange: (values: T[]) => void;
  disabled?: boolean;
}

export function MultiSelect<T extends string>({
  options,
  values,
  onChange,
  disabled = false,
}: MultiSelectProps<T>) {
  const handleToggle = (value: T) => {
    if (disabled) return;

    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <View className="gap-3">
      {options.map((option) => {
        const isSelected = values.includes(option.value);

        return (
          <Pressable
            key={option.value}
            onPress={() => handleToggle(option.value)}
            disabled={disabled}
            className={`h-14 px-4 rounded-xl justify-center ${
              isSelected
                ? "border-2 border-blue-500 bg-blue-50"
                : "border border-gray-200 bg-white"
            } ${disabled ? "opacity-50" : ""}`}
          >
            <Text
              className={`text-base ${
                isSelected ? "text-blue-600 font-medium" : "text-gray-400"
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

// 간병인 자격증 옵션 프리셋
export const CAREGIVER_CERTIFICATE_OPTIONS: MultiSelectOption<string>[] = [
  { value: "care_worker", label: "요양보호사" },
  { value: "nurse_aide", label: "간호조무사" },
  { value: "postpartum_care", label: "산후관리사" },
  { value: "caregiver_private_1", label: "간병사(민간자격증)" },
  { value: "caregiver_private_2", label: "간병사(민간자격증)" },
];

// 경력 옵션 프리셋
export const EXPERIENCE_OPTIONS: MultiSelectOption<
  "newcomer" | "experienced"
>[] = [
  { value: "newcomer", label: "신입" },
  { value: "experienced", label: "경력" },
];
