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
}

function PostCard({ post }: PostCardProps) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className="post-card">
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