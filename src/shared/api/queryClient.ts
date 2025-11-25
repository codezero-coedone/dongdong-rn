import { QueryClient } from "@tanstack/react-query";

/**
 * TanStack Query Client 설정
 *
 * Best Practices:
 * - staleTime: 데이터가 "신선한" 상태로 유지되는 시간 (이 시간 동안 refetch 안 함)
 * - gcTime: 사용되지 않는 데이터가 캐시에 유지되는 시간 (이전 cacheTime)
 * - retry: 실패 시 재시도 횟수
 * - refetchOnWindowFocus: 창 포커스 시 자동 refetch
 * - refetchOnReconnect: 네트워크 재연결 시 자동 refetch
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 1분 동안 데이터를 "신선한" 상태로 유지
      staleTime: 1000 * 60,

      // 5분 동안 미사용 데이터를 캐시에 유지
      gcTime: 1000 * 60 * 5,

      // 실패 시 2번 재시도
      retry: 2,

      // 지수 백오프로 재시도 딜레이
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // 창 포커스 시 refetch
      refetchOnWindowFocus: true,

      // 네트워크 재연결 시 refetch
      refetchOnReconnect: true,

      // 마운트 시 stale 데이터만 refetch
      refetchOnMount: true,
    },
    mutations: {
      // 뮤테이션 실패 시 재시도 안 함
      retry: false,
    },
  },
});

export default queryClient;
