import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Masonry from "react-masonry-css";

import { getPostById } from "../../service/post/PostService";
import PostCard from "../../components/feed/PostCard";

import "../../styles/post.css"

const breakpointColumns = {
  default: 4,
  1200: 3,
  900: 3,
  640: 2,
};

function PostDetails() {

  const { postId } = useParams();

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

      {/* POST PRINCIPAL */}
      <div className="post-details-box">
        <div className="post-details-content">
          

          <img className="post-details-img"
            src={data.post.imageUrl}
            alt={data.post.title}
          />

        </div>


        <div className="post-details-data-box">
          oi
        </div>

      </div>

      {/* POSTS RELACIONADOS */}
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