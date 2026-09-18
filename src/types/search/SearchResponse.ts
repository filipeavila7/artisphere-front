import type { ProfileResponse } from "../profile/ProfileResponse";
import type { PostDetailsResponse } from "../post/PostDetailsResponse";
import type { PageResponse } from "../page/PageResponse";

export interface SearchResponse {
    profiles: PageResponse<ProfileResponse>;
    posts: PageResponse<PostDetailsResponse>;
}