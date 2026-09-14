// PostCard.tsx
import { useState } from "react";


interface PostCardProps {
    post: {
        id: number | string;
        imageUrl: string;
        title: string;
        likedByMe: boolean;
        likesCount: number;
        commentsCount: number;
    };
    onClick?: (post: PostCardProps["post"]) => void;
}

function PostCard({ post, onClick }: PostCardProps) {
    const [loaded, setLoaded] = useState(false);

    const handleClick = () => {
        onClick?.(post);
    };

    return (
        <div onClick={handleClick} className="post-card">
            <div className={`image-wrapper ${!loaded ? "is-loading" : ""}`}>
                {!loaded && <div className="skeleton" />}

                <img
                    src={post.imageUrl}
                    alt=""
                    onLoad={() => setLoaded(true)}
                    className={loaded ? "is-loaded" : ""}
                />
            </div>
        </div>
    );
}

export default PostCard;