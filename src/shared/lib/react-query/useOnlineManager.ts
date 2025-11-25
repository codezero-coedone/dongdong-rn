import { onlineManager } from "@tanstack/react-query";
import * as Network from "expo-network";
import { useEffect } from "react";

/**
 * 네트워크 상태 관리 훅
 *
 * React Query의 onlineManager를 expo-network와 연동하여
 * 네트워크 상태 변화를 감지하고 자동 refetch를 트리거합니다.
 *
 * Best Practice from TanStack Query docs:
 * https://tanstack.com/query/latest/docs/framework/react/react-native
 */
export function useOnlineManager() {
  useEffect(() => {
    // expo-network의 네트워크 상태 리스너 등록
    const subscription = Network.addNetworkStateListener((state) => {
      onlineManager.setOnline(!!state.isConnected);
    });

    // 초기 네트워크 상태 설정
    Network.getNetworkStateAsync().then((state) => {
      onlineManager.setOnline(!!state.isConnected);
    });

    // 클린업
    return () => {
      subscription.remove();
    };
  }, []);
}

export default useOnlineManager;
