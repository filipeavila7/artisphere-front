import type { UserResponse } from "../user/UserResponse";

export type StoryType = "TEXT" | "IMAGE";

export type StoryVisibility = "EVERYONE" | "CLOSE_FRIENDS";

export interface StoryResponse {
    id: number;
    imageUrl: string;
    createdAt: string;
    ownerUser: UserResponse;
    /** Legacy property still read by StoryPage. */
    OwerUser?: UserResponse;
    storyType: StoryType;
    storyVisibility: StoryVisibility;
    totalVisibilities: number;
    isLikedByMe: boolean;
    description?: string | null;
    text?: string | null;
    viewed: boolean;
}

export interface MyStorySummaryResponse {
    id: number;
    imageUrl: string;
    createdAt: string;
    storyType: StoryType;
    description: string;
    ownerUser: UserResponse;
    totalVisibilities: number;
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
