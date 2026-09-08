// PostCard.tsx
import { useState } from "react";
import type { PostResponse } from "../../types/post/PostResponse";
import { useNavigate } from "react-router-dom";

interface PostCardProps {
    post: PostResponse;
}

function PostCardNew({ post }: PostCardProps) {
    const [loaded, setLoaded] = useState(false);

    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/post/${post.id}`);
    };


    return (
        <div onClick={handleClick} className="post-card">
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