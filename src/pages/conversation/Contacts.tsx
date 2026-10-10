import { useEffect, useMemo, useRef } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { getConversations } from "../../service/conversation/ConversationService";
import { getUnreadConversationCounts } from "../../service/message/MessageService";
import { useStompTopic } from "../../hooks/useStompTopic";
import { useMe } from "../../hooks/useMe";

import type { ConversationUpdateResponse } from "../../types/message/MessageResponse";
import type { ConversationResponse } from "../../types/conversation/ConversationResponse";
import type { PageResponse } from "../../types/page/PageResponse";

import { formatTime } from "../../utils/formateData";

import "../../styles/contacts.css";

import MyFollows from "../../components/follow/MyFollows";
import NotLogged from "../../components/auth/NotLogged";
import Empty from "../../components/layout/Empty";
import Loading from "../../components/layout/Loading";

const PAGE_SIZE = 20;

// limite do atraso da animação de entrada
const MAX_STAGGER = 10;

function Contacts() {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isAuthError,
  } = useMe();

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

    queryFn: ({ pageParam }) => getConversations(pageParam, PAGE_SIZE),

    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,

    enabled: !!user,
  });

  const conversations = useMemo(
    () => data?.pages.flatMap((page) => page.content) ?? [],
    [data]
  );

  // Quantidade de mensagens não lidas por conversa
  const { data: unreadCounts = [] } = useQuery({
    queryKey: ["conversation-unread-counts"],
    queryFn: getUnreadConversationCounts,
    enabled: !!user,
  });

  const unreadByConversation = useMemo(
    () =>
      new Map(
        unreadCounts.map((item) => [item.conversationId, item.unreadCount])
      ),
    [unreadCounts]
  );

  // Atualiza a última mensagem da conversa em tempo real
  useStompTopic<ConversationUpdateResponse>(
    user ? `/topic/conversations/${user.id}` : undefined,

    (update) => {
      queryClient.setQueryData<
        InfiniteData<PageResponse<ConversationResponse>>
      >(["conversations"], (current) => {
        if (!current) return current;

        let wasFound = false;

        const pages = current.pages.map((page) => ({
          ...page,

          content: page.content.map((conversation) => {
            if (conversation.conversationId !== update.conversationId) {
              return conversation;
            }

            wasFound = true;

            return {
              ...conversation,
              lastMessage: update.lastMessage,
              lastMessageAt: update.lastMessageAt,
            };
          }),
        }));

        // Se a conversa ainda não estiver carregada,
        // busca novamente a lista.
        if (!wasFound) {
          void queryClient.invalidateQueries({
            queryKey: ["conversations"],
          });
        }

        return {
          ...current,
          pages,
        };
      });

      // Atualiza a quantidade de mensagens não lidas
      void queryClient.invalidateQueries({
        queryKey: ["conversation-unread-counts"],
      });
    },

    !!user
  );

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
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

  // Ainda verificando o usuário
  if (isLoadingUser) {
    return <p>Verificando sessão...</p>;
  }

  // Usuário não autenticado
  if (isAuthError || !user) {
    return <NotLogged />;
  }

  // Erro ao carregar conversas
  if (isError) {
    return <p>Erro ao carregar as conversas.</p>;
  }

  return (
    <main className="contact-lay">
      <div className="contact-column">
        <h1 className="contact-title">Messages</h1>

        {isLoading && <Loading />}

        <div className="contact-list">
          {!isLoading && conversations.length === 0 && <Empty />}

          {conversations.map((conversation, index) => {
            const unreadCount =
              unreadByConversation.get(conversation.conversationId) ?? 0;

            const openConversation = () => {
              navigate(`/messages/${conversation.conversationId}`, {
                state: { conversation },
              });
            };

            return (
              <div
                className={`contact-box ${unreadCount > 0 ? "unread" : ""}`}
                key={conversation.conversationId}
                role="button"
                tabIndex={0}
                style={
                  {
                    "--i": Math.min(index % PAGE_SIZE, MAX_STAGGER),
                  } as React.CSSProperties
                }
                onClick={openConversation}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    openConversation();
                  }
                }}
              >
                <div className="data-lay">
                  <div className="contact-pfp-box">
                    <img
                      src={
                        conversation.otherUserPhoto
                          ? conversation.otherUserPhoto
                          : "null-pfp.png"
                      }
                      alt=""
                      className="contact-pfp"
                      loading="lazy"
                    />
                  </div>

                  <div className="contact-data-box">
                    <p className="contact-name">
                      {conversation.otherUserName}
                    </p>

                    <p className="last-message">
                      {conversation.lastMessage
                        ? conversation.lastMessage
                        : "Nenhuma mensagem"}
                    </p>
                  </div>
                </div>

                <div className="message-at-box">
                  <p>{formatTime(conversation.lastMessageAt)}</p>

                  {unreadCount > 0 && (
                    <span className="contact-unread-badge">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {isFetchingNextPage && (
            <p className="contact-loading-more">
              Carregando mais conversas...
            </p>
          )}

          {/* sentinela dentro da lista com scroll */}
          <div ref={sentinelRef} style={{ height: "10px", flexShrink: 0 }} />
        </div>
      </div>

      <MyFollows />
    </main>
  );
}

export default Contacts;