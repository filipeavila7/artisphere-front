import api from "../../api/api";
import type { PageResponse } from "../../types/page/PageResponse";
import type { StoryVisibilityResponse } from "../../types/story-visibility/StoryVisibilityResponse";

export const createStoryVisibility = async (
    storyId: number
): Promise<void> => {
    await api.post(`/stories/${storyId}/view`);
};

export const getStoryVisibilities = async (
    storyId: number,
    page = 0,
    size = 20
): Promise<PageResponse<StoryVisibilityResponse>> => {
    const response = await api.get<PageResponse<StoryVisibilityResponse>>(
        `/stories/${storyId}/views`,
        {
            params: {
                page,
                size,
            },
        }
    );

    return response.data;
};