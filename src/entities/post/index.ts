// Model
export type { CreatePostDto, Post, UpdatePostDto } from "./model/types";

// API
export { postApi } from "./api/postApi";

// Queries
export {
  postKeys,
  useCreatePostMutation,
  useDeletePostMutation,
  usePostQuery,
  usePostsByUserQuery,
  usePostsQuery,
  useUpdatePostMutation,
} from "./api/queries";
