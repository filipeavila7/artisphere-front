import { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getConversations } from "../../service/conversation/ConversationService";
import { formatTime } from "../../hooks/formateData";

const PAGE_SIZE = 20;

function Contacts() {
    const sentinelRef = useRef<HTMLDivElement>(null);

    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["conversations"],
        initialPageParam: 0,

        queryFn: ({ pageParam }) =>
            getConversations(pageParam, PAGE_SIZE),

        getNextPageParam: (lastPage) =>
            lastPage.last ? undefined : lastPage.number + 1,
    });

    const conversations = useMemo(
        () => data?.pages.flatMap((page) => page.content) ?? [],
        [data]
    );

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
        return <p>Erro ao carregar as conversas.</p>;
    }

    return (
        <main>
            {isLoading && (
                <p>Carregando conversas...</p>
            )}

            {conversations.map((conversation) => (
                <div key={conversation.conversationId}>
                  <div className="contact-pfp-box">
                    <img src={
                      conversation.otherUserPhoto ? conversation.otherUserPhoto : "null-pfp.png"} alt="" className="contact-pfp" />
                  </div>
                    <div className="contact-data-box">
                      <p className="contact-name">{conversation.otherUserName}</p>
                      <p className="last-message">{
                      conversation.lastMessage ? conversation.lastMessage : "Nehuma mensagem"}</p>
                      
                    </div>

                    <div className="message-at-box">
                      <p>{formatTime(conversation.lastMessageAt)}</p>
                    </div>
                    
                </div>
            ))}

            {isFetchingNextPage && (
                <p>Carregando mais conversas...</p>
            )}

            <div
                ref={sentinelRef}
                style={{ height: "10px" }}
            />
        </main>
    );
}

export default Contacts;