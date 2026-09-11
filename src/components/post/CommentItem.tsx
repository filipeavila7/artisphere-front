import { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteComment, getReplies, replyComment } from "../../service/comment/CommentService";
import type { CommentResponse } from "../../types/comment/CommentResponse";
import PostDate from "../post/PostDate";
import { useMe } from "../../hooks/useMe";
import ReplyItem from "./ReplyItem";

interface CommentItemProps { comment: CommentResponse; postId: number; }

function CommentItem({ comment, postId }: CommentItemProps) {
  const queryClient = useQueryClient();
  const { data: currentUser } = useMe();
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const isOwner = currentUser?.id === comment.user.id;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ["comment-replies", comment.id], queryFn: ({ pageParam }) => getReplies(comment.id, pageParam, 7), initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1), enabled: showReplies,
  });
  const replies = data?.pages.flatMap((page) => page.content) ?? [];
  const replyMutation = useMutation({ mutationFn: (content: string) => replyComment(postId, comment.id, { content }), onSuccess: () => {
    setReplyText(""); setShowReplyInput(false); setShowReplies(true);
    queryClient.invalidateQueries({ queryKey: ["comment-replies", comment.id] }); queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
  }});
  const deleteMutation = useMutation({ mutationFn: () => deleteComment(comment.id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post-comments", postId] }) });
  const submitReply = () => { const content = replyText.trim(); if (content) replyMutation.mutate(content); };

  return <article className="comment comment--root">
    <img className="comment-avatar" src={comment.user.profileImageUrl} alt="" />
    <div className="comment-body">
      <div className="comment-card"><div className="comment-author-row"><strong>{comment.user.name}</strong><span>@{comment.user.userName}</span></div><p className="comment-content">{comment.content}</p></div>
      <div className="comment-meta"><PostDate date={comment.createdAt} /><button className="comment-action-btn" onClick={() => setShowReplyInput((value) => !value)}>Responder</button>{comment.totalReplys > 0 && <button className="comment-action-btn" onClick={() => setShowReplies((value) => !value)}>{showReplies ? "Ocultar respostas" : `Ver respostas (${comment.totalReplys})`}</button>}{isOwner && <button className="comment-action-btn comment-delete-btn" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>{deleteMutation.isPending ? "Excluindo..." : "Excluir"}</button>}</div>
      {showReplyInput && <div className="comment-reply-box"><textarea value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder={`Respondendo @${comment.user.userName}...`} /><button disabled={replyMutation.isPending || !replyText.trim()} onClick={submitReply}>{replyMutation.isPending ? "Enviando..." : "Enviar resposta"}</button></div>}
      {showReplies && <div className="comment-replies-list">{isLoading && <p className="comments-state comments-state--inline">Carregando respostas...</p>}{isError && <p className="comments-state comments-state--error">Não foi possível carregar as respostas.</p>}{replies.map((reply) => <ReplyItem key={reply.id} reply={reply} postId={postId} rootCommentId={comment.id} />)}{hasNextPage && <button className="comment-load-more" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>{isFetchingNextPage ? "Carregando..." : "Ver mais respostas"}</button>}</div>}
    </div>
  </article>;
}

export default CommentItem;
