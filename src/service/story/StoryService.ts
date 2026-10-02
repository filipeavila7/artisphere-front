import api from "../../api/api";
import type { StoryRequest, StoryResponse, StoryTextRequest } from "../../types/story/StoryType";


export async function createStory(
    request: StoryRequest
): Promise<StoryResponse> {
    const response = await api.post<StoryResponse>("/stories", request);

    return response.data;
}

export async function createTextStory(
    request: StoryTextRequest
): Promise<StoryResponse> {
    const response = await api.post<StoryResponse>("/stories/text", request);

    return response.data;
}


export async function uploadStoryImage(
    file: File
): Promise<string> {
    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post<{ filename: string }>(
        "/files/upload/story",
        formData
    );

    return response.data.filename;
}