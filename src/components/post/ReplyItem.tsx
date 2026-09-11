import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteComment, replyComment } from "../../service/comment/CommentService";
import type { CommentResponse } from "../../types/comment/CommentResponse";
import { useMe } from "../../hooks/useMe";
import PostDate from "./PostDate";

interface ReplyItemProps { reply: CommentResponse; postId: number; rootCommentId: number; }

/** A reply never renders another reply list: every reply stays at this same visual level. */
function ReplyItem({ reply, postId, rootCommentId }: ReplyItemProps) {
  const queryClient = useQueryClient(); const { data: currentUser } = useMe();
  const [showReplyInput, setShowReplyInput] = useState(false); const [replyText, setReplyText] = useState("");
  const refreshReplies = () => { queryClient.invalidateQueries({ queryKey: ["comment-replies", rootCommentId] }); queryClient.invalidateQueries({ queryKey: ["post-comments", postId] }); };
  const replyMutation = useMutation({ mutationFn: (content: string) => replyComment(postId, reply.id, { content }), onSuccess: () => { setReplyText(""); setShowReplyInput(false); refreshReplies(); } });
  const deleteMutation = useMutation({ mutationFn: () => deleteComment(reply.id), onSuccess: refreshReplies });
  const submitReply = () => { const content = replyText.trim(); if (content) replyMutation.mutate(content); };
  return <article className="comment comment--reply"><img className="comment-avatar" src={reply.user.profileImageUrl} alt="" /><div className="comment-body">
    <div className="comment-card"><div className="comment-author-row"><strong>{reply.user.name}</strong><span>@{reply.user.userName}</span></div><p className="comment-content">{reply.replyToUsername && <span className="comment-mention">@{reply.replyToUsername}</span>}{reply.content}</p></div>
    <div className="comment-meta"><PostDate date={reply.createdAt} /><button className="comment-action-btn" onClick={() => setShowReplyInput((value) => !value)}>Responder</button>{currentUser?.id === reply.user.id && <button className="comment-action-btn comment-delete-btn" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>{deleteMutation.isPending ? "Excluindo..." : "Excluir"}</button>}</div>
    {showReplyInput && <div className="comment-reply-box"><textarea value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder={`Respondendo @${reply.user.userName}...`} /><button disabled={replyMutation.isPending || !replyText.trim()} onClick={submitReply}>{replyMutation.isPending ? "Enviando..." : "Enviar resposta"}</button></div>}
  </div></article>;
}
export default ReplyItem;
