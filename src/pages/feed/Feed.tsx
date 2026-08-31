import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Masonry from "react-masonry-css";
import { getFeed } from "../../service/post/PostService";
import PostCard from "../../components/feed/PostCard";
import { useToast } from "../../hooks/useToast";
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
    const { showToast } = useToast();
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

    const restoredScroll = useRef(false);
    const scrollPosition = useRef(0);

    useEffect(() => {
        console.log("🟢 FEED MONTOU");

        const handleScroll = () => {
            scrollPosition.current = window.scrollY;
            sessionStorage.setItem("feed-scroll", String(window.scrollY));
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            console.log("🔴 FEED DESMONTOU");
            console.log("📌 ÚLTIMO SCROLL:", scrollPosition.current);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        console.log("🔄 EFEITO DE RESTAURAÇÃO EXECUTOU", {
            temData: !!data,
            jaRestaurou: restoredScroll.current,
            hasNextPage,
            scrollAtual: window.scrollY,
        });

        if (!data || restoredScroll.current) return;

        const savedScroll = sessionStorage.getItem("feed-scroll");
        console.log("💾 SCROLL SALVO:", savedScroll);

        if (!savedScroll) {
            restoredScroll.current = true;
            showToast("success", "Nada pra restaurar");
            return;
        }

        const target = Number(savedScroll);
        console.log("🎯 TARGET:", target);

        const maxScrollAvailable =
            document.documentElement.scrollHeight - window.innerHeight;
        const canReachTarget = maxScrollAvailable >= target;

        console.log("📏 ALTURA DISPONÍVEL:", maxScrollAvailable);
        console.log("🎯 PODE CHEGAR NO TARGET?", canReachTarget);

        if (!canReachTarget && hasNextPage) {
            console.log("⏳ AINDA NÃO CONSEGUE CHEGAR NO TARGET, ESPERANDO MAIS POSTS...");
            return;
        }

        restoredScroll.current = true;
        showToast("success", "scroll restaurado");
        console.log("🚀 VAI RESTAURAR SCROLL PARA:", target);

        requestAnimationFrame(() => {
            console.log("➡️ ANTES DO SCROLL:", window.scrollY);
            window.scrollTo({ top: target, behavior: "instant" });
            console.log("➡️ DEPOIS DO SCROLL:", window.scrollY);

            setTimeout(() => {
                console.log("⏱️ 500ms DEPOIS DO SCROLL:", window.scrollY);
            }, 500);
            setTimeout(() => {
                console.log("⏱️ 1000ms DEPOIS DO SCROLL:", window.scrollY);
            }, 1000);
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
            { threshold: 0.1, rootMargin: "600px 0px" },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
