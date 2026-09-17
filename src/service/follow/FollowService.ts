import api from "../../api/api";
import type { FollowingProfileResponse } from "../../types/follow/FollowingProfileResponse";
import type { FollowResponse } from "../../types/follow/FollowResponse";
import type { PageResponse } from "../../types/page/PageResponse";


export async function getMyFollowing(
    page : number,
    size : number
): Promise<PageResponse<FollowingProfileResponse>> {

    const response = await api.get<PageResponse<FollowingProfileResponse>>(
        "/follow/me/following",
        {
            params: {page, size}
        }
    )
    return response.data
    
}


export async function followUser(userId: number): Promise<FollowResponse> {
    const response = await api.post<FollowResponse>(`/follow/${userId}`);

    return response.data;
}

export async function unfollowUser(userId: number): Promise<void> {
    await api.delete(`/follow/unfollow/${userId}`);
}