import api from "../../api/api";
import type { StoryRequest, StoryResponse, StoryTextRequest } from "../../types/story/StoryType";
import type { PageResponse } from "../../types/page/PageResponse";

export async function getUserStories(
    userName: string,
    page = 0,
    size?: number
): Promise<PageResponse<StoryResponse>> {
    const response = await api.get<PageResponse<StoryResponse>>(
        `/stories/user/${encodeURIComponent(userName)}`,
        { params: { page, ...(size === undefined ? {} : { size }) } }
    );

    return response.data;
}


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


export async function uploadStoryImage(file: File): Promise<string> {
    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post(
        "/files/upload/story",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data.filename;
}



export async function getStoryImage(imageUrl: string): Promise<string> {
    const response = await api.get(imageUrl, {
        responseType: "blob",
    });

    return URL.createObjectURL(response.data);
}
