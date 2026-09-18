import type { ProfileSuggestionResponse } from "./ProfileSuggestionResponse";
import type { PostSuggestionResponse } from "./PostSuggestionResponse";
import type { TagSuggestionResponse } from "./TagSuggestionResponse";

export interface SearchSuggestionsResponse {
    profiles: ProfileSuggestionResponse[];
    posts: PostSuggestionResponse[];
    tags: TagSuggestionResponse[];
}