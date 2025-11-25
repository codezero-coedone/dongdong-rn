import { PermissionItem } from "./types";

/**
 * 기본 권한 목록 설정
 * 앱에서 필요한 권한들을 정의합니다.
 */
export const DEFAULT_PERMISSIONS: PermissionItem[] = [
  {
    type: "location",
    title: "위치",
    description: "해당 권한을 허용해야하는 이유 및 예시",
    icon: "location",
    iconColor: "#3B82F6", // blue
  },
  {
    type: "camera",
    title: "카메라",
    description: "해당 권한을 허용해야하는 이유 및 예시",
    icon: "camera",
    iconColor: "#6B7280", // gray
  },
  {
    type: "storage",
    title: "저장공간",
    description: "해당 권한을 허용해야하는 이유 및 예시",
    icon: "folder",
    iconColor: "#3B82F6", // blue
  },
  {
    type: "bluetooth",
    title: "블루투스",
    description: "해당 권한을 허용해야하는 이유 및 예시",
    icon: "bluetooth",
    iconColor: "#3B82F6", // blue
  },
  {
    type: "phone",
    title: "전화",
    description: "해당 권한을 허용해야하는 이유 및 예시",
    icon: "call",
    iconColor: "#22C55E", // green
  },
  {
    type: "contacts",
    title: "연락처",
    description: "해당 권한을 허용해야하는 이유 및 예시",
    icon: "person",
    iconColor: "#3B82F6", // blue
  },
];
