import { Pressable, Text, View } from "react-native";

export interface Tag {
  id: string;
  label: string;
}

export interface TagInputProps {
  tags: Tag[];
  onRemove: (id: string) => void;
  onAdd: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TagInput({
  tags,
  onRemove,
  onAdd,
  placeholder = "+ 추가하기",
  disabled = false,
}: TagInputProps) {
  return (
    <View className="gap-2">
      {/* 태그 목록 */}
      {tags.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {tags.map((tag) => (
            <View
              key={tag.id}
              className="flex-row items-center h-9 px-3 bg-gray-100 rounded-full"
            >
              <Text className="text-sm text-gray-700 mr-1">{tag.label}</Text>
              <Pressable
                onPress={() => !disabled && onRemove(tag.id)}
                hitSlop={4}
                disabled={disabled}
              >
                <Text className="text-gray-400 text-sm">✕</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* 추가 버튼 */}
      <Pressable
        onPress={onAdd}
        disabled={disabled}
        className={`h-14 border border-gray-200 rounded-xl items-center justify-center ${
          disabled ? "opacity-50" : ""
        }`}
      >
        <Text className="text-gray-400 text-sm">{placeholder}</Text>
      </Pressable>
    </View>
  );
}
