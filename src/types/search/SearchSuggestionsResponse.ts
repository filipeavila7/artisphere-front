import type { ProfileSuggestionResponse } from "./ProfileSuggestionResponse";
import type { TagSuggestionResponse } from "./TagSuggestionResponse";

export interface SearchSuggestionsResponse {
    profiles: ProfileSuggestionResponse[];
    posts: string[];
    tags: TagSuggestionResponse[];
}