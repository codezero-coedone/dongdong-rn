import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreatePostDto, UpdatePostDto } from "../model/types";
import { postApi } from "./postApi";

/**
 * Post Query Keys
 * 쿼리 키를 중앙에서 관리하여 일관성 유지
 */
export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters?: string) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
  byUser: (userId: number) => [...postKeys.all, "user", userId] as const,
};

/**
 * 모든 포스트 조회 쿼리
 */
export function usePostsQuery() {
  return useQuery({
    queryKey: postKeys.lists(),
    queryFn: () => postApi.getPosts(),
  });
}

/**
 * 단일 포스트 조회 쿼리
 */
export function usePostQuery(id: number) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postApi.getPost(id),
    enabled: !!id, // id가 있을 때만 쿼리 실행
  });
}

/**
 * 사용자별 포스트 조회 쿼리
 */
export function usePostsByUserQuery(userId: number) {
  return useQuery({
    queryKey: postKeys.byUser(userId),
    queryFn: () => postApi.getPostsByUser(userId),
    enabled: !!userId,
  });
}

/**
 * 포스트 생성 뮤테이션
 */
export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostDto) => postApi.createPost(data),
    onSuccess: () => {
      // 포스트 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

/**
 * 포스트 수정 뮤테이션
 */
export function useUpdatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePostDto }) =>
      postApi.updatePost(id, data),
    onSuccess: (_, variables) => {
      // 해당 포스트 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: postKeys.detail(variables.id),
      });
      // 목록 캐시도 무효화
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

/**
 * 포스트 삭제 뮤테이션
 */
export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => postApi.deletePost(id),
    onSuccess: () => {
      // 포스트 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}
