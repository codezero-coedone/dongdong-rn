export type PermissionType =
  | "location"
  | "camera"
  | "storage"
  | "bluetooth"
  | "phone"
  | "contacts";

export interface PermissionItem {
  type: PermissionType;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
}

export interface PermissionScreenProps {
  /** 앱 이름 */
  appName?: string;
  /** 권한 목록 */
  permissions: PermissionItem[];
  /** 확인 버튼 클릭 시 */
  onConfirm?: () => void;
  /** 권한 요청 완료 후 콜백 */
  onComplete?: (results: Record<PermissionType, boolean>) => void;
}
