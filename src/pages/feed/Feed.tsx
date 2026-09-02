import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Masonry from "react-masonry-css";
import { getFeed } from "../../service/post/PostService";
import PostCard from "../../components/feed/PostCard";
import "../../styles/feed.css";
import { PostCardSkeleton } from "../../components/feed/PostCardSkeleton";

const PAGE_SIZE = 12;

const breakpointColumns = {
    default: 5,
    1200: 4,
    900: 3,
    640: 2,
};

function Feed() {
    const sentinelRef = useRef<HTMLDivElement>(null);

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
        getNextPageParam: (lastPage) => {
            if (lastPage.last) return undefined;
            return lastPage.number + 1;
        },
    });

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    void fetchNextPage();
                }
            },
            { threshold: 0.1, rootMargin: "600px 0px" },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    if (isError) return <p>Erro ao carregar o feed.</p>;

    const posts = data?.pages.flatMap((page) => page.content) ?? [];

    return (
        <main className="feed-lay">
            <Masonry
                breakpointCols={breakpointColumns}
                className="masonry-grid"
                columnClassName="masonry-grid_column"
            >
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
