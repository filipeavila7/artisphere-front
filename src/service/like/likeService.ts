import api from "../../api/api";
import type { LikeResponse } from "../../types/like/LikeResponse";
import type { PageResponse } from "../../types/page/PageResponse";

export async function getMyLikedPosts(
    page : number,
    size : number
) : Promise<PageResponse<LikeResponse>> {
    const response = await api.get<PageResponse<LikeResponse>>("/likes/my",
        {
            params: { page, size }, // passa pagina e tamanho da pagina nos parametros
        }
    )

    return response.data
}


export async function likePost(postId: number) {
  const response = await api.post(`/likes/${postId}/new`);
  return response.data;
}

export async function unlikePost(postId: number) {
  await api.delete(`/likes/${postId}/delete`);
}