import { useEffect, useMemo, useRef, useState } from "react";

import "../../styles/contacts.css"
import { useInfiniteQuery } from "@tanstack/react-query";
import { getMyFollowing } from "../../service/follow/FollowService";

function MyFollows() {
    const [isOpen, setIsOpen] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const PAGE_SIZE = 10;

    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["myFollowings"],
        initialPageParam: 0,

        queryFn: ({ pageParam }) =>
            getMyFollowing(pageParam, PAGE_SIZE),

        getNextPageParam: (lastPage) =>
            lastPage.last ? undefined : lastPage.number + 1,
    });


    const followings = useMemo(
        () => data?.pages.flatMap((page) => page.content) ?? [],
        [data]
    )


    useEffect(() => {
        const sentinel = sentinelRef.current;

        if (!sentinel) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (
                    entry.isIntersecting &&
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
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    if (isError) {
        return <p>Erro ao carregar seguindo.</p>;
    }


    return (
        <aside className={`contacts-panel ${isOpen ? "open" : "closed"}`}>
            
            {isLoading && (
                <p>Carregando conversas...</p>
            )}
            <button className="btn-my-follows" onClick={() => setIsOpen(prev => !prev)}>
                {isOpen ? ">>" : "<<"}
            </button>

            {isOpen && (
                <div className="contacts-content">
                    {followings.map((following) => (
                        <div key={following.userId} >
                            <p>{following.nome}</p>
                        </div>
                    ))}


                </div>
            )}

        </aside>
    );
}


export default MyFollows