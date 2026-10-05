import type { UserResponse } from "../user/UserResponse";

export interface StoryVisibilityResponse {
    id: number;
    user: UserResponse;
    seenAt: string;
}