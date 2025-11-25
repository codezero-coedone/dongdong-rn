import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";

/**
 * 화면 포커스 시 refetch 훅
 *
 * 특정 화면이 다시 포커스될 때 stale 쿼리를 자동으로 refetch합니다.
 *
 * @param queryKey - refetch할 쿼리 키 (선택사항, 없으면 모든 active 쿼리)
 *
 * Best Practice from TanStack Query docs:
 * https://tanstack.com/query/latest/docs/framework/react/react-native
 */
export function useRefreshOnFocus<T extends readonly unknown[]>(queryKey?: T) {
  const queryClient = useQueryClient();
  const firstTimeRef = useRef(true);

  useFocusEffect(
    useCallback(() => {
      // 첫 번째 포커스(마운트)는 건너뜀
      if (firstTimeRef.current) {
        firstTimeRef.current = false;
        return;
      }

      // stale 상태인 active 쿼리들 refetch
      if (queryKey) {
        queryClient.refetchQueries({
          queryKey,
          stale: true,
          type: "active",
        });
      } else {
        queryClient.refetchQueries({
          stale: true,
          type: "active",
        });
      }
    }, [queryClient, queryKey])
  );
}

export default useRefreshOnFocus;
