import type { PostSummaryResponse } from "../post/PostSummaryResponse";
import type { UserResponse } from "../user/UserResponse";

export interface CommentResponse {
  id: number;
  content: string;
  createdAt: string;
  user: UserResponse;
  post: PostSummaryResponse;
  likedByMe: boolean;
  hasReplies?: boolean;
  totalReplys: number;
  totalLikes: number;
  replyToUsername?: string;
}