import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPostById } from "../../service/post/PostService";

function PostDetails() {

    const { postId } = useParams();

    console.log(postId)

    const {
        data,
        isLoading,
        isError
    } = useQuery({
        queryKey: ["post", postId],
        queryFn: () => getPostById(Number(postId)),
        enabled: !!postId
    });

    if (isLoading) {
        return <div>Carregando...</div>;
    }

    if (isError || !data) {
        return <div>Não foi possível carregar o post.</div>;
    }

    const post = data.post;
    const relatedPosts = data.relatedPosts;

    return (
        <div>

            {/* Post principal */}
            <h1>{post.title}</h1>

            <img src={post.imageUrl} />

            <p>{post.description}</p>

            {/* Relacionados */}
            <section>
                <h2>Related posts</h2>

                <div>
                    {relatedPosts.map((relatedPost) => (
                        <div key={relatedPost.id}>
                            <img src={relatedPost.imageUrl} />
                            <h3>{relatedPost.title}</h3>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}

export default PostDetails;