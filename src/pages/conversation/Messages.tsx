import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckDouble,
  FaPaperPlane,
} from "react-icons/fa6";

import {
  getMessages,
  markConversationAsRead,
  sendMessage,
} from "../../service/message/MessageService";
import { getConversations } from "../../service/conversation/ConversationService";
import { useMe } from "../../hooks/useMe";
import { useStompTopic } from "../../hooks/useStompTopic";
import { formatePfpL } from "../../utils/formateImgProfile";
import { formatTime } from "../../utils/formateData";
import type { PageResponse } from "../../types/page/PageResponse";
import type { MessageResponse } from "../../types/message/MessageResponse";
import type { ConversationResponse } from "../../types/conversation/ConversationResponse";
import "../../styles/messages.css";


interface ConversationState {
  conversation?: ConversationResponse;
}

interface ReadEvent {
  conversationId?: number;
  messageId?: number;
  readAt?: string;
  createdAt?: string;
  type?: string;
}

type ChatListItem =
  | { kind: "separator"; id: string; label: string }
  | { kind: "message"; id: number; message: MessageResponse };

const PAGE_SIZE = 50;

/*
 * ============================
 * SEPARADOR DE DATA (estilo WhatsApp)
 * ============================
 */

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) {
    return "Hoje";
  }

  if (isSameDay(date, yesterday)) {
    return "Ontem";
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Messages() {
  const { conversationId: conversationIdParam } = useParams();
  const conversationId = Number(conversationIdParam);

  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data: me } = useMe();

  const stateConversation = (
    location.state as ConversationState | null
  )?.conversation;

  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldScrollToBottom = useRef(true);
  const initiallyMarkedRead = useRef<number | null>(null);

  const [newMessage, setNewMessage] = useState("");
  const [unseenMessages, setUnseenMessages] = useState(0);

  const messagesQueryKey = [
    "conversation-messages",
    conversationId,
  ] as const;

  // State from Contacts makes the header instant.
  // This fallback also supports a direct URL.
  const { data: conversationFallback } = useQuery({
    queryKey: ["conversation-meta", conversationId],

    queryFn: async () => {
      const page = await getConversations(0, 100);

      return (
        page.content.find(
          (item) =>
            item.conversationId === conversationId
        ) ?? null
      );
    },

    enabled:
      Number.isFinite(conversationId) &&
      !stateConversation,

    staleTime: 1000 * 60 * 5,
  });

  const conversation =
    stateConversation ??
    conversationFallback ??
    null;

  /*
   * ============================
   * MENSAGENS
   * ============================
   */

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: messagesQueryKey,

    queryFn: ({ pageParam }) =>
      getMessages(
        conversationId,
        pageParam,
        PAGE_SIZE
      ),

    initialPageParam: 0,

    getNextPageParam: (lastPage) =>
      lastPage.last
        ? undefined
        : lastPage.number + 1,

    enabled: Number.isFinite(conversationId),

    // Quando entrar novamente na conversa,
    // busca as mensagens atualizadas do backend.
    refetchOnMount: "always",
  });

  const messages = useMemo(() => {
    const uniqueMessages = new Map<
      number,
      MessageResponse
    >();

    data?.pages
      .flatMap((page) => page.content)
      .forEach((message) => {
        uniqueMessages.set(
          message.id,
          message
        );
      });

    return [...uniqueMessages.values()].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );
  }, [data]);

  /*
   * ============================
   * MENSAGENS + SEPARADORES DE DATA
   * ============================
   */

  const chatItems = useMemo<ChatListItem[]>(() => {
    const items: ChatListItem[] = [];
    let lastDateKey: string | null = null;

    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt);
      const dateKey = messageDate.toDateString();

      if (dateKey !== lastDateKey) {
        items.push({
          kind: "separator",
          id: `sep-${dateKey}`,
          label: getDateLabel(messageDate),
        });

        lastDateKey = dateKey;
      }

      items.push({
        kind: "message",
        id: message.id,
        message,
      });
    });

    return items;
  }, [messages]);

  /*
   * ============================
   * ADICIONAR MENSAGEM AO CACHE
   * ============================
   */

  const addMessageToCache = useCallback(
    (message: MessageResponse) => {
      if (
        message.conversationId !==
        conversationId
      ) {
        return;
      }

      queryClient.setQueryData<
        InfiniteData<
          PageResponse<MessageResponse>
        >
      >(
        messagesQueryKey,
        (current) => {
          if (!current) {
            return current;
          }

          const alreadyExists =
            current.pages.some((page) =>
              page.content.some(
                (item) =>
                  item.id === message.id
              )
            );

          if (alreadyExists) {
            return current;
          }

          return {
            ...current,

            pages: current.pages.map(
              (page, index) => ({
                ...page,

                totalElements:
                  page.totalElements + 1,

                ...(index === 0
                  ? {
                    content: [
                      message,
                      ...page.content,
                    ],

                    numberOfElements:
                      page.numberOfElements +
                      1,
                  }
                  : {}),
              })
            ),
          };
        }
      );
    },
    [
      conversationId,
      messagesQueryKey,
      queryClient,
    ]
  );

  /*
   * ============================
   * MARCAR COMO LIDA
   * ============================
   */

  const markReadMutation = useMutation({
    mutationFn: () =>
      markConversationAsRead(
        conversationId
      ),

    onSuccess: () => {
      // Atualiza a badge da tela de contatos
      void queryClient.invalidateQueries({
        queryKey: [
          "conversation-unread-counts",
        ],
      });
    },
  });

  const markAsRead = useCallback(() => {
    if (
      !Number.isFinite(conversationId) ||
      markReadMutation.isPending
    ) {
      return;
    }

    markReadMutation.mutate();
  }, [
    conversationId,
    markReadMutation.isPending,
    markReadMutation.mutate,
  ]);

  /*
   * Ao carregar a conversa, marca as mensagens
   * recebidas como lidas.
   */

  useEffect(() => {
    if (
      data &&
      initiallyMarkedRead.current !==
      conversationId
    ) {
      initiallyMarkedRead.current =
        conversationId;

      markReadMutation.mutate();
    }
  }, [
    conversationId,
    data,
    markReadMutation.mutate,
  ]);

  /*
   * ============================
   * NOVA MENSAGEM
   * ============================
   */

  const handleIncomingMessage = useCallback(
    (message: MessageResponse) => {
      const container =
        scrollRef.current;

      const closeToBottom =
        !container ||
        container.scrollHeight -
        container.scrollTop -
        container.clientHeight <
        120;

      shouldScrollToBottom.current =
        closeToBottom;

      addMessageToCache(message);

      // Mensagem recebida do outro usuário
      if (message.senderId !== me?.id) {
        markAsRead();
      }

      if (!closeToBottom) {
        setUnseenMessages(
          (count) => count + 1
        );
      }
    },
    [
      addMessageToCache,
      markAsRead,
      me?.id,
    ]
  );

  /*
   * ============================
   * MENSAGEM LIDA
   * ============================
   *
   * O outro usuário abriu a conversa.
   * Atualizamos o readAt da mensagem
   * diretamente no cache.
   */

  const handleReadEvent = useCallback(
    (event: ReadEvent) => {
      if (
        event.conversationId !==
        conversationId ||
        !event.messageId
      ) {
        return;
      }

      queryClient.setQueryData<
        InfiniteData<
          PageResponse<MessageResponse>
        >
      >(
        messagesQueryKey,
        (current) =>
          current && {
            ...current,

            pages: current.pages.map(
              (page) => ({
                ...page,

                content: page.content.map(
                  (message) =>
                    message.id ===
                      event.messageId
                      ? {
                        ...message,

                        readAt:
                          event.readAt ??
                          event.createdAt ??
                          new Date().toISOString(),
                      }
                      : message
                ),
              })
            ),
          }
      );
    },
    [
      conversationId,
      messagesQueryKey,
      queryClient,
    ]
  );

  /*
   * ============================
   * WEBSOCKET
   * ============================
   */

  useStompTopic<MessageResponse>(
    Number.isFinite(conversationId)
      ? `/topic/messages/conversation/${conversationId}`
      : undefined,

    handleIncomingMessage,

    !!me
  );

  useStompTopic<ReadEvent>(
    me
      ? `/topic/notifications/${me.id}`
      : undefined,

    handleReadEvent,

    !!me
  );

  /*
   * ============================
   * ENVIAR MENSAGEM
   * ============================
   */

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      sendMessage(
        conversation?.otherUserId ?? 0,
        content
      ),

    onSuccess: (message) => {
      shouldScrollToBottom.current = true;
      addMessageToCache(message);
      setNewMessage("");

      queryClient.setQueryData<
        InfiniteData<PageResponse<ConversationResponse>>
      >(
        ["conversations"],
        (current) => {
          if (!current) return current;

          const pages = current.pages.map((page) => ({
            ...page,
            content: page.content.filter(
              (conversation) =>
                conversation.conversationId !== conversationId
            ),
          }));

          const conversationToMove = current.pages
            .flatMap((page) => page.content)
            .find(
              (conversation) =>
                conversation.conversationId === conversationId
            );

          if (!conversationToMove) {
            return current;
          }

          const updatedConversation: ConversationResponse = {
            ...conversationToMove,
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
          };

          pages[0].content.unshift(updatedConversation);

          return {
            ...current,
            pages,
          };
        }
      );
    },
  });

  const submitMessage = () => {
    const content = newMessage.trim();

    if (
      content &&
      conversation?.otherUserId
    ) {
      sendMutation.mutate(content);
    }
  };

  /*
   * ============================
   * SCROLL
   * ============================
   */

  useLayoutEffect(() => {
    if (
      shouldScrollToBottom.current
    ) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length]);

  const loadOlderMessages =
    async () => {
      const container =
        scrollRef.current;

      if (
        !container ||
        !hasNextPage ||
        isFetchingNextPage
      ) {
        return;
      }

      const previousHeight =
        container.scrollHeight;

      await fetchNextPage();

      requestAnimationFrame(() => {
        container.scrollTop +=
          container.scrollHeight -
          previousHeight;
      });
    };

  const onScroll = () => {
    const container =
      scrollRef.current;

    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    shouldScrollToBottom.current =
      distanceFromBottom < 120;

    if (
      shouldScrollToBottom.current
    ) {
      setUnseenMessages(0);
    }

    if (container.scrollTop < 80) {
      void loadOlderMessages();
    }
  };

  /*
   * ============================
   * CONVERSA INVÁLIDA
   * ============================
   */

  if (!Number.isFinite(conversationId)) {
    return (
      <main className="messages-page">
        <p className="messages-feedback">
          Conversa inválida.
        </p>
      </main>
    );
  }

  return (
    <main className="messages-page">
      <section className="chat-shell">

        <header className="chat-header">
          <button
            type="button"
            className="chat-back-btn"
            onClick={() =>
              navigate("/contacts")
            }
            aria-label="Voltar para conversas"
          >
            <FaArrowLeft />
          </button>

          <img
            className="chat-header-avatar"
            src={formatePfpL(
              conversation?.otherUserPhoto
            )}
            alt=""
            onClick={()=> navigate(`/user/${conversation?.otherUserUsername}`)}
          />

          <div className="chat-header-user">
            <strong>
              {conversation?.otherUserName ??
                "Conversa"}
            </strong>

            {conversation?.otherUserName && (
              <span>
                Conversa privada
              </span>
            )}
          </div>
        </header>

        <div
          className="chat-messages"
          ref={scrollRef}
          onScroll={onScroll}
        >
          {isFetchingNextPage && (
            <p className="chat-history-status">
              Carregando mensagens anteriores...
            </p>
          )}

          {isLoading && (
            <p className="messages-feedback">
              Carregando conversa...
            </p>
          )}

          {isError && (
            <p className="messages-feedback messages-feedback--error">
              Não foi possível carregar as
              mensagens.
            </p>
          )}

          {!isLoading &&
            !isError &&
            messages.length === 0 && (
              <div className="chat-empty">
                <span>✦</span>

                <p>
                  Sem mensagens por aqui.
                </p>

                <small>
                  Comece a conversa sobre arte.
                </small>
              </div>
            )}

          {chatItems.map((item) => {
            if (item.kind === "separator") {
              return (
                <div
                  key={item.id}
                  className="chat-date-separator"
                >
                  <span>{item.label}</span>
                </div>
              );
            }

            const message = item.message;
            const isMine =
              message.senderId === me?.id;

            return (
              <div
                key={message.id}
                className={`chat-message-row${isMine
                  ? " chat-message-row--mine"
                  : ""
                  }`}
              >
                {!isMine && (
                  <img
                    className="chat-message-avatar"
                    src={formatePfpL(
                      message.senderPhoto ??
                      undefined
                    )}
                    alt=""
                  />
                )}

                <div
                  className={`chat-bubble${isMine
                    ? " chat-bubble--mine"
                    : ""
                    }`}
                >
                  {!isMine && (
                    <span className="chat-sender-name">
                      {message.senderName}
                    </span>
                  )}

                  <p>
                    {message.content}
                  </p>

                  <span className="chat-message-time">
                    {formatTime(
                      message.createdAt
                    )}

                    {isMine &&
                      message.readAt && (
                        <FaCheckDouble
                          className="chat-read-icon"
                          aria-label="Lida"
                        />
                      )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {unseenMessages > 0 && (
          <button
            type="button"
            className="chat-new-messages"
            onClick={() => {
              shouldScrollToBottom.current =
                true;

              scrollRef.current?.scrollTo({
                top: scrollRef.current
                  .scrollHeight,
                behavior: "smooth",
              });

              setUnseenMessages(0);
            }}
          >
            Novas mensagens (
            {unseenMessages})
          </button>
        )}

        <form
          className="chat-composer"
          onSubmit={(event) => {
            event.preventDefault();
            submitMessage();
          }}
        >
          <textarea
            value={newMessage}
            onChange={(event) =>
              setNewMessage(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                submitMessage();
              }
            }}
            placeholder={
              conversation
                ? "Escreva uma mensagem..."
                : "Carregando contato..."
            }
            disabled={
              !conversation ||
              sendMutation.isPending
            }
            rows={1}
          />

          <button
            type="submit"
            disabled={
              !newMessage.trim() ||
              !conversation?.otherUserId ||
              sendMutation.isPending
            }
            aria-label="Enviar mensagem"
          >
            <FaPaperPlane />

            {sendMutation.isPending && (
              <span className="sr-only">
                Enviando
              </span>
            )}
          </button>
        </form>

      </section>
    </main>
  );
}

export default Messages;