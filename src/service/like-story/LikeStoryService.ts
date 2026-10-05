import api from "../../api/api";

export const likeStory = async (
    storyId: number
): Promise<void> => {
    await api.post(`/stories/${storyId}/like`);
};

export const unlikeStory = async (
    storyId: number
): Promise<void> => {
    await api.delete(`/stories/${storyId}/like`);
};