import api from "../../api/api";
import type { CommentResponse } from "../../types/comment/CommentResponse";
import type { PageResponse } from "../../types/page/PageResponse";

export async function getComments(
    postId : number,
    page : number,
    size : number
) : Promise<PageResponse<CommentResponse>> {
    const response = await api.get<PageResponse<CommentResponse>>(`/comments/${postId}`,
        {
            params: {page, size}
        }
    )

    return response.data
    
}