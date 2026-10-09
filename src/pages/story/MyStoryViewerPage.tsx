import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiArrowLeft, FiEye, FiHeart, FiTrash2, FiX } from "react-icons/fi";
import { FaStar } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";

import {
    deleteStory,
    getMyStories,
    getStoryImage
} from "../../service/story/StoryService";

import type { MyStorySummaryResponse } from "../../types/story/StoryType";
import type { StoryVisibilityResponse } from "../../types/story-visibility/StoryVisibilityResponse";
import { getStoryVisibilities } from "../../service/story-visibility/StoryVisibilityService";

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

    return hours < 24
        ? `${hours}h`
        : `${Math.floor(hours / 24)}d`;
}

function MyStoryViewerPage() {
    const { storyId } = useParams<{ storyId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {
        data: stories = [],
        isLoading,
        isError
    } = useQuery<MyStorySummaryResponse[]>({
        queryKey: ["myStories"],
        queryFn: getMyStories
    });

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(false);
    const [viewers, setViewers] = useState<StoryVisibilityResponse[]>([]);
    const [viewersLoading, setViewersLoading] = useState(false);
    const [showViewers, setShowViewers] = useState(false);
    const [showLikeBurst, setShowLikeBurst] = useState(false);
    const activeStoryId = useRef<number | undefined>(undefined);

    const activeIndex = stories.findIndex(
        (story) => String(story.id) === storyId
    );

    const story =
        activeIndex >= 0
            ? stories[activeIndex]
            : undefined;

    activeStoryId.current = story?.id;

    const close = useCallback(() => {
        navigate("/story/me");
    }, [navigate]);

    useEffect(() => {
        setShowViewers(false);
        setViewers([]);
        setViewersLoading(false);
        setShowLikeBurst(false);
    }, [story?.id]);

    useEffect(() => {
        if (!story) return;

        let active = true;
        const requestedStoryId = story.id;
        setViewersLoading(true);

        getStoryVisibilities(requestedStoryId, 0, 50)
            .then((response) => {
                if (active && activeStoryId.current === requestedStoryId) {
                    setViewers(response.content);
                }
            })
            .catch((error) => {
                if (active) {
                    console.error("Error loading story viewers:", error);
                }
            })
            .finally(() => {
                if (active && activeStoryId.current === requestedStoryId) {
                    setViewersLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [story?.id]);

    useEffect(() => {
        if (!viewers.some((viewer) => viewer.liked)) {
            setShowLikeBurst(false);
            return;
        }

        setShowLikeBurst(true);
        const timer = window.setTimeout(() => setShowLikeBurst(false), 5_000);
        return () => window.clearTimeout(timer);
    }, [viewers, story?.id]);

    useEffect(() => {
        if (
            !isLoading &&
            !isError &&
            (!stories.length || activeIndex < 0)
        ) {
            navigate("/story/me", { replace: true });
        }
    }, [
        activeIndex,
        isError,
        isLoading,
        navigate,
        stories
    ]);

    useEffect(() => {
        if (
            !story ||
            story.storyType !== "IMAGE" ||
            !story.imageUrl
        ) {
            setImageUrl(null);
            setImageLoading(false);
            return;
        }

        let active = true;
        let objectUrl: string | null = null;

        setImageUrl(null);
        setImageLoading(true);

        getStoryImage(story.imageUrl)
            .then((url) => {
                if (!active) {
                    URL.revokeObjectURL(url);
                    return;
                }

                objectUrl = url;
                setImageUrl(url);
            })
            .catch(() => {
                if (active) {
                    setImageUrl(null);
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

    const changeStory = useCallback(
        (nextIndex: number) => {
            if (nextIndex < 0) {
                return;
            }

            if (nextIndex >= stories.length) {
                close();
                return;
            }

            navigate(
                `/story/me/${stories[nextIndex].id}`,
                { replace: true }
            );
        },
        [close, navigate, stories]
    );

    useEffect(() => {
        if (
            isLoading ||
            isError ||
            !story ||
            deleting ||
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
        deleting,
        isError,
        isLoading,
        showViewers,
        story
    ]);

    const handleShowViewers = () => {
        if (!story) return;

        setShowViewers((visible) => !visible);
    };

    const handleDelete = async () => {
        if (!story || deleting) {
            return;
        }

        if (
            !window.confirm(
                "Delete this story? This action cannot be undone."
            )
        ) {
            return;
        }

        setDeleting(true);
        setDeleteError(false);

        try {
            await deleteStory(story.id);

            const updatedStories =
                stories.filter(
                    (item) => item.id !== story.id
                );

            queryClient.setQueryData<
                MyStorySummaryResponse[]
            >(
                ["myStories"],
                updatedStories
            );

            await queryClient.invalidateQueries({
                queryKey: ["myStories"]
            });

            if (updatedStories.length === 0) {
                navigate("/story/me", {
                    replace: true
                });

                return;
            }

            const nextIndex = Math.min(
                activeIndex,
                updatedStories.length - 1
            );

            navigate(
                `/story/me/${updatedStories[nextIndex].id}`,
                { replace: true }
            );
        } catch {
            setDeleteError(true);
            setDeleting(false);
        }
    };

    const totalStories = stories.length;
    console.log(story?.storyVisibility)

    return (
        <main
            className="story-viewer"
            aria-label="My story viewer"
        >
            <button
                className="story-viewer-close"
                type="button"
                onClick={close}
                aria-label="Close stories"
            >
                <FiX />
            </button>

            {isLoading ? (
                <div
                    className="story-viewer-message"
                    role="status"
                >
                    Loading your stories…
                </div>
            ) : isError ? (
                <div className="story-viewer-message">
                    <p>
                        Could not load your stories.
                    </p>

                    <button
                        type="button"
                        onClick={close}
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
                        aria-label={`${activeIndex + 1} of ${totalStories} stories`}
                    >
                        {stories.map((item, index) => (
                            <div
                                className="story-progress-track"
                                key={item.id}
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
                                                  animationDuration: `${STORY_DURATION}ms`
                                              }
                                            : undefined
                                    }
                                />
                            </div>
                        ))}
                    </div>

                    <header className="story-viewer-header">
                        <img
                            src={formatePfpL(
                                story.ownerUser?.profileImageUrl
                            )}
                            alt=""
                            className="story-viewer-avatar"
                        />

                        <span className="story-viewer-username">
                            {story.ownerUser?.userName ?? "you"}
                        </span>

                        <time
                            className="story-viewer-time"
                            dateTime={story.createdAt}
                        >
                            {relativeTime(
                                story.createdAt
                            )}
                        </time>

                      

                        {story.storyVisibility === "CLOSE_FRIENDS" && (
                            <span
                                className="story-close-friends"
                                title="Close friends story"
                                aria-label="Close friends story"
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
                            ) : imageUrl ? (
                                <div className="story-image-wrapper">
                                    <img
                                        className="story-viewer-image"
                                        src={imageUrl}
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
                            <div className="story-viewer-text">
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
                        <button
                            className="story-viewer-views"
                            type="button"
                            onClick={handleShowViewers}
                            aria-label="Show viewers"
                            aria-expanded={showViewers}
                        >
                            <span className="story-viewer-eye-icon">
                                <FiEye />
                            </span>
                            {showLikeBurst && (
                                <FiHeart
                                    className="story-viewer-like-burst"
                                    aria-hidden="true"
                                />
                            )}
                            <span>{story.totalVisibilities}</span>
                        </button>
                        <button
                            className="my-story-delete"
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            aria-label="Delete this story"
                            title="Delete story"
                        >
                            <FiTrash2 />
                        </button>
                    </div>

                    {showViewers && (
                        <aside className="story-viewers-panel">
                            <div className="story-viewers-header">
                                <strong>Viewed by</strong>
                                <button
                                    type="button"
                                    onClick={() => setShowViewers(false)}
                                    aria-label="Close viewers"
                                >
                                    <FiX />
                                </button>
                            </div>

                            {viewersLoading ? (
                                <p>Loading viewers…</p>
                            ) : viewers.length === 0 ? (
                                <p>No one has viewed this story yet.</p>
                            ) : (
                                <div className="story-viewers-list">
                                    {viewers.map((viewer) => (
                                        <div className="story-viewer-user" key={viewer.id}>
                                            <img
                                                src={formatePfpL(viewer.user.profileImageUrl)}
                                                alt=""
                                            />
                                            <div>
                                                <strong>{viewer.user.userName}</strong>
                                                <span>{viewer.user.name}</span>
                                            </div>
                                            {viewer.liked && (
                                                <FiHeart
                                                    className="story-viewer-liked"
                                                    aria-label="Liked this story"
                                                    title="Liked this story"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </aside>
                    )}

                    {deleteError && (
                        <p
                            className="my-story-delete-error"
                            role="alert"
                        >
                            Could not delete this story.
                            Please try again.
                        </p>
                    )}

                    {deleting && (
                        <p
                            className="my-story-delete-status"
                            role="status"
                        >
                            Deleting…
                        </p>
                    )}

                    <button
                        className="story-hit-area story-hit-area--previous"
                        type="button"
                        onClick={() =>
                            changeStory(activeIndex - 1)
                        }
                        aria-label="Previous story"
                    />

                    <button
                        className="story-hit-area story-hit-area--next"
                        type="button"
                        onClick={() =>
                            changeStory(activeIndex + 1)
                        }
                        aria-label="Next story"
                    />

                    <button
                        className="story-viewer-back"
                        type="button"
                        onClick={close}
                        aria-label="Back to my stories"
                    >
                        <FiArrowLeft />
                    </button>
                </section>
            ) : (
                <div className="story-viewer-message">
                    <p>No active stories.</p>

                    <button
                        type="button"
                        onClick={close}
                    >
                        Go back
                    </button>
                </div>
            )}
        </main>
    );
}

export default MyStoryViewerPage;
