import { useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type QueryKey
} from "@tanstack/react-query";

import {
  getReplies,
  replyComment,
  deleteComment
} from "../../service/comment/CommentService";

import type { CommentResponse } from "../../types/comment/CommentResponse";
import PostDate from "../post/PostDate";
import { useMe } from "../../hooks/useMe";

interface CommentItemProps {
  comment: CommentResponse;
  postId: number;
  parentQueryKey: QueryKey;
}

function CommentItem({
  comment,
  postId,
  parentQueryKey
}: CommentItemProps) {

  const queryClient = useQueryClient();

  const { data: currentUser } = useMe();

  const isOwner = currentUser?.id === comment.user.id;

  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");


  /*
   * RESPOSTAS
   */
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["comment-replies", comment.id],

    queryFn: ({ pageParam }) =>
      getReplies(
        comment.id,
        pageParam,
        7
      ),

    initialPageParam: 0,

    getNextPageParam: (lastPage) =>
      lastPage.last
        ? undefined
        : lastPage.number + 1,

    enabled: showReplies,
  });


  const replies =
    data?.pages.flatMap(
      (page) => page.content
    ) ?? [];


  /*
   * RESPONDER
   */
  const replyMutation = useMutation({
    mutationFn: (content: string) =>
      replyComment(
        postId,
        comment.id,
        { content }
      ),

    onSuccess: () => {

      setReplyText("");
      setShowReplyInput(false);
      setShowReplies(true);

      queryClient.invalidateQueries({
        queryKey: ["comment-replies", comment.id]
      });

      queryClient.invalidateQueries({
        queryKey: parentQueryKey
      });
    },
  });


  function handleReplySubmit() {

    const trimmed = replyText.trim();

    if (!trimmed) {
      return;
    }

    replyMutation.mutate(trimmed);
  }


  /*
   * DELETAR
   */
  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteComment(comment.id),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: parentQueryKey
      });

    },
  });


  return (
    <div className="comment">

      <img
        src={comment.user.profileImageUrl}
        alt=""
      />


      <div className="comment-body">

        <strong>
          {comment.user.name}
        </strong>


        <p>
          {comment.content}
        </p>


        <div className="comment-meta">

          <PostDate
            date={comment.createdAt}
          />


          <button
            className="comment-action-btn"
            onClick={() =>
              setShowReplyInput(
                (prev) => !prev
              )
            }
          >
            Responder
          </button>


          {comment.totalReplys > 0 && (

            <button
              className="comment-action-btn"
              onClick={() =>
                setShowReplies(
                  (prev) => !prev
                )
              }
            >

              {showReplies
                ? "Ocultar respostas"
                : `Ver respostas (${comment.totalReplys})`
              }

            </button>

          )}


          {isOwner && (

            <button
              className="comment-action-btn comment-delete-btn"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deleteMutation.mutate()
              }
            >

              {deleteMutation.isPending
                ? "Excluindo..."
                : "Excluir"
              }

            </button>

          )}

        </div>


        {showReplyInput && (

          <div className="comment-reply-box">

            <textarea
              value={replyText}
              onChange={(e) =>
                setReplyText(e.target.value)
              }
              placeholder={`Respondendo @${comment.user.userName}...`}
            />


            <button
              disabled={
                replyMutation.isPending ||
                !replyText.trim()
              }
              onClick={handleReplySubmit}
            >

              {replyMutation.isPending
                ? "Enviando..."
                : "Enviar"
              }

            </button>

          </div>

        )}


        {showReplies && (

          <div className="comment-replies-list">

            {isLoading && (
              <p>
                Carregando respostas...
              </p>
            )}


            {replies.map((reply) => (

              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                parentQueryKey={[
                  "comment-replies",
                  comment.id
                ]}
              />

            ))}


            {hasNextPage && (

              <button
                className="comment-action-btn"
                disabled={isFetchingNextPage}
                onClick={() =>
                  fetchNextPage()
                }
              >

                {isFetchingNextPage
                  ? "Carregando..."
                  : "Ver mais respostas"
                }

              </button>

            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default CommentItem;