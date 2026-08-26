import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Masonry from "react-masonry-css";
import { getFeed } from "../../service/post/PostService";
import PostCard from "../../components/feed/PostCard";

import "../../styles/feed.css"
import { PostCardSkeleton } from "../../components/feed/PostCardSkeleton";

const PAGE_SIZE = 12;

// breakpoints -> quantidade de colunas
// substitui os @media do CSS antigo
const breakpointColumns = {
    default: 4,
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
            if (lastPage.last) {
                return undefined;
            }
            return lastPage.number + 1;
        },
    });

    const restoredScroll = useRef(false);
    const scrollPosition = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            scrollPosition.current = window.scrollY;
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            sessionStorage.setItem(
                "feed-scroll",
                String(scrollPosition.current)
            );

            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        if (!data || restoredScroll.current) return;

        const savedScroll = sessionStorage.getItem("feed-scroll");

        if (!savedScroll) {
            restoredScroll.current = true;
            return;
        }

        const target = Number(savedScroll);

        const maxScrollAvailable =
            document.documentElement.scrollHeight - window.innerHeight;

        const canReachTarget = maxScrollAvailable >= target;

        if (!canReachTarget && hasNextPage) {
            return;
        }

        restoredScroll.current = true;

        requestAnimationFrame(() => {
            window.scrollTo({
                top: target,
                behavior: "instant",
            });
        });
    }, [data, hasNextPage]);

    useEffect(() => {
        const sentinel = sentinelRef.current;

        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1, rootMargin: "600px 0px" }
        );

        observer.observe(sentinel);

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isError) {
        return <p>Erro ao carregar o feed.</p>;
    }

    const posts = data?.pages.flatMap((page) => page.content) ?? [];

    return (
        <main className="feed-lay">
            <h1>Feed</h1>

            <Masonry
                breakpointCols={breakpointColumns}
                className="masonry-grid"
                columnClassName="masonry-grid_column"
            >
                {isLoading &&
                    Array.from({ length: 10 }).map((_, index) => (
                        <PostCardSkeleton key={`initial-${index}`} />
                    ))
                }

                {posts.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                    />
                ))}

                {isFetchingNextPage &&
                    Array.from({ length: 5 }).map((_, index) => (
                        <PostCardSkeleton key={`next-${index}`} />
                    ))
                }
            </Masonry>

            <div ref={sentinelRef} style={{ height: "10px" }} />
        </main>
    );
}

export default Feed;