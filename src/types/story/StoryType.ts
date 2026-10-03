import type { UserResponse } from "../user/UserResponse";

export type StoryType = "TEXT" | "IMAGE";

export type StoryVisibility = "EVERYONE" | "CLOSE_FRIENDS";

export interface StoryResponse {
    id: number;
    imageUrl: string;
    createdAt: string;
    OwerUser: UserResponse;
    storyType: StoryType;
    storyVisibility: StoryVisibility;
    totalVisibilities: number;
    isLikedByMe: boolean;
    description?: string | null;
    text?: string | null;
}

export interface StoryRequest {
    imageUrl: string;
    visibility: StoryVisibility;
    description?: string;
}

export interface StoryTextRequest {
    text?: string;
    visibility: StoryVisibility;
}
