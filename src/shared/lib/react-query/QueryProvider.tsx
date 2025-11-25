import { queryClient } from "@/shared/api";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { useAppState } from "./useAppState";
import { useOnlineManager } from "./useOnlineManager";

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * React Query 내부 설정 컴포넌트
 * 네트워크 상태 및 앱 상태 관리 훅을 초기화합니다.
 */
function QueryProviderInner({ children }: QueryProviderProps) {
  // React Native 최적화 훅
  useOnlineManager();
  useAppState();

  return <>{children}</>;
}

/**
 * React Query Provider
 *
 * 앱 전역에서 React Query를 사용할 수 있도록 설정합니다.
 * React Native 최적화 (네트워크 상태, 앱 포커스)가 포함되어 있습니다.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryProviderInner>{children}</QueryProviderInner>
    </QueryClientProvider>
  );
}

export default QueryProvider;
