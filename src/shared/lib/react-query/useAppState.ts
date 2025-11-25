import { focusManager } from "@tanstack/react-query";
import { useEffect } from "react";
import type { AppStateStatus } from "react-native";
import { AppState, Platform } from "react-native";

/**
 * 앱 포커스 관리 함수
 */
function onAppStateChange(status: AppStateStatus) {
  // 웹에서는 기본 window focus 이벤트를 사용하므로 제외
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

/**
 * 앱 상태 관리 훅
 *
 * React Native의 AppState를 React Query의 focusManager와 연동하여
 * 앱이 포그라운드로 돌아올 때 자동 refetch를 트리거합니다.
 *
 * Best Practice from TanStack Query docs:
 * https://tanstack.com/query/latest/docs/framework/react/react-native
 */
export function useAppState() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);
}

export default useAppState;
