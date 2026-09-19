
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Masonry from "react-masonry-css";

import { search } from "../../service/search/SearchService";

import PostCard from "../../components/feed/PostCard";
import { PostCardSkeleton } from "../../components/feed/PostCardSkeleton";
import { formatePfpD} from "../../utils/formateImgProfile";

import "../../styles/search.css"

function Search() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const query = searchParams.get("q") || "";

    const [profilePage, setProfilePage] = useState(0);

    const postsSentinelRef = useRef<HTMLDivElement | null>(null);

    const breakpointColumns = {
        default: 4,
        1200: 3,
        900: 2,
        600: 1
    };

    /*
     * ============================
     * POSTS
     * ============================
     */

    const {
        data: postsData,
        isLoading: isPostsLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage
    } = useInfiniteQuery({
        queryKey: ["search-posts", query],

        queryFn: ({ pageParam }) =>
            search(query, pageParam, 12),

        initialPageParam: 0,

        getNextPageParam: (lastPage) => {
            const currentPage = lastPage.posts.number;
            const totalPages = lastPage.posts.totalPages;

            if (currentPage + 1 >= totalPages) {
                return undefined;
            }

            return currentPage + 1;
        },

        enabled: !!query.trim()
    });

    /*
     * Junta todos os posts de todas as páginas.
     */
    const posts =
        postsData?.pages.flatMap(
            (page) => page.posts.content
        ) ?? [];

    /*
     * ============================
     * PROFILES
     * ============================
     */

    const {
        data: profilesData,
        isLoading: isProfilesLoading,
        isFetching: isProfilesFetching
    } = useQuery({
        queryKey: ["search-profiles", query, profilePage],

        queryFn: () =>
            search(query, profilePage, 12),

        enabled: !!query.trim()
    });

    const profiles = profilesData?.profiles.content ?? [];

    const hasMoreProfiles =
        profilesData
            ? profilesData.profiles.number + 1 <
              profilesData.profiles.totalPages
            : false;

    /*
     * ============================
     * POSTS SENTINEL
     * ============================
     */

    useEffect(() => {
        const sentinel = postsSentinelRef.current;

        if (!sentinel) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];

                if (
                    entry.isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    fetchNextPage();
                }
            },
            {
                rootMargin: "300px"
            }
        );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, [
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage
    ]);

    /*
     * ============================
     * LOADING
     * ============================
     */

    const isInitialLoading =
        isPostsLoading || isProfilesLoading;

    if (isInitialLoading) {
        return (
            <main className="search-page">
                <h1>Search results for "{query}"</h1>

                <section>
                    <h2>Artists</h2>
                </section>

                <section>
                    <h2>Artworks</h2>

                    <Masonry
                        breakpointCols={breakpointColumns}
                        className="masonry-grid"
                        columnClassName="masonry-grid_column"
                    >
                        {Array.from({ length: 10 }).map(
                            (_, index) => (
                                <PostCardSkeleton
                                    key={`initial-${index}`}
                                />
                            )
                        )}
                    </Masonry>
                </section>
            </main>
        );
    }

    const hasResults =
        profiles.length > 0 || posts.length > 0;

    return (
        <main className="search-page">

            <h1>
                Search results for "{query}"
            </h1>

            {/* =========================
                ARTISTS
            ========================= */}

            {profiles.length > 0 && (
                <section className="search-artists">
                    <h2>Artists</h2>

                    <div className="search-artists-list">
                        {profiles.map((profile) => (
                            <div
                                className="search-artist"
                                key={profile.userId}
                                onClick={() =>
                                    navigate(
                                        `/user/${profile.userName}`
                                    )
                                }
                            >   
                            <div className="search-artist-lay">
                                <div className="search-artist-avatar">
                                    <img src={formatePfpD(profile.imageUrlProfile) } alt="" />
                                </div>

                                <div className="search-artist-data-box">
                                    <p>{profile.name}</p>
                                    <span>
                                        @{profile.userName}
                                    </span>
                                </div>
                            </div>
                                
                            </div>
                        ))}
                    </div>

                    {hasMoreProfiles && (
                        <button
                            type="button"
                            onClick={() =>
                                setProfilePage(
                                    (page) => page + 1
                                )
                            }
                            disabled={isProfilesFetching}
                        >
                            {isProfilesFetching
                                ? "Loading..."
                                : "Load more"}
                        </button>
                    )}
                </section>
            )}

            {/* =========================
                ARTWORKS
            ========================= */}

            {posts.length > 0 && (
                <section className="search-artworks">
                    <h2>Artworks</h2>

                    <Masonry
                        breakpointCols={breakpointColumns}
                        className="masonry-grid"
                        columnClassName="masonry-grid_column"
                    >
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onClick={(post) =>
                                    navigate(
                                        `/post/${post.id}`
                                    )
                                }
                            />

                        ))}

                        {isFetchingNextPage &&
                            Array.from({
                                length: 5
                            }).map((_, index) => (
                                <PostCardSkeleton
                                    key={`next-${index}`}
                                />
                            ))
                        }
                    </Masonry>

                    {/*
                     * Sentinel do infinite scroll.
                     * Quando entrar na viewport,
                     * fetchNextPage() é chamado.
                     */}
                    <div
                        ref={postsSentinelRef}
                        style={{
                            height: "1px"
                        }}
                    />
                </section>
            )}

            {!hasResults && (
                <p>No results found.</p>
            )}

        </main>
    );
}

export default Search;

