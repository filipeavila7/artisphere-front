import type { PostSummaryResponse } from "../post/PostSummaryResponse";

export type NotificationType =
  | "COMMENT"
  | "LIKE"
  | "FOLLOW"
  | "MESSAGE"
  | "READ"
  | "FOLLOW_REQUEST"
  | "REPLY";


export type FollowRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";

export interface NotificationGetResponse {
  id: number;
  type: NotificationType;
  content: string;
  isRead: boolean;
  createdAt: string;
  senderId: number;
  senderName: string;
  senderUserName: string;
  senderPhoto: string;
  post: PostSummaryResponse;
  followRequestId: number;
  followRequestStatus: FollowRequestStatus;
}