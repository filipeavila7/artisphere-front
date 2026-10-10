import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    FiArrowLeft,
    FiEye,
    FiHeart,
    FiX,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import {
    getStoryImage,
    getUserStories,
} from "../../service/story/StoryService";


import { useMe } from "../../hooks/useMe";

import type { PageResponse } from "../../types/page/PageResponse";
import type { StoryResponse } from "../../types/story/StoryType";


import { formatePfpL } from "../../utils/formateImgProfile";

import "../../styles/story-page.css";
import type { StoryVisibilityResponse } from "../../types/story-visibility/StoryVisibilityResponse";
import { createStoryVisibility, getStoryVisibilities } from "../../service/story-visibility/StoryVisibilityService";
import { likeStory, unlikeStory } from "../../service/like-story/LikeStoryService";
import { FaStar } from "react-icons/fa6";

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

    const { data: me } = useMe();

    const queryClient = useQueryClient();

    /*
     * Central place to invalidate every cache that depends on
     * "story viewed" state (e.g. the ring color around the avatar).
     * Add new query keys here as the story indicator shows up
     * in other pages.
     */
    const invalidateStoryCaches = useCallback(
        (ownerUserName?: string) => {
            if (ownerUserName) {
                // Profile page (useOtherProfile)
                queryClient.invalidateQueries({
                    queryKey: ["profile", ownerUserName],

                });
            }

            // TODO: other places that show the story ring, e.g.:
            queryClient.invalidateQueries({ queryKey: ["myFollowings"] });
            // queryClient.invalidateQueries({ queryKey: ["stories"] });
            // queryClient.invalidateQueries({ queryKey: ["search"] });
        },
        [queryClient]
    );

    const [page, setPage] =
        useState<PageResponse<StoryResponse> | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [activeIndex, setActiveIndex] = useState(0);

    const [storyImageUrl, setStoryImageUrl] =
        useState<string | null>(null);

    const [imageLoading, setImageLoading] = useState(false);

    const [viewers, setViewers] = useState<
        StoryVisibilityResponse[]
    >([]);

    const [viewersLoading, setViewersLoading] =
        useState(false);

    const [showViewers, setShowViewers] = useState(false);

    useEffect(() => {
        let active = true;

        setLoading(true);
        setError(false);
        setPage(null);
        setActiveIndex(0);
        setShowViewers(false);
        setViewers([]);

        getUserStories(userName ?? "")
            .then((data) => {
                if (!active) {
                    return;
                }

                setPage(data);

                const firstUnviewedIndex =
                    data.content.findIndex(
                        (story) => !story.viewed
                    );

                setActiveIndex(
                    firstUnviewedIndex === -1
                        ? 0
                        : firstUnviewedIndex
                );
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

            setShowViewers(false);
            setViewers([]);
            setActiveIndex(nextIndex);
        },
        [close, page]
    );

    const story = page?.content[activeIndex];

    const isOwnStory =
        !!story &&
        !!me &&
        story.OwerUser?.id === me.id;

    /*
     * Registers the story view when the current story
     * belongs to another user and has not been viewed yet.
     */
    useEffect(() => {
        if (!story || !me) {
            return;
        }

        if (isOwnStory || story.viewed) {
            return;
        }

        createStoryVisibility(story.id)
            .then(() => {
                setPage((currentPage) => {
                    if (!currentPage) {
                        return currentPage;
                    }

                    return {
                        ...currentPage,
                        content: currentPage.content.map(
                            (currentStory) =>
                                currentStory.id === story.id
                                    ? {
                                        ...currentStory,
                                        viewed: true,
                                    }
                                    : currentStory
                        ),
                    };
                });

                invalidateStoryCaches(
                    story.OwerUser?.userName ?? userName
                );
            })
            .catch((error) => {
                console.error(
                    "Error creating story visibility:",
                    error
                );
            });
    }, [story, me, isOwnStory, invalidateStoryCaches, userName]);

    /*
     * Loads the private story image through the authenticated API.
     */
    useEffect(() => {
        if (
            !story ||
            story.storyType !== "IMAGE" ||
            !story.imageUrl
        ) {
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
                console.error(
                    "Error loading story image:",
                    error
                );

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
            !story ||
            showViewers
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
        showViewers,
        story,
    ]);

    const handleLike = async () => {
        if (!story) {
            return;
        }

        const wasLiked = story.isLikedByMe;

        try {
            if (wasLiked) {
                await unlikeStory(story.id);
            } else {
                await likeStory(story.id);
            }

            setPage((currentPage) => {
                if (!currentPage) {
                    return currentPage;
                }

                return {
                    ...currentPage,
                    content: currentPage.content.map(
                        (currentStory) =>
                            currentStory.id === story.id
                                ? {
                                    ...currentStory,
                                    isLikedByMe: !wasLiked,
                                }
                                : currentStory
                    ),
                };
            });
        } catch (error) {
            console.error(
                "Error updating story like:",
                error
            );
        }
    };

    const handleShowViewers = async () => {
        if (!story || !isOwnStory) {
            return;
        }

        if (showViewers) {
            setShowViewers(false);
            return;
        }

        setShowViewers(true);
        setViewersLoading(true);

        try {
            const response = await getStoryVisibilities(
                story.id,
                0,
                50
            );

            setViewers(response.content);
        } catch (error) {
            console.error(
                "Error loading story viewers:",
                error
            );
        } finally {
            setViewersLoading(false);
        }
    };

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
                                        className={`story-progress-fill ${index < activeIndex
                                            ? "is-complete"
                                            : ""
                                            } ${index === activeIndex
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
                            {isOwnStory
                                ? "you"
                                : story.OwerUser?.userName ?? userName}
                        </span>

                        <time
                            className="story-viewer-time"
                            dateTime={story.createdAt}
                        >
                            {relativeTime(story.createdAt)}
                        </time>

                        {story.storyVisibility ===
                            "CLOSE_FRIENDS" && (
                                <span
                                    className="story-close-friends"
                                    title="Close friends story"
                                >
                                    <FaStar />
                                </span>
                            )}
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
                                <div className="story-image-wrapper">
                                    <img
                                        className="story-viewer-image"
                                        src={storyImageUrl}
                                        alt="Story"
                                    />
                                </div>
                            ) : (
                                <div className="story-viewer-message">
                                    <p>
                                        Could not load this story.
                                    </p>
                                </div>
                            )
                        ) : (
                            <div
                                className="story-viewer-text"
                                style={{
                                    backgroundColor: story.backgroundColor ?? "#320C35",
                                }}
                            >
                                {story.description || ""}
                            </div>
                        )}
                    </div>

                    {story.storyType === "IMAGE" &&
                        story.description && (
                            <p className="story-viewer-description">
                                {story.description}
                            </p>
                        )}

                    <div className="story-viewer-actions">
                        {isOwnStory && (
                            <button
                                className="story-viewer-views"
                                onClick={handleShowViewers}
                                type="button"
                                aria-label="Show viewers"
                            >
                                <FiEye />

                                <span>
                                    {story.totalVisibilities}
                                </span>
                            </button>
                        )}

                        {!isOwnStory && (
                            <button
                                className={`story-viewer-like ${story.isLikedByMe
                                    ? "is-liked"
                                    : ""
                                    }`}
                                onClick={handleLike}
                                type="button"
                                aria-label={
                                    story.isLikedByMe
                                        ? "Unlike story"
                                        : "Like story"
                                }
                            >
                                <FiHeart />
                            </button>
                        )}
                    </div>

                    {showViewers && isOwnStory && (
                        <aside className="story-viewers-panel">
                            <div className="story-viewers-header">
                                <strong>
                                    Viewed by
                                </strong>

                                <button
                                    onClick={() =>
                                        setShowViewers(false)
                                    }
                                    type="button"
                                    aria-label="Close viewers"
                                >
                                    <FiX />
                                </button>
                            </div>

                            {viewersLoading ? (
                                <p>
                                    Loading viewers…
                                </p>
                            ) : viewers.length === 0 ? (
                                <p>
                                    No one has viewed this
                                    story yet.
                                </p>
                            ) : (
                                <div className="story-viewers-list">
                                    {viewers.map(
                                        (viewer) => (
                                            <div
                                                className="story-viewer-user"
                                                key={
                                                    viewer.id
                                                }
                                            >
                                                <img
                                                    src={formatePfpL(
                                                        viewer
                                                            .user
                                                            .profileImageUrl
                                                    )}
                                                    alt=""
                                                />

                                                <div>
                                                    <strong>
                                                        {
                                                            viewer
                                                                .user
                                                                .userName
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            viewer
                                                                .user
                                                                .name
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </aside>
                    )}

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