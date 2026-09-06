import type { UserResponse } from "../user/UserResponse";
import type { Tag } from "./PostDetailsResponse";

export interface PostResponse {
  id: number;
  content: string;
  imageUrl: string;
  user: UserResponse;
  createdAt: string;
  description: string;
  tags: Tag[];
}