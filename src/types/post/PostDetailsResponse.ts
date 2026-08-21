import type { UserResponse } from "../user/UserResponse";

export interface PostDetailsResponse {
    id: number;
    title: string;
    imageUrl: string | null;
    user: UserResponse;
    createdAt: string;
    description: string | null;
    tags: Tag[];
    likesCount: number;
    commentsCount: number;
    likedByMe: boolean;
}

export interface Tag {
    id: number;
    name: string;
}