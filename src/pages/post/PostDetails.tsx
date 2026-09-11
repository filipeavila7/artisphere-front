import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Masonry from "react-masonry-css";

import { getPostById } from "../../service/post/PostService";

import PostCard from "../../components/feed/PostCard";
import PostDate from "../../components/post/PostDate";
import CommentsModal from "../../components/post/CommentModal";

import { HiOutlineDotsVertical } from "react-icons/hi";
import {
  FaRegBookmark,
  FaRegComment,
  FaRegHeart
} from "react-icons/fa6";
import { CiShare2 } from "react-icons/ci";

import "../../styles/post.css";

const breakpointColumns = {
  default: 4,
  1200: 3,
  900: 3,
  640: 2,
};

function PostDetails() {

  const { postId } = useParams();

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


  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (isError || !data) {
    return <p>Erro ao carregar o post.</p>;
  }


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
              <button className="post-user-follow">Follow</button>
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

            <div className="post-description-box">
              <p>{data.post.description}</p>
            </div>

            <div className="post-action-box">

              <div className="action">
                <FaRegHeart />
                <p>{data.post.likesCount}</p>
              </div>

              <div
                className="action"
                onClick={() => setIsCommentsOpen(true)}
              >
                <FaRegComment />
                <p>{data.post.commentsCount}</p>
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
            <PostCard key={post.id} post={post} />
          ))}
        </Masonry>
      </section>

    </main>
  );
}

export default PostDetails;