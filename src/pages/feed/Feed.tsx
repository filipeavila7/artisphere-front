import { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Masonry from "react-masonry-css";
import { getFeed } from "../../service/post/PostService";
import PostCard from "../../components/feed/PostCard";
import { PostCardSkeleton } from "../../components/feed/PostCardSkeleton";
import "../../styles/feed.css";

const PAGE_SIZE = 12;
const SCROLL_STORAGE_KEY = "feed-scroll:v1";

const breakpointColumns = { default: 5, 1200: 4, 900: 3, 640: 2 };

type SavedFeedPosition = { y: number };

function readSavedPosition(): SavedFeedPosition | null {
    try {
        const value = sessionStorage.getItem(SCROLL_STORAGE_KEY);
        if (value) {
            const parsed: unknown = JSON.parse(value);
            if (
                typeof parsed === "object" && parsed !== null && "y" in parsed &&
                typeof parsed.y === "number" && Number.isFinite(parsed.y) && parsed.y >= 0
            ) {
                return { y: parsed.y };
            }
        }
    } catch {
        // A corrupted value or a value from an older format is ignored.
    }

    // Compatibility with the previous implementation, which stored only the
    // numeric value under this key.
    const legacyValue = Number(sessionStorage.getItem("feed-scroll"));
    if (Number.isFinite(legacyValue) && legacyValue > 0) {
        return { y: legacyValue };
    }
    return null;
}

function Feed() {
    const sentinelRef = useRef<HTMLDivElement>(null);
    const feedRef = useRef<HTMLElement>(null);
    // Read once: a browser clamp while the route mounts must not overwrite the
    // position saved when the user left the Feed.
    const savedPosition = useRef<SavedFeedPosition | null>(readSavedPosition());
    const restoredScroll = useRef(savedPosition.current === null);
    const restoringScroll = useRef(savedPosition.current !== null);

    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["feed"],
        initialPageParam: 0,
        queryFn: ({ pageParam }) => getFeed(pageParam, PAGE_SIZE),
        getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.number + 1,
    });

    const posts = useMemo(
        () => data?.pages.flatMap((page) => page.content) ?? [],
        [data],
    );

    // Persist only user-driven scrolls. During a route change the browser can
    // clamp the old position before Feed renders (for example, 2784 -> 2200).
    useEffect(() => {
        let frame: number | null = null;
        const saveScroll = () => {
            if (restoringScroll.current || frame !== null) return;
            frame = requestAnimationFrame(() => {
                frame = null;
                sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify({ y: window.scrollY }));
            });
        };

        window.addEventListener("scroll", saveScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", saveScroll);
            if (frame !== null) cancelAnimationFrame(frame);
        };
    }, []);

    // Fetch pages explicitly during restoration. Depending only on the sentinel
    // can leave the rendered document permanently shorter than the target.
    useEffect(() => {
        const target = savedPosition.current?.y;
        if (target === undefined || restoredScroll.current || !data) return;

        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        if (maxScroll < target && hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
        }
    }, [data, fetchNextPage, hasNextPage, isFetchingNextPage, posts.length]);

    // Card placeholders have a temporary 3/4 ratio. Wait for the images that
    // are currently rendered to decode, then check the *final* layout height.
    useEffect(() => {
        const target = savedPosition.current?.y;
        if (target === undefined || restoredScroll.current || !data) return;

        let cancelled = false;
        const restore = async () => {
            const images = Array.from(feedRef.current?.querySelectorAll("img") ?? []);
            await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            if (cancelled || restoredScroll.current) return;

            const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            if (maxScroll < target && hasNextPage) {
                if (!isFetchingNextPage) void fetchNextPage();
                return;
            }

            restoredScroll.current = true;
            window.scrollTo({ top: Math.min(target, maxScroll), behavior: "auto" });
            requestAnimationFrame(() => { restoringScroll.current = false; });
        };

        void restore();
        return () => { cancelled = true; };
    }, [data, fetchNextPage, hasNextPage, isFetchingNextPage, posts.length]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    void fetchNextPage();
                }
            },
            { threshold: 0.1, rootMargin: "600px 0px" },
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    if (isError) return <p>Erro ao carregar o feed.</p>;

    return (
        <main ref={feedRef} className="feed-lay">
            <Masonry breakpointCols={breakpointColumns} className="masonry-grid" columnClassName="masonry-grid_column">
                {isLoading && Array.from({ length: 10 }).map((_, index) => (
                    <PostCardSkeleton key={`initial-${index}`} />
                ))}
                {posts.map((post) => <PostCard key={post.id} post={post} />)}
                {isFetchingNextPage && Array.from({ length: 5 }).map((_, index) => (
                    <PostCardSkeleton key={`next-${index}`} />
                ))}
            </Masonry>
            <div ref={sentinelRef} style={{ height: "10px" }} />
        </main>
    );
}

export default Feed;
