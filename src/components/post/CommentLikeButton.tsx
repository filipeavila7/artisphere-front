import { useMutation, useQueryClient, type InfiniteData, type QueryKey } from "@tanstack/react-query";
import { FaHeart, FaRegHeart } from "react-icons/fa6";

import { likeComment, unlikeComment } from "../../service/likeComment/LikeCommentService";
import type { CommentResponse } from "../../types/comment/CommentResponse";
import type { PageResponse } from "../../types/page/PageResponse";

interface CommentLikeButtonProps { comment: CommentResponse; queryKey: QueryKey; }

function CommentLikeButton({ comment, queryKey }: CommentLikeButtonProps) {
  const queryClient = useQueryClient();

  const updateCommentInCache = (likedByMe: boolean) => {
    queryClient.setQueryData<InfiniteData<PageResponse<CommentResponse>>>(queryKey, (current) => {
      if (!current) return current;
      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          content: page.content.map((item) => item.id === comment.id ? {
            ...item,
            likedByMe,
            totalLikes: Math.max(0, item.totalLikes + (likedByMe ? 1 : -1)),
          } : item),
        })),
      };
    });
  };

  const likeMutation = useMutation({
    mutationFn: () => comment.likedByMe ? unlikeComment(comment.id) : likeComment(comment.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousComments = queryClient.getQueryData<InfiniteData<PageResponse<CommentResponse>>>(queryKey);
      updateCommentInCache(!comment.likedByMe);
      return { previousComments };
    },
    onError: (_error, _variables, context) => queryClient.setQueryData(queryKey, context?.previousComments),
  });

  return <button type="button" className={`comment-like-btn${comment.likedByMe ? " comment-like-btn--active" : ""}`} aria-label={comment.likedByMe ? "Remover curtida do comentário" : "Curtir comentário"} aria-pressed={comment.likedByMe} disabled={likeMutation.isPending} onClick={() => likeMutation.mutate()}>
    {comment.likedByMe ? <FaHeart aria-hidden="true" /> : <FaRegHeart aria-hidden="true" />}<span>{comment.totalLikes}</span>
  </button>;
}

export default CommentLikeButton;
