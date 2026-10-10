import { useEffect, useMemo, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { formatTime } from "../../utils/formateData";
import { useMe } from "../../hooks/useMe";

import {
  FaHeart,
  FaUserPlus,
  FaEnvelope,
  FaCheck,
  FaReply,
  FaComment,
  FaUserClock,
} from "react-icons/fa";

import type {
  NotificationType,
  FollowRequestStatus,
} from "../../types/notifications/NotificationGetResponse";

import "../../styles/notifications.css";

import {
  acceptFollowRequest,
  rejectFollowRequest,
} from "../../service/follow-request/FollowRequestService";

import { getNotification } from "../../service/notifications/NotificationService";
import { getStoryImage } from "../../service/story/StoryService";

import NotLogged from "../../components/auth/NotLogged";
import { formatePfpL } from "../../utils/formateImgProfile";
import Empty from "../../components/layout/Empty";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/layout/Loading";

const PAGE_SIZE = 20;

// limite do atraso da animação de entrada (evita cards demorando muito pra aparecer)
const MAX_STAGGER = 10;

const notificationIconClasses: Record<NotificationType, string> = {
  COMMENT: "notification-icon comment",
  LIKE: "notification-icon like",
  FOLLOW: "notification-icon follow",
  MESSAGE: "notification-icon message",
  READ: "notification-icon read",
  FOLLOW_REQUEST: "notification-icon follow-request",
  REPLY: "notification-icon reply",
};

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  COMMENT: <FaComment />,
  LIKE: <FaHeart />,
  FOLLOW: <FaUserPlus />,
  MESSAGE: <FaEnvelope />,
  READ: <FaCheck />,
  FOLLOW_REQUEST: <FaUserClock />,
  REPLY: <FaReply />,
};

function Notifications() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [followRequestActions, setFollowRequestActions] = useState<
    Record<number, FollowRequestStatus>
  >({});

  const [storyImages, setStoryImages] = useState<Record<number, string>>({});

  // guarda sempre a versão mais recente pra liberar os Object URLs só no unmount
  const storyImagesRef = useRef<Record<number, string>>({});

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
    queryKey: ["notifications"],
    initialPageParam: 0,

    queryFn: ({ pageParam }) => getNotification(pageParam, PAGE_SIZE),

    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,

    enabled: !!user,
  });

  const notifications = useMemo(
    () => data?.pages.flatMap((page) => page.content) ?? [],
    [data]
  );

  /*
   * Carrega as imagens dos stories.
   *
   * A imagem do story não pode ser usada diretamente no src,
   * porque o endpoint é protegido.
   *
   * Primeiro fazemos o GET autenticado através do api,
   * recebemos um Blob e transformamos em Object URL.
   */
  useEffect(() => {
    const loadStoryImages = async () => {
      const storyNotifications = notifications.filter(
        (notification) =>
          notification.storySummaryResponse &&
          !storyImagesRef.current[notification.id]
      );

      for (const notification of storyNotifications) {
        const story = notification.storySummaryResponse;

        if (!story) {
          continue;
        }

        try {
          const imageUrl = await getStoryImage(story.imageUrl);

          storyImagesRef.current[notification.id] = imageUrl;

          setStoryImages((current) => ({
            ...current,
            [notification.id]: imageUrl,
          }));
        } catch {
          /*
           * O story pode ter expirado,
           * sido removido ou o usuário pode não ter
           * mais permissão para visualizá-lo.
           *
           * Nesse caso simplesmente não exibimos a imagem.
           */
        }
      }
    };

    void loadStoryImages();
  }, [notifications]);

  /*
   * Libera os Object URLs somente quando o componente for desmontado.
   */
  useEffect(() => {
    return () => {
      Object.values(storyImagesRef.current).forEach((imageUrl) => {
        URL.revokeObjectURL(imageUrl);
      });
    };
  }, []);

  const acceptMutation = useMutation({
    mutationFn: (requestId: number) => acceptFollowRequest(requestId),

    onMutate: (requestId) => {
      const notification = notifications.find(
        (item) => item.followRequestId === requestId
      );

      if (!notification) {
        return;
      }

      setFollowRequestActions((current) => ({
        ...current,
        [notification.id]: "ACCEPTED",
      }));
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },

    onError: (_, requestId) => {
      const notification = notifications.find(
        (item) => item.followRequestId === requestId
      );

      if (!notification) {
        return;
      }

      setFollowRequestActions((current) => {
        const updated = { ...current };

        delete updated[notification.id];

        return updated;
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: number) => rejectFollowRequest(requestId),

    onMutate: (requestId) => {
      const notification = notifications.find(
        (item) => item.followRequestId === requestId
      );

      if (!notification) {
        return;
      }

      setFollowRequestActions((current) => ({
        ...current,
        [notification.id]: "REJECTED",
      }));
    },

    onError: (_, requestId) => {
      const notification = notifications.find(
        (item) => item.followRequestId === requestId
      );

      if (!notification) {
        return;
      }

      setFollowRequestActions((current) => {
        const updated = { ...current };

        delete updated[notification.id];

        return updated;
      });
    },
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) {
      return;
    }

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

  if (isLoadingUser) {
    return <Loading />;
  }

  if (isAuthError || !user) {
    return <NotLogged />;
  }

  if (isError) {
    return <p>Failed to load notifications.</p>;
  }

  return (
    <main className="notification-lay">
      <h1 className="notification-title">Notifications</h1>

      {isLoading && <Loading />}

      <div className="notification-list">
        {!isLoading && notifications.length === 0 && <Empty />}

        {notifications.map((notification, index) => {
          const isFollowRequest = notification.type === "FOLLOW_REQUEST";

          const localAction = followRequestActions[notification.id];

          const status = localAction ?? notification.followRequestStatus;

          const isPending = status === "PENDING";

          const isAccepting =
            acceptMutation.isPending &&
            acceptMutation.variables === notification.followRequestId;

          const isRejecting =
            rejectMutation.isPending &&
            rejectMutation.variables === notification.followRequestId;

          const storyImage = storyImages[notification.id];

          return (
            <div
              className="notification-box"
              key={notification.id}
              style={
                {
                  "--i": Math.min(index % PAGE_SIZE, MAX_STAGGER),
                } as React.CSSProperties
              }
            >
              <div className="notification-data">
                <div className="notification-data-lay-l">
                  <div className="img-noti-box">
                    <div className={notificationIconClasses[notification.type]}>
                      {notificationIcons[notification.type]}
                    </div>

                    <img
                      src={formatePfpL(notification.senderPhoto)}
                      alt={notification.senderName}
                      className="notification-pfp"
                    />
                  </div>

                  <div className="notification-content-box">
                    <p className="notification-content">
                      <strong className="notification-sender">
                        {notification.senderName}
                      </strong>
                      {notification.content}
                    </p>

                    <p className="notification-date">
                      {formatTime(notification.createdAt)}
                    </p>

                    {isFollowRequest && status && (
                      <div className="follow-request-actions">
                        {isPending ? (
                          <>
                            <button
                              className="follow-request-confirm"
                              disabled={isAccepting || isRejecting}
                              onClick={() =>
                                acceptMutation.mutate(
                                  notification.followRequestId!
                                )
                              }
                            >
                              {isAccepting ? "Accepting..." : "Confirm"}
                            </button>

                            <button
                              className="follow-request-reject"
                              disabled={isAccepting || isRejecting}
                              onClick={() =>
                                rejectMutation.mutate(
                                  notification.followRequestId!
                                )
                              }
                            >
                              {isRejecting ? "Rejecting..." : "Reject"}
                            </button>
                          </>
                        ) : (
                          <span
                            className={`follow-request-result ${status.toLowerCase()}`}
                          >
                            {status === "ACCEPTED"
                              ? "Request accepted"
                              : "Request rejected"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="notification-data-lay-r">
                  {notification.post && (
                    <div
                      className="notification-thumb"
                      onClick={() =>
                        navigate(`/post/${notification.post!.id}`)
                      }
                    >
                      <img
                        className="notification-post"
                        src={notification.post.imageUrl}
                        alt=""
                      />
                    </div>
                  )}

                  {notification.storySummaryResponse && storyImage && (
                    <div
                      className="notification-thumb"
                      onClick={() => navigate(`/story/${user.userName}`)}
                    >
                      <img
                        className="notification-post"
                        src={storyImage}
                        alt=""
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isFetchingNextPage && (
        <p className="notification-loading-more">
          Loading more notifications...
        </p>
      )}

      <div ref={sentinelRef} style={{ height: "10px" }} />
    </main>
  );
}

export default Notifications;