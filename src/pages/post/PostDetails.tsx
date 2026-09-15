import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import Masonry from "react-masonry-css";

import { getPostById } from "../../service/post/PostService";
import { likePost, unlikePost } from "../../service/like/likeService";

import PostCard from "../../components/feed/PostCard";
import PostDate from "../../components/post/PostDate";
import CommentsModal from "../../components/post/CommentModal";

import { HiOutlineDotsVertical } from "react-icons/hi";
import {
  FaRegBookmark,
  FaRegComment,
  FaHeart,
  FaRegHeart
} from "react-icons/fa6";
import { CiShare2 } from "react-icons/ci";

import "../../styles/post.css";
import { useMe } from "../../hooks/useMe";

const breakpointColumns = {
  default: 4,
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


  /*
   * POST
   */
  const {
    data,
    isLoading,
    isError
  } = useQuery({
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

      queryClient.invalidateQueries({
        queryKey: ["post", postId],
      });

      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-posts-liked"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-posts"],
      });

    },

  });


  if (isLoading) {
    return <p>Carregando...</p>;
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

                <span>
                  @{data.post.user.userName}
                </span>

                <PostDate date={data.post.createdAt} />

              </div>

            </div>


            <div className="post-details-actions">

              {isOwner ? (
                <button className="post-user-follow">
                  You
                </button>
              ) : (
                <button className="post-user-follow">
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
                <span key={tag.id}>
                  #{tag.name}
                </span>
              ))}

            </div>


            <div className="post-description-box">
              <p>{data.post.description}</p>
            </div>


            <div className="post-action-box">

              <div
                className="action"
                onClick={handleLike}
              >

                {data.post.likedByMe ? (
                  <FaHeart className="liked" />
                ) : (
                  <FaRegHeart className="unliked" />
                )}

                <p>
                  {data.post.likesCount}
                </p>

              </div>


              <div
                className="action"
                onClick={() => setIsCommentsOpen(true)}
              >

                <FaRegComment />

                <p>
                  {data.post.commentsCount}
                </p>

              </div>


              <div className="action">

                <CiShare2 className="icon-share" />

                0

              </div>


              <div className="action-l">

                <FaRegBookmark />

              </div>

            </div>

          </div>

        </div>

      </div>


      <CommentsModal
        postId={Number(postId)}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
      />


      <section>

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

    </main>
  );
}

export default PostDetails;