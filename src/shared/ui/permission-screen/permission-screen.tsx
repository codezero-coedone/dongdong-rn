import { Ionicons } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import * as Contacts from "expo-contacts";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PermissionItem, PermissionScreenProps, PermissionType } from "./types";

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  location: "location",
  camera: "camera",
  storage: "folder",
  bluetooth: "bluetooth",
  phone: "call",
  contacts: "person",
};

async function requestPermission(type: PermissionType): Promise<boolean> {
  try {
    switch (type) {
      case "location": {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === "granted";
      }
      case "camera": {
        const { status } = await Camera.requestCameraPermissionsAsync();
        return status === "granted";
      }
      case "storage": {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        return status === "granted";
      }
      case "contacts": {
        const { status } = await Contacts.requestPermissionsAsync();
        return status === "granted";
      }
      case "bluetooth": {
        // Bluetooth permissions are handled differently on iOS/Android
        // For now, we'll just return true and handle it in native code
        if (Platform.OS === "android") {
          // Android 12+ requires BLUETOOTH_CONNECT permission
          // This would typically be handled by a native module
          return true;
        }
        return true;
      }
      case "phone": {
        // Phone permissions are typically for making calls
        // Not directly supported in Expo, would need native module
        return true;
      }
      default:
        return false;
    }
  } catch (error) {
    console.error(`Permission request failed for ${type}:`, error);
    return false;
  }
}

function PermissionRow({ item }: { item: PermissionItem }) {
  const iconName = ICON_MAP[item.type] || "help-circle";

  return (
    <View className="flex-row items-center py-4 border-b border-gray-100">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: `${item.iconColor}15` }}
      >
        <Ionicons name={iconName} size={22} color={item.iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900 mb-0.5">
          {item.title}
        </Text>
        <Text className="text-sm text-gray-500">{item.description}</Text>
      </View>
    </View>
  );
}

export function PermissionScreen({
  appName = "앱",
  permissions,
  onConfirm,
  onComplete,
}: PermissionScreenProps) {
  const insets = useSafeAreaInsets();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleConfirm = async () => {
    setIsRequesting(true);

    const results: Record<PermissionType, boolean> = {
      location: false,
      camera: false,
      storage: false,
      bluetooth: false,
      phone: false,
      contacts: false,
    };

    for (const permission of permissions) {
      const granted = await requestPermission(permission.type);
      results[permission.type] = granted;

      if (!granted) {
        // Show alert if permission denied
        Alert.alert(
          "권한 거부됨",
          `${permission.title} 권한이 거부되었습니다. 설정에서 직접 권한을 허용해주세요.`,
          [
            { text: "취소", style: "cancel" },
            {
              text: "설정으로 이동",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    }

    setIsRequesting(false);
    onComplete?.(results);
    onConfirm?.();
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View className="pt-12 pb-8">
          <Text className="text-2xl font-bold text-gray-900 leading-9">
            안전하고 간편한 {appName} 이용을 위해{"\n"}아래 권한 허용이
            필요해요.
          </Text>
        </View>

        {/* Section Label */}
        <Text className="text-sm text-gray-400 mb-2">선택 권한</Text>

        {/* Permission List */}
        <View>
          {permissions.map((permission) => (
            <PermissionRow key={permission.type} item={permission} />
          ))}
        </View>

        {/* Footer Notice */}
        <View className="mt-8">
          <Text className="text-xs text-gray-400 leading-5">
            선택 권한의 경우 허용하지 않으셔도 앱 이용은 가능하나, 일부 서비스
            이용에 제한이 있을 수 있습니다.
          </Text>
          <Text className="text-xs text-gray-400 mt-2 leading-5">
            '디바이스 설정 {">"} 애플리케이션 권한'에서 각 권한 별 변경이
            가능합니다.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View
        className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-white"
        style={{ paddingBottom: Math.max(insets.bottom, 32) }}
      >
        <Pressable
          className="h-14 rounded-xl items-center justify-center"
          style={{ backgroundColor: isRequesting ? "#93C5FD" : "#3B82F6" }}
          onPress={handleConfirm}
          disabled={isRequesting}
        >
          <Text className="text-white text-lg font-semibold">
            {isRequesting ? "권한 요청 중..." : "확인"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
