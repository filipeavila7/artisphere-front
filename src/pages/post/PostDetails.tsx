import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import Masonry from "react-masonry-css";

import { getPostById } from "../../service/post/PostService";
import { likePost, unlikePost } from "../../service/like/likeService";
import { createSave, deleteSave } from "../../service/save/SaveService";

import PostCard from "../../components/feed/PostCard";
import PostDate from "../../components/post/PostDate";
import CommentsModal from "../../components/post/CommentModal";

import { HiOutlineDotsVertical } from "react-icons/hi";
import {
  FaRegBookmark,
  FaBookmark,
  FaRegComment,
  FaHeart,
  FaRegHeart,
  FaCheck,
} from "react-icons/fa6";
import { CiShare2 } from "react-icons/ci";

import "../../styles/post.css";
import { useMe } from "../../hooks/useMe";
import Loading from "../../components/layout/Loading";

const breakpointColumns = {
  default: 6,
  1200: 3,
  900: 3,
  640: 2,
};

function PostDetails() {
  const { data: me } = useMe();

  const navigate = useNavigate();
  const { postId } = useParams();

  const queryClient = useQueryClient();

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  /*
   * POST
   */
  const { data, isLoading, isError } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById(Number(postId)),
    enabled: !!postId,
  });

  /*
   * LIKE / UNLIKE
   */
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (data?.post.likedByMe) {
        await unlikePost(Number(postId));
      } else {
        await likePost(Number(postId));
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["my-posts-liked"] });
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    },
  });

  /*
   * SAVE / UNSAVE
   */
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (data?.post.saveByMe) {
        await deleteSave(Number(postId));
      } else {
        await createSave(Number(postId));
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["my-posts-saved"] });
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !data) {
    return <p>Erro ao carregar o post.</p>;
  }

  const isOwner = me?.id === data.post.user.id;

  const handleLike = () => {
    if (likeMutation.isPending) {
      return;
    }

    likeMutation.mutate();
  };

  const handleSave = () => {
    if (saveMutation.isPending) {
      return;
    }

    saveMutation.mutate();
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/post/${postId}`
      );

      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar link do post:", error);
    }
  };

  return (
    <main className="feed-lay">
      <div className="post-details-box">
        <div className="post-details-content">
          <img
            className="post-details-img"
            src={data.post.imageUrl}
            alt={data.post.title}
          />
        </div>

        <div className="post-details-data-box">
          <div className="post-data-lay">
            <div className="post-user-data-box">
              <img
                className="user-post-pfp"
                src={data.post.user.profileImageUrl}
                alt=""
              />

              <div className="post-user-data">
                <p>{data.post.user.name}</p>

                <span>@{data.post.user.userName}</span>

                <PostDate date={data.post.createdAt} />
              </div>
            </div>

            <div className="post-details-actions">
              {isOwner ? (
                <button type="button" className="post-user-follow you">
                  You
                </button>
              ) : (
                <button type="button" className="post-user-follow">
                  Follow
                </button>
              )}

              <HiOutlineDotsVertical className="action-icon" />
            </div>
          </div>

          <div className="post-data-content">
            <div className="post-title">
              <h3>{data.post.title}</h3>
            </div>

            <div className="post-tags">
              {data.post.tags.map((tag) => (
                <span key={tag.id}>#{tag.name}</span>
              ))}
            </div>

            <div className="post-description-box-a">
              <p>{data.post.description}</p>
            </div>

            <div className="post-action-box">
              {/* LIKE */}
              <button
                type="button"
                className={`action ${data.post.likedByMe ? "action-liked" : ""}`}
                onClick={handleLike}
                aria-pressed={data.post.likedByMe}
                aria-label="Like"
              >
                {data.post.likedByMe ? (
                  <FaHeart className="liked" />
                ) : (
                  <FaRegHeart className="unliked" />
                )}

                <p>{data.post.likesCount}</p>
              </button>

              {/* COMMENTS */}
              <button
                type="button"
                className="action"
                onClick={() => setIsCommentsOpen(true)}
                aria-label="Open comments"
              >
                <FaRegComment />

                <p>{data.post.commentsCount}</p>
              </button>

              {/* SHARE */}
              <button
                type="button"
                className={`action ${copied ? "copied" : ""}`}
                onClick={handleShare}
                aria-label="Copy post link"
              >
                {copied ? <FaCheck /> : <CiShare2 className="icon-share" />}

                <p>{copied ? "Copied" : "Share"}</p>
              </button>

              {/* SAVE */}
              <button
                type="button"
                className={`action-l ${data.post.saveByMe ? "action-saved" : ""}`}
                onClick={handleSave}
                aria-pressed={data.post.saveByMe}
                aria-label="Save"
              >
                {data.post.saveByMe ? <FaBookmark /> : <FaRegBookmark />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CommentsModal
        postId={Number(postId)}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
      />

      {data.relatedPosts.length > 0 && (
        <section>
          <h2 className="related-title">More like this</h2>

          <Masonry
            breakpointCols={breakpointColumns}
            className="masonry-grid"
            columnClassName="masonry-grid_column"
          >
            {data.relatedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={(post) => navigate(`/post/${post.id}`)}
              />
            ))}
          </Masonry>
        </section>
      )}
    </main>
  );
}

export default PostDetails;