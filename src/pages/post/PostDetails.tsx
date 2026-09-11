import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Masonry from "react-masonry-css";

import { getPostById } from "../../service/post/PostService";
import { getComments } from "../../service/comment/CommentService";

import PostCard from "../../components/feed/PostCard";
import PostDate from "../../components/post/PostDate";

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
   * COMENTÁRIOS
   */
  const {
    data: commentsData,
    isLoading: commentsLoading,
    isError: commentsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["post-comments", postId],

    queryFn: ({ pageParam }) =>
      getComments(
        Number(postId),
        pageParam,
        10
      ),

    initialPageParam: 0,

    getNextPageParam: (lastPage) =>
      lastPage.last
        ? undefined
        : lastPage.number + 1,

    enabled: !!postId,
  });


  /*
   * CONTAINER DOS COMENTÁRIOS
   */
  const commentsContainerRef = useRef<HTMLDivElement | null>(null);

  /*
   * SENTINEL
   */
  const sentinelRef = useRef<HTMLDivElement | null>(null);


  /*
   * OBSERVER DO SENTINEL
   */
  useEffect(() => {

    const sentinel = sentinelRef.current;
    const container = commentsContainerRef.current;

    if (!sentinel || !container) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {

        const entry = entries[0];

        if (
          entry.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          fetchNextPage();
        }

      },
      {
        root: container,

        /*
         * Começa a buscar um pouco antes
         * de chegar no final.
         */
        rootMargin: "0px 0px 150px 0px",

        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };

  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  ]);


  /*
   * LOADING DO POST
   */
  if (isLoading) {
    return <p>Carregando...</p>;
  }


  /*
   * ERRO DO POST
   */
  if (isError || !data) {
    return <p>Erro ao carregar o post.</p>;
  }


  /*
   * JUNTA OS COMENTÁRIOS DE TODAS AS PÁGINAS
   */
  const comments =
    commentsData?.pages.flatMap(
      (page) => page.content
    ) ?? [];


  return (
    <main className="feed-lay">

      {/* =========================
          POST PRINCIPAL
      ========================= */}

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

                <p>
                  {data.post.user.name}
                </p>

                <span>
                  @{data.post.user.userName}
                </span>

                <PostDate
                  date={data.post.createdAt}
                />

              </div>

            </div>


            <div className="post-details-actions">

              <button className="post-user-follow">
                Follow
              </button>

              <HiOutlineDotsVertical
                className="action-icon"
              />

            </div>

          </div>


          <div className="post-data-content">

            <div className="post-title">

              <h3>
                {data.post.title}
              </h3>

            </div>


            <div className="post-tags">

              {data.post.tags.map((tag) => (

                <span key={tag.id}>
                  #{tag.name}
                </span>

              ))}

            </div>


            <div className="post-description-box">

              <p>
                {data.post.description}
              </p>

            </div>


            <div className="post-action-box">

              <div className="action">

                <FaRegHeart />

                <p>
                  {data.post.likesCount}
                </p>

              </div>


              <div className="action">

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

          <section className="comments-section">

            <div
              ref={commentsContainerRef}
              className="comments-container"
            >

              {commentsLoading && (
                <p>
                  Loading comments...
                </p>
              )}


              {commentsError && (
                <p>
                  Failed to load comments.
                </p>
              )}


              {!commentsLoading &&
                !commentsError &&
                comments.length === 0 && (

                  <p>
                    No comments yet.
                  </p>

                )}


              {comments.map((comment) => (

                <div
                  key={comment.id}
                  className="comment"
                >

                  <img
                    src={comment.user.profileImageUrl}
                    alt=""
                  />

                  <div>

                    <strong>
                      {comment.user.name}
                    </strong>

                    <p>
                      {comment.content}
                    </p>

                    <PostDate
                      date={comment.createdAt}
                    />

                  </div>

                </div>

              ))}


              {/* =========================
              SENTINEL
          ========================= */}

              <div
                ref={sentinelRef}
                className="comments-sentinel"
              />


              {isFetchingNextPage && (
                <p>
                  Loading more comments...
                </p>
              )}

            </div>

          </section>

        </div>



      </div>


      {/* =========================
          COMENTÁRIOS
      ========================= */}




      {/* =========================
          POSTS RELACIONADOS
      ========================= */}

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
            />

          ))}

        </Masonry>

      </section>

    </main>
  );
}

export default PostDetails;