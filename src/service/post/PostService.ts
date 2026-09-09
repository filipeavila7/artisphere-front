import api from "../../api/api";
import type { PostDetailsResponse } from "../../types/post/PostDetailsResponse";
import type { PageResponse } from "../../types/page/PageResponse";
import type { PostWithRelatedResponse } from "../../types/post/PostWithRelatedResponse";

// buscar feed
export async function getFeed( // getFeed(numero da pagina, tamanho da pagina)
    page: number,
    size: number
): Promise<PageResponse<PostDetailsResponse>> { // retorna isso na promise

    const response = await api.get<PageResponse<PostDetailsResponse>>(
        "/posts",
        {
            params: { page, size }, // passa pagina e tamanho da pagina nos parametros
        }
    );

    return response.data;
}


// buscar posts do usario logado
export async function getMyPosts(
    page : number,
    size : number
) :Promise<PageResponse<PostDetailsResponse>> { // retorna isso na promise

    const response = await api.get<PageResponse<PostDetailsResponse>>(
        "/posts/user/me",
        {
            params: { page, size }, // passa pagina e tamanho da pagina nos parametros
        }
    );

    return response.data;
}


export async function getPostById(
    postId: number
): Promise<PostWithRelatedResponse> {
    const response = await api.get<PostWithRelatedResponse>(`/posts/${postId}`);
    return response.data;
}