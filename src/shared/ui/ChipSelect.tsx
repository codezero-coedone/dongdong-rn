import { Pressable, Text, View } from "react-native";

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

export interface ChipSelectProps<T extends string> {
  options: ChipOption<T>[];
  values: T[];
  onChange: (values: T[]) => void;
  multiple?: boolean;
  disabled?: boolean;
}

export function ChipSelect<T extends string>({
  options,
  values,
  onChange,
  multiple = true,
  disabled = false,
}: ChipSelectProps<T>) {
  const handleToggle = (value: T) => {
    if (disabled) return;

    if (multiple) {
      if (values.includes(value)) {
        onChange(values.filter((v) => v !== value));
      } else {
        onChange([...values, value]);
      }
    } else {
      onChange([value]);
    }
  };

  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = values.includes(option.value);

        return (
          <Pressable
            key={option.value}
            onPress={() => handleToggle(option.value)}
            disabled={disabled}
            className={`h-10 px-4 rounded-full items-center justify-center ${
              isSelected ? "bg-blue-500" : "bg-white border border-gray-200"
            } ${disabled ? "opacity-50" : ""}`}
          >
            <Text
              className={`text-sm font-medium ${
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

// 요일 옵션 프리셋
export const DAY_OPTIONS: ChipOption<string>[] = [
  { value: "mon", label: "월" },
  { value: "tue", label: "화" },
  { value: "wed", label: "수" },
  { value: "thu", label: "목" },
  { value: "fri", label: "금" },
  { value: "sat", label: "토" },
  { value: "sun", label: "일" },
  { value: "negotiable", label: "협의가능" },
];

// 근무 시간 옵션 프리셋
export const WORK_TIME_OPTIONS: ChipOption<string>[] = [
  { value: "night", label: "야간 근무 가능" },
  { value: "24hours", label: "24시간 근무 가능" },
  { value: "negotiable", label: "협의가능" },
];
