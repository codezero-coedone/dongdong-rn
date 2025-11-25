import { Stack } from "expo-router";

export default function GuardianLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="register" />
    </Stack>
  );
}
