import { ActivityIndicator, Pressable, Text } from "react-native";

export interface ButtonProps {
  children: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  shadow?: boolean;
}

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "lg",
  disabled = false,
  loading = false,
  fullWidth = true,
  shadow = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // 크기별 스타일
  const sizeStyles = {
    sm: "h-10 px-4",
    md: "h-12 px-5",
    lg: "h-14 px-6",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-base",
  };

  // variant별 스타일
  const variantStyles = {
    primary: isDisabled ? "bg-gray-200" : "bg-primary",
    secondary: isDisabled ? "bg-gray-100" : "bg-gray-100",
    outline: isDisabled
      ? "bg-white border border-gray-200"
      : "bg-white border border-gray-300",
    ghost: "bg-transparent",
  };

  const textStyles = {
    primary: isDisabled ? "text-gray-400" : "text-white",
    secondary: isDisabled ? "text-gray-400" : "text-gray-700",
    outline: isDisabled ? "text-gray-400" : "text-gray-700",
    ghost: isDisabled ? "text-gray-400" : "text-blue-500",
  };

  // 그림자 스타일 (primary + enabled + shadow prop)
  const shadowStyle =
    shadow && variant === "primary" && !isDisabled
      ? {
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }
      : {};

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={shadowStyle}
      className={`
        rounded-xl items-center justify-center
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? "w-full" : ""}
      `}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#FFFFFF" : "#6B7280"}
          size="small"
        />
      ) : (
        <Text
          className={`font-semibold ${textSizes[size]} ${textStyles[variant]}`}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}
