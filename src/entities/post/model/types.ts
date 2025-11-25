/**
 * Post 엔티티 타입 정의
 */
export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface CreatePostDto {
  title: string;
  body: string;
  userId: number;
}

export interface UpdatePostDto {
  title?: string;
  body?: string;
}
