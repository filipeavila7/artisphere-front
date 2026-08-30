import api from "../../api/api";
import type { FollowingProfileResponse } from "../../types/follow/FollowingProfileResponse";
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