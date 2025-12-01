import { useRouter } from "expo-router";

import {
  DEFAULT_PERMISSIONS,
  PermissionScreen,
  PermissionType,
} from "@/shared/ui/permission-screen";

export default function PermissionPage() {
  const router = useRouter();

  const handleComplete = (results: Record<PermissionType, boolean>) => {
    console.log("Permission results:", results);

    // 모든 권한이 허용되었는지 확인
    const allGranted = Object.values(results).every((granted) => granted);
    if (allGranted) {
      console.log("All permissions granted!");
    } else {
      console.log("Some permissions were denied");
    }
  };

  const handleConfirm = () => {
    // 권한 요청 완료 후 다음 화면으로 이동
    router.replace("/(auth)/login");
  };

  return (
    <PermissionScreen
      appName="동동"
      permissions={DEFAULT_PERMISSIONS}
      onComplete={handleComplete}
      onConfirm={handleConfirm}
    />
  );
}
