import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Masonry from "react-masonry-css";


import { PostCardSkeleton } from "../../components/feed/PostCardSkeleton";

import "../../styles/post.css";

import PostCardNew from "../feed/PostCardNew";
import { getMySavedPosts } from "../../service/save/SaveService";
import EmptyPostsA from "../post/EmptyPostsA";

const PAGE_SIZE = 12;

function SavedPosts() {
    const sentinelRef = useRef<HTMLDivElement>(null);

    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["my-posts-saved"],
        initialPageParam: 0,

        queryFn: ({ pageParam }) =>
            getMySavedPosts(pageParam, PAGE_SIZE),

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
                if (
                    entries[0].isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    void fetchNextPage();
                }
            },
            {
                threshold: 0.1,
                rootMargin: "600px 0px",
            },
        );

        observer.observe(sentinel);

        return () => observer.disconnect();
    }, [
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    ]);

    if (isError) {
        return <p>Erro ao carregar seus posts.</p>;
    }

    const posts =
        data?.pages.flatMap((page) => page.content) ?? [];

    return (
        <main className="feed-lay">
            {!isLoading && posts.length === 0 && (
                <EmptyPostsA />
            )}
            <Masonry
                breakpointCols={{
                    default: 4,
                    1200: 4,
                    900: 3,
                    640: 2,
                }}
                className="masonry-grid"
                columnClassName="masonry-grid_column"
            >
                {/* Carregamento inicial */}
                {isLoading &&
                    Array.from({ length: 10 }).map((_, index) => (
                        <PostCardSkeleton
                            key={`initial-${index}`}
                        />
                    ))}

                {/* Posts */}
                {posts.map((post) => (
                    <PostCardNew
                        key={post.postResponse.id}
                        post={post.postResponse}
                    />
                ))}

                {/* Carregamento da próxima página */}
                {isFetchingNextPage &&
                    Array.from({ length: 5 }).map((_, index) => (
                        <PostCardSkeleton
                            key={`next-${index}`}
                        />
                    ))}
            </Masonry>

            {/* Sentinel */}
            <div
                ref={sentinelRef}
                style={{ height: "10px" }}
            />
        </main>
    );
}

export default SavedPosts