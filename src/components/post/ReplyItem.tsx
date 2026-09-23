import { useState } from "react";
import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { deleteComment, replyComment } from "../../service/comment/CommentService";
import type { CommentResponse } from "../../types/comment/CommentResponse";
import type { PageResponse } from "../../types/page/PageResponse";
import { useMe } from "../../hooks/useMe";
import PostDate from "./PostDate";
import CommentLikeButton from "./CommentLikeButton";

interface ReplyItemProps { reply: CommentResponse; postId: number; rootCommentId: number; }

/** A reply never renders another reply list: every reply stays at this same visual level. */
function ReplyItem({ reply, postId, rootCommentId }: ReplyItemProps) {
  const queryClient = useQueryClient(); const { data: currentUser } = useMe();
  const [showReplyInput, setShowReplyInput] = useState(false); const [replyText, setReplyText] = useState("");
  const replyQueryKey = ["comment-replies", rootCommentId];

  const addReplyToFlatList = (newReply: CommentResponse) => {
    queryClient.setQueryData<InfiniteData<PageResponse<CommentResponse>>>(
      replyQueryKey,
      (current) => {
        if (
          !current ||
          current.pages.some((page) =>
            page.content.some((item) => item.id === newReply.id)
          )
        ) {
          return current;
        }

        return {
          ...current,
          pages: current.pages.map((page, index) => ({
            ...page,
            totalElements: page.totalElements + 1,

            ...(index === 0
              ? {
                content: [...page.content, newReply],
                numberOfElements: page.numberOfElements + 1,
              }
              : {}),
          })),
        };
      }
    );
  };

  const removeReplyFromFlatList = () => {
    queryClient.setQueryData<InfiniteData<PageResponse<CommentResponse>>>(replyQueryKey, (current) => current && ({
      ...current,
      pages: current.pages.map((page) => ({
        ...page,
        content: page.content.filter((item) => item.id !== reply.id),
        totalElements: Math.max(0, page.totalElements - 1),
        numberOfElements: Math.max(0, page.numberOfElements - (page.content.some((item) => item.id === reply.id) ? 1 : 0)),
      })),
    }));
  };

  const replyMutation = useMutation({
    mutationFn: (content: string) => replyComment(postId, reply.id, { content }),
    onSuccess: (newReply) => {
      // The endpoint returns direct children only. Keep nested replies in this flat UI list.
      addReplyToFlatList(newReply);
      setReplyText("");
      setShowReplyInput(false);
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(reply.id),
    onSuccess: () => { removeReplyFromFlatList(); queryClient.invalidateQueries({ queryKey: ["post-comments", postId] }); },
  });
  const submitReply = () => { const content = replyText.trim(); if (content) replyMutation.mutate(content); };
  return <article className="comment comment--reply"><img className="comment-avatar" src={reply.user.profileImageUrl} alt="" /><div className="comment-body">
    <div className="comment-card"><div className="comment-author-row"><strong>{reply.user.name}</strong><span>@{reply.user.userName}</span></div><p className="comment-content">{reply.replyToUsername && <span className="comment-mention">@{reply.replyToUsername}</span>}{reply.content}</p></div>
    <div className="comment-meta"><PostDate date={reply.createdAt} /><CommentLikeButton comment={reply} queryKey={replyQueryKey} /><button className="comment-action-btn" onClick={() => setShowReplyInput((value) => !value)}>Reply</button>{currentUser?.id === reply.user.id && <button className="comment-action-btn comment-delete-btn" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>{deleteMutation.isPending ? "Deleting..." : "Delete"}</button>}</div>
    {showReplyInput && <div className="comment-reply-box"><textarea value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder={`Respondendo @${reply.user.userName}...`} /><button disabled={replyMutation.isPending || !replyText.trim()} onClick={submitReply}>{replyMutation.isPending ? "Enviando..." : "Enviar resposta"}</button></div>}
  </div></article>;
}
export default ReplyItem;
