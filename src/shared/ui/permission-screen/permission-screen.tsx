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
  StyleSheet,
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
    <View style={styles.row}>
      <View
        style={[styles.iconWrap, { backgroundColor: `${item.iconColor}15` }]}
      >
        <Ionicons name={iconName} size={22} color={item.iconColor} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowDesc}>{item.description}</Text>
      </View>
    </View>
  );
}

async function getCurrentPermission(type: PermissionType): Promise<boolean> {
  try {
    switch (type) {
      case "location": {
        const { status } = await Location.getForegroundPermissionsAsync();
        return status === "granted";
      }
      case "camera": {
        const { status } = await Camera.getCameraPermissionsAsync();
        return status === "granted";
      }
      case "storage": {
        const { status } = await MediaLibrary.getPermissionsAsync();
        return status === "granted";
      }
      case "contacts": {
        const { status } = await Contacts.getPermissionsAsync();
        return status === "granted";
      }
      case "bluetooth":
      case "phone":
        return true;
      default:
        return false;
    }
  } catch {
    return false;
  }
}

async function buildCurrentResults(
  permissions: PermissionItem[],
): Promise<Record<PermissionType, boolean>> {
  const results: Record<PermissionType, boolean> = {
    location: false,
    camera: false,
    storage: false,
    bluetooth: false,
    phone: false,
    contacts: false,
  };
  for (const p of permissions) {
    results[p.type] = await getCurrentPermission(p.type);
  }
  return results;
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

    // If already granted, don't re-prompt (prevents repeated dialogs on every entry)
    const results = await buildCurrentResults(permissions);
    const allBeforeGranted = Object.values(results).every(Boolean);
    if (allBeforeGranted) {
      setIsRequesting(false);
      onComplete?.(results);
      onConfirm?.();
      return;
    }

    for (const permission of permissions) {
      if (results[permission.type]) continue;
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
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 0) },
      ]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleBox}>
          <Text style={styles.title}>
            안전하고 간편한 {appName} 이용을 위해{"\n"}아래 권한 허용이
            필요해요.
          </Text>
        </View>

        {/* Section Label */}
        <Text style={styles.sectionLabel}>선택 권한</Text>

        {/* Permission List */}
        <View style={styles.list}>
          {permissions.map((permission) => (
            <PermissionRow key={permission.type} item={permission} />
          ))}
        </View>

        {/* Footer Notice */}
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            선택 권한의 경우 허용하지 않으셔도 앱 이용은 가능하나, 일부 서비스
            이용에 제한이 있을 수 있습니다.
          </Text>
          <Text style={[styles.noticeText, { marginTop: 8 }]}>
            {`'디바이스 설정 > 애플리케이션 권한'에서 각 권한 별 변경이 가능합니다.`}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 32) }]}
      >
        <Pressable
          style={[
            styles.btn,
            { backgroundColor: isRequesting ? "#93C5FD" : "#3B82F6" },
          ]}
          onPress={handleConfirm}
          disabled={isRequesting}
        >
          <Text style={styles.btnText}>
            {isRequesting ? "권한 요청 중..." : "확인"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 140 },
  titleBox: { paddingTop: 48, paddingBottom: 24 },
  title: { fontSize: 22, fontWeight: "800", color: "#111827", lineHeight: 30 },
  sectionLabel: { fontSize: 12, color: "#9CA3AF", marginBottom: 6 },
  list: { borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 2 },
  rowDesc: { fontSize: 13, color: "#6B7280", lineHeight: 18 },
  notice: { marginTop: 18 },
  noticeText: { fontSize: 12, color: "#9CA3AF", lineHeight: 18 },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  btn: {
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
