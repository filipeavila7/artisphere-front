import type { UserResponse } from "../user/UserResponse";

export interface CloseFriendsResponse {
  id: number;
  friend: UserResponse;
  createdAt: string;
}
