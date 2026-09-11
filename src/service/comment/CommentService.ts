import api from "../../api/api";
import type { CommentRequest } from "../../types/comment/CommentRequest";
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




export async function getReplies(
  commentId: number,
  page: number,
  size = 7
): Promise<PageResponse<CommentResponse>> {
  const { data } = await api.get(`/comments/reply/${commentId}`, {
    params: { page, size },
  });
  return data;
}


/*
 * CRIAR COMENTÁRIO NO POST
 */
export async function createComment(
  postId: number,
  request: CommentRequest
): Promise<CommentResponse> {
  const { data } = await api.post(`/comments/${postId}/new`, request);
  return data;
}


/*
 * RESPONDER UM COMENTÁRIO
 */
export async function replyComment(
  postId: number,
  commentId: number,
  request: CommentRequest
): Promise<CommentResponse> {
  const { data } = await api.post(
    `/comments/reply/${postId}/${commentId}`,
    request
  );
  return data;
}


/*
 * DELETAR COMENTÁRIO
 */
export async function deleteComment(commentId: number): Promise<void> {
  await api.delete(`/comments/${commentId}/delete`);
}