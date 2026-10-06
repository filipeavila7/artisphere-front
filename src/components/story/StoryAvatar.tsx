
import { useNavigate } from "react-router-dom";
import { formatePfpL } from "../../utils/formateImgProfile";

import "../../styles/story-avatar.css";

interface StoryAvatarProps {
    imageUrl: string | undefined;
    userName: string;
    hasStory: boolean;
    hasUnviewedStory: boolean;
    hasUnviewedCloseFriendsStory: boolean;
    size?: number;
}

function StoryAvatar({
    imageUrl,
    userName,
    hasStory,
    hasUnviewedStory,
    hasUnviewedCloseFriendsStory,
    size,
}: StoryAvatarProps) {
    const navigate = useNavigate();

    const hasViewedStory =
        hasStory && !hasUnviewedStory;

    const handleClick = () => {
        if (!hasStory) return;

        navigate(`/story/${userName}`);
    };

    return (
        <div
            className={`story-avatar ${
                hasUnviewedCloseFriendsStory
                    ? "has-unviewed-close-friends-story"
                    : hasUnviewedStory
                    ? "has-unviewed-story"
                    : hasViewedStory
                    ? "has-viewed-story"
                    : ""
            }`}
            onClick={handleClick}
            style={{
                width: size,
                height: size,
                cursor: hasStory ? "pointer" : "default",
            }}
        >
            <img
                className="story-avatar-image"
                src={formatePfpL(imageUrl)}
                alt=""
            />
        </div>
    );
}

export default StoryAvatar;
