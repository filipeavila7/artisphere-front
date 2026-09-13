import api from "../../api/api";


// curtir comentario
export async function likeComment(commentId: number): Promise<void> {
  await api.post(`/like-comment/${commentId}`);
}

// remover a curtida
export async function unlikeComment(commentId: number): Promise<void> {
  await api.delete(`/like-comment/${commentId}`);
}