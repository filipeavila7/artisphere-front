import type { SearchResponse } from "../../types/search/SearchResponse";
import type { SearchSuggestionsResponse } from "../../types/search/SearchSuggestionsResponse";

import api from "../../api/api";

export const search = async (
    query: string,
    page: number = 0,
    size: number = 12
): Promise<SearchResponse> => {
    const response = await api.get<SearchResponse>("/search", {
        params: {
            q: query,
            page,
            size
        }
    });

    return response.data;
};

export const getSearchSuggestions = async (
    query: string
): Promise<SearchSuggestionsResponse> => {
    const response = await api.get<SearchSuggestionsResponse>(
        "/search/suggestions",
        {
            params: {
                q: query
            }
        }
    );

    return response.data;
};