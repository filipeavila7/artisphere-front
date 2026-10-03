
import { useCallback, useEffect, useState } from "react";
import { FiArrowLeft, FiX } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import {
    getStoryImage,
    getUserStories,
} from "../../service/story/StoryService";

import type { PageResponse } from "../../types/page/PageResponse";
import type { StoryResponse } from "../../types/story/StoryType";

import { formatePfpL } from "../../utils/formateImgProfile";

import "../../styles/story-page.css";

const STORY_DURATION = 15_000;

function relativeTime(createdAt: string): string {
    const elapsed = Math.max(
        0,
        Date.now() - new Date(createdAt).getTime()
    );

    if (!Number.isFinite(elapsed)) {
        return "";
    }

    const minutes = Math.floor(elapsed / 60_000);

    if (minutes < 1) {
        return "now";
    }

    if (minutes < 60) {
        return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h`;
    }

    return `${Math.floor(hours / 24)}d`;
}

function StoryPage() {
    const { userName } = useParams<{ userName: string }>();
    const navigate = useNavigate();

    const [page, setPage] =
        useState<PageResponse<StoryResponse> | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [activeIndex, setActiveIndex] = useState(0);

    const [storyImageUrl, setStoryImageUrl] =
        useState<string | null>(null);

    const [imageLoading, setImageLoading] = useState(false);

    useEffect(() => {
        let active = true;

        setLoading(true);
        setError(false);
        setPage(null);
        setActiveIndex(0);

        getUserStories(userName ?? "")
            .then((data) => {
                if (active) {
                    setPage(data);
                }
            })
            .catch(() => {
                if (active) {
                    setError(true);
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [userName]);

    const close = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const changeStory = useCallback(
        (nextIndex: number) => {
            if (!page) {
                return;
            }

            if (nextIndex < 0) {
                return;
            }

            if (nextIndex >= page.content.length) {
                close();
                return;
            }

            setActiveIndex(nextIndex);
        },
        [close, page]
    );

    const story = page?.content[activeIndex];

    /*
     * Loads the private story image through the authenticated API.
     *
     * The API returns a Blob, which is converted into a temporary
     * object URL that can be used by the <img> element.
     */
    useEffect(() => {
        if (!story || story.storyType !== "IMAGE" || !story.imageUrl) {
            setStoryImageUrl(null);
            return;
        }

        let active = true;
        let objectUrl: string | null = null;

        setImageLoading(true);
        setStoryImageUrl(null);

        getStoryImage(story.imageUrl)
            .then((url) => {
                if (!active) {
                    URL.revokeObjectURL(url);
                    return;
                }

                objectUrl = url;
                setStoryImageUrl(url);
            })
            .catch((error) => {
                console.error("Error loading story image:", error);

                if (active) {
                    setStoryImageUrl(null);
                }
            })
            .finally(() => {
                if (active) {
                    setImageLoading(false);
                }
            });

        return () => {
            active = false;

            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [story]);

    /*
     * Automatically moves to the next story after 15 seconds.
     */
    useEffect(() => {
        if (
            loading ||
            error ||
            !page?.content.length ||
            !story
        ) {
            return;
        }

        const timer = window.setTimeout(() => {
            changeStory(activeIndex + 1);
        }, STORY_DURATION);

        return () => {
            window.clearTimeout(timer);
        };
    }, [
        activeIndex,
        changeStory,
        error,
        loading,
        page,
        story,
    ]);

    const totalBars = page?.totalElements ?? 0;

    return (
        <main
            className="story-viewer"
            aria-label="Story viewer"
        >
            <button
                className="story-viewer-close"
                onClick={close}
                aria-label="Close stories"
                type="button"
            >
                <FiX />
            </button>

            {loading ? (
                <div
                    className="story-viewer-message"
                    role="status"
                >
                    Loading stories…
                </div>
            ) : error ? (
                <div className="story-viewer-message">
                    <p>
                        Could not load this user’s stories.
                    </p>

                    <button
                        onClick={close}
                        type="button"
                    >
                        Go back
                    </button>
                </div>
            ) : !page?.content.length || totalBars === 0 ? (
                <div className="story-viewer-message">
                    <p>No stories available.</p>

                    <button
                        onClick={close}
                        type="button"
                    >
                        Go back
                    </button>
                </div>
            ) : story ? (
                <section
                    className="story-card"
                    key={story.id}
                >
                    <div
                        className="story-progress-list"
                        aria-label={`${activeIndex + 1} of ${totalBars} stories`}
                    >
                        {Array.from(
                            { length: totalBars },
                            (_, index) => (
                                <div
                                    className="story-progress-track"
                                    key={index}
                                >
                                    <span
                                        className={`story-progress-fill ${
                                            index < activeIndex
                                                ? "is-complete"
                                                : ""
                                        } ${
                                            index === activeIndex
                                                ? "is-active"
                                                : ""
                                        }`}
                                        style={
                                            index === activeIndex
                                                ? {
                                                      animationDuration: `${STORY_DURATION}ms`,
                                                      animationPlayState:
                                                          "running",
                                                  }
                                                : undefined
                                        }
                                    />
                                </div>
                            )
                        )}
                    </div>

                    <header className="story-viewer-header">
                        <img
                            src={formatePfpL(
                                story.OwerUser?.profileImageUrl
                            )}
                            alt=""
                            className="story-viewer-avatar"
                        />

                        <span className="story-viewer-username">
                            {story.OwerUser?.userName ?? userName}
                        </span>

                        <time
                            className="story-viewer-time"
                            dateTime={story.createdAt}
                        >
                            {relativeTime(story.createdAt)}
                        </time>
                    </header>

                    <div className="story-viewer-content">
                        {story.storyType === "IMAGE" ? (
                            imageLoading ? (
                                <div
                                    className="story-viewer-image-loading"
                                    role="status"
                                >
                                    Loading…
                                </div>
                            ) : storyImageUrl ? (
                                <img
                                    className="story-viewer-image"
                                    src={storyImageUrl}
                                    alt="Story"
                                />
                            ) : (
                                <div className="story-viewer-message">
                                    <p>
                                        Could not load this story.
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="story-viewer-text">
                                {story.description ||
                                    story.text ||
                                    ""}
                            </div>
                        )}
                    </div>

                    <button
                        className="story-hit-area story-hit-area--previous"
                        onClick={() =>
                            changeStory(activeIndex - 1)
                        }
                        aria-label="Previous story"
                        type="button"
                    />

                    <button
                        className="story-hit-area story-hit-area--next"
                        onClick={() =>
                            changeStory(activeIndex + 1)
                        }
                        aria-label="Next story"
                        type="button"
                    />

                    <button
                        className="story-viewer-back"
                        onClick={close}
                        aria-label="Go back"
                        type="button"
                    >
                        <FiArrowLeft />
                    </button>
                </section>
            ) : (
                <div className="story-viewer-message">
                    <p>Story unavailable.</p>

                    <button
                        onClick={close}
                        type="button"
                    >
                        Go back
                    </button>
                </div>
            )}
        </main>
    );
}

export default StoryPage;
