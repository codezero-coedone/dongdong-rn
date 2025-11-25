import { apiClient } from "@/shared/api";
import type { CreatePostDto, Post, UpdatePostDto } from "../model/types";

/**
 * Post API
 * JSONPlaceholder API 사용 예시
 */
export const postApi = {
  /**
   * 모든 포스트 조회
   */
  async getPosts(): Promise<Post[]> {
    const response = await apiClient.get<Post[]>("/posts");
    return response.data;
  },

  /**
   * 단일 포스트 조회
   */
  async getPost(id: number): Promise<Post> {
    const response = await apiClient.get<Post>(`/posts/${id}`);
    return response.data;
  },

  /**
   * 사용자별 포스트 조회
   */
  async getPostsByUser(userId: number): Promise<Post[]> {
    const response = await apiClient.get<Post[]>(`/posts?userId=${userId}`);
    return response.data;
  },

  /**
   * 포스트 생성
   */
  async createPost(data: CreatePostDto): Promise<Post> {
    const response = await apiClient.post<Post>("/posts", data);
    return response.data;
  },

  /**
   * 포스트 수정
   */
  async updatePost(id: number, data: UpdatePostDto): Promise<Post> {
    const response = await apiClient.patch<Post>(`/posts/${id}`, data);
    return response.data;
  },

  /**
   * 포스트 삭제
   */
  async deletePost(id: number): Promise<void> {
    await apiClient.delete(`/posts/${id}`);
  },
};

export default postApi;
