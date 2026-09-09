import type { PostDetailsResponse } from "./PostDetailsResponse";

export interface PostWithRelatedResponse {
    post: PostDetailsResponse;
    relatedPosts: PostDetailsResponse[];
}