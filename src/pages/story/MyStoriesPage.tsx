import { useEffect, useState } from "react";
import { FiArrowLeft, FiX } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getMyStories, getStoryImage } from "../../service/story/StoryService";
import type { MyStorySummaryResponse } from "../../types/story/StoryType";
import "../../styles/story-page.css";

function MyStoryThumbnail({ story }: { story: MyStorySummaryResponse }) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (story.storyType !== "IMAGE" || !story.imageUrl) return;
        let active = true;
        let objectUrl: string | null = null;

        getStoryImage(story.imageUrl).then((url) => {
            if (!active) {
                URL.revokeObjectURL(url);
                return;
            }
            objectUrl = url;
            setImageUrl(url);
        }).catch(() => {
            if (active) setImageUrl(null);
        });

        return () => {
            active = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [story.imageUrl, story.storyType]);

    return story.storyType === "IMAGE"
        ? imageUrl
            ? <img src={imageUrl} alt="" className="my-story-thumbnail-image" />
            : <span className="my-story-thumbnail-placeholder">Loading…</span>
        : <span className="my-story-thumbnail-text">{story.description || "Text story"}</span>;
}

function MyStoriesPage() {
    const navigate = useNavigate();
    const { data: stories = [], isLoading, isError } = useQuery({
        queryKey: ["myStories"],
        queryFn: getMyStories,
    });

    return (
        <main className="my-stories-page">
            <header className="my-stories-header">
                <button type="button" onClick={() => navigate(-1)} aria-label="Go back"><FiArrowLeft /></button>
                <div><h1>My stories</h1><p>Your active stories</p></div>
                <button type="button" onClick={() => navigate(-1)} aria-label="Close"><FiX /></button>
            </header>

            {isLoading ? <div className="my-stories-state" role="status">Loading your stories…</div>
                : isError ? <div className="my-stories-state">Could not load your stories. Please try again.</div>
                    : stories.length === 0 ? <div className="my-stories-state">No active stories.</div>
                        : <section className="my-stories-grid" aria-label="Your active stories">
                            {stories.map((story) => <button
                                type="button"
                                className="my-stories-item"
                                key={story.id}
                                onClick={() => navigate(`/story/me/${story.id}`)}
                            >
                                <MyStoryThumbnail story={story} />
                                <span className="my-stories-item-meta">
                                    <strong>{story.storyType === "TEXT" ? "Text story" : "Image story"}</strong>
                                    <small>{new Date(story.createdAt).toLocaleString()}</small>
                                </span>
                            </button>)}
                        </section>}
        </main>
    );
}

export default MyStoriesPage;
