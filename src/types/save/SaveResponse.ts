import type { PostResponse } from "../post/PostResponse";

export interface SaveResponse {
  createdAt: string;
  postResponse: PostResponse;
}