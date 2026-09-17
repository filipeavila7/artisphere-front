import type { UserResponse } from "../user/UserResponse";

export interface FollowResponse {
    followed: UserResponse;
    createAt: string;
}