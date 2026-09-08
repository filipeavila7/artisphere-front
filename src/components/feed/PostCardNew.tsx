// PostCard.tsx
import { useState } from "react";
import type { PostResponse } from "../../types/post/PostResponse";

interface PostCardProps {
    post: PostResponse;
}

function PostCardNew({ post }: PostCardProps) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className="post-card">
            <div className={`image-wrapper ${!loaded ? "is-loading" : ""}`}>
                {!loaded && <div className="skeleton" />}

                <img
                    src={post.imageUrl}
                    alt={post.description || post.content}
                    onLoad={() => setLoaded(true)}
                    className={loaded ? "is-loaded" : ""}
                />
            </div>
        </div>
    );
}

export default PostCardNew;