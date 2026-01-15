import { useRouter } from "expo-router";

import {
  DEFAULT_PERMISSIONS,
  PermissionScreen,
  PermissionType,
} from "@/shared/ui/permission-screen";
import { secureStorage } from "@/shared/lib/storage";
import { STORAGE_KEYS } from "@/shared/constants/storage";
import { devlog } from "@/shared/devtools/devlog";

export default function PermissionPage() {
  const router = useRouter();
  const DEVTOOLS_ENABLED = Boolean(__DEV__ || process.env.EXPO_PUBLIC_DEVTOOLS === "1");

  const handleComplete = (results: Record<PermissionType, boolean>) => {
    console.log("Permission results:", results);

    // 모든 권한이 허용되었는지 확인
    const allGranted = Object.values(results).every((granted) => granted);
    if (allGranted) {
      console.log("All permissions granted!");
    } else {
      console.log("Some permissions were denied");
    }

    if (DEVTOOLS_ENABLED) {
      const grantedCount = Object.values(results).filter(Boolean).length;
      devlog({
        scope: "SYS",
        level: allGranted ? "info" : "warn",
        message: `permission complete: granted=${grantedCount}/${Object.keys(results).length}`,
        meta: { allGranted },
      });
    }
  };

  const handleConfirm = async () => {
    // 권한 온보딩은 1회만 노출되도록 플래그 저장
    try {
      await secureStorage.set(STORAGE_KEYS.ONBOARDING_COMPLETE, "1");
    } catch {
      // ignore
    }
    if (DEVTOOLS_ENABLED) {
      devlog({ scope: "NAV", level: "info", message: "permission: confirm -> onboarding.step3" });
    }
    router.replace("/onboarding/step3");
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
