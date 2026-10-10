import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Masonry from "react-masonry-css";
import { useNavigate } from "react-router-dom";

import { getPostsByUserName } from "../../service/post/PostService";
import PostCard from "../../components/feed/PostCard";
import { PostCardSkeleton } from "../../components/feed/PostCardSkeleton";

import "../../styles/post.css";

import EmptyPostsC from "./EmptyPostsC";

const PAGE_SIZE = 12;

interface UserPostsProps {
    userName: string;
    canSeePosts: boolean;
}

function UserPosts({
    userName,
    canSeePosts,
}: UserPostsProps) {
    const sentinelRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["user-posts", userName],

        initialPageParam: 0,

        queryFn: ({ pageParam }) =>
            getPostsByUserName(
                userName,
                pageParam,
                PAGE_SIZE
            ),

        getNextPageParam: (lastPage) => {
            if (lastPage.last) {
                return undefined;
            }

            return lastPage.number + 1;
        },

        // Não faz a requisição se não puder visualizar os posts
        enabled: canSeePosts,
    });

    useEffect(() => {
        if (!canSeePosts) {
            return;
        }

        const sentinel = sentinelRef.current;

        if (!sentinel) {
            return;
        }

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
            }
        );

        observer.observe(sentinel);

        return () => observer.disconnect();
    }, [
        canSeePosts,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    ]);

    if (!canSeePosts) {
        return null;
    }

    if (isError) {
        return <p>Erro ao carregar os posts.</p>;
    }

    const posts =
        data?.pages.flatMap((page) => page.content) ?? [];

    return (
        <main className="feed-lay">
            {!isLoading && posts.length === 0 && (
                <EmptyPostsC userName={userName} />
            )}

            <Masonry
                breakpointCols={{
                    default: 5,
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
                    <PostCard
                        key={post.id}
                        post={post}
                        onClick={(post) =>
                            navigate(`/user/post/${post.id}`)
                        }
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

export default UserPosts;