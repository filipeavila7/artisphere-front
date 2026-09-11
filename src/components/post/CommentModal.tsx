import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IoClose } from "react-icons/io5";

import { getComments, createComment } from "../../service/comment/CommentService";
import CommentItem from "./CommentItem";

interface CommentsModalProps {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
}

function CommentsModal({ postId, isOpen, onClose }: CommentsModalProps) {

  const queryClient = useQueryClient();

  const [newComment, setNewComment] = useState("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);


  /*
   * COMENTÁRIOS DO POST
   */
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["post-comments", postId],
    queryFn: ({ pageParam }) => getComments(postId, pageParam, 10),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    enabled: isOpen && !!postId,
  });

  const comments = data?.pages.flatMap((page) => page.content) ?? [];


  /*
   * SCROLL INFINITO
   */
  useEffect(() => {

    const sentinel = sentinelRef.current;
    const container = containerRef.current;

    if (!sentinel || !container || !isOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: container, rootMargin: "0px 0px 150px 0px", threshold: 0 }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();

  }, [isOpen, fetchNextPage, hasNextPage, isFetchingNextPage]);


  /*
   * NOVO COMENTÁRIO
   */
  const createMutation = useMutation({
    mutationFn: (content: string) => createComment(postId, { content }),
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
    },
  });

  function handleSubmit() {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    createMutation.mutate(trimmed);
  }


  if (!isOpen) return null;

  return (
    <div className="comments-modal-overlay" onClick={onClose}>

      <div
        className="comments-modal"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="comments-modal-header">
          <h3>Comentários</h3>
          <IoClose className="comments-modal-close" onClick={onClose} />
        </div>

        <div className="new-comment-box">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva um comentário..."
          />
          <button
            disabled={createMutation.isPending || !newComment.trim()}
            onClick={handleSubmit}
          >
            {createMutation.isPending ? "Enviando..." : "Comentar"}
          </button>
        </div>

        <div ref={containerRef} className="comments-container">

          {isLoading && <p>Carregando comentários...</p>}
          {isError && <p>Erro ao carregar comentários.</p>}
          {!isLoading && !isError && comments.length === 0 && (
            <p>Nenhum comentário ainda.</p>
          )}

          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              parentQueryKey={["post-comments", postId]}
            />
          ))}

          <div ref={sentinelRef} className="comments-sentinel" />

          {isFetchingNextPage && <p>Carregando mais comentários...</p>}

        </div>

      </div>

    </div>
  );
}

export default CommentsModal;