import type { PostResponse } from "../post/PostResponse";

export interface LikeResponse {
  post: PostResponse;
  createdAt: string;
}