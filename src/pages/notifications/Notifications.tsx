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
import NotLogged from "../../components/auth/NotLogged";
import { formatePfpL } from "../../utils/formateImgProfile";
import Empty from "../../components/layout/Empty";

const PAGE_SIZE = 20;

const notificationIconClasses: Record<NotificationType, string> = {
  COMMENT: "notification-icon comment",
  LIKE: "notification-icon like",
  FOLLOW: "notification-icon follow",
  MESSAGE: "notification-icon message",
  READ: "notification-icon read",
  FOLLOW_REQUEST: "notification-icon follow-request",
  REPLY: "notification-icon reply",
};

const notificationIcons: Record<
  NotificationType,
  React.ReactNode
> = {
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

  const [followRequestActions, setFollowRequestActions] = useState<
    Record<number, FollowRequestStatus>
  >({});

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

    queryFn: ({ pageParam }) =>
      getNotification(pageParam, PAGE_SIZE),

    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,

    enabled: !!user,
  });

  const notifications = useMemo(
    () => data?.pages.flatMap((page) => page.content) ?? [],
    [data]
  );

  const acceptMutation = useMutation({
    mutationFn: (requestId: number) =>
      acceptFollowRequest(requestId),

    onMutate: (requestId) => {
      const notification = notifications.find(
        (item) => item.followRequestId === requestId
      );

      if (!notification) return;

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

      if (!notification) return;

      setFollowRequestActions((current) => {
        const updated = { ...current };
        delete updated[notification.id];
        return updated;
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: number) =>
      rejectFollowRequest(requestId),

    onMutate: (requestId) => {
      const notification = notifications.find(
        (item) => item.followRequestId === requestId
      );

      if (!notification) return;

      setFollowRequestActions((current) => ({
        ...current,
        [notification.id]: "REJECTED",
      }));
    },

    onError: (_, requestId) => {
      const notification = notifications.find(
        (item) => item.followRequestId === requestId
      );

      if (!notification) return;

      setFollowRequestActions((current) => {
        const updated = { ...current };
        delete updated[notification.id];
        return updated;
      });
    },
  });

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

  if (isLoadingUser) {
    return <p>Checking session...</p>;
  }

  if (isAuthError || !user) {
    return <NotLogged />;
  }

  if (isError) {
    return <p>Failed to load notifications.</p>;
  }

  return (
    <main className="notification-lay">
      {isLoading && <p>Loading notifications...</p>}

      <div className="notification-list">
        {!isLoading && notifications.length === 0 && (
          <Empty />
        )}

        {notifications.map((notification) => {
          const isFollowRequest =
            notification.type === "FOLLOW_REQUEST";

          const localAction =
            followRequestActions[notification.id];

          const status =
            localAction ?? notification.followRequestStatus;

          const isPending = status === "PENDING";

          const isAccepting =
            acceptMutation.isPending &&
            acceptMutation.variables === notification.followRequestId;

          const isRejecting =
            rejectMutation.isPending &&
            rejectMutation.variables === notification.followRequestId;

          return (
            <div
              className="notification-box"
              key={notification.id}
            >
              <div className="notification-data">
                <div className="notification-data-lay-l">
                  <div className="img-noti-box">
                    <div
                      className={
                        notificationIconClasses[notification.type]
                      }
                    >
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
                      {notification.senderName + notification.content}
                    </p>

                    <p className="notification-date">
                      {formatTime(notification.createdAt)}
                    </p>

                    {isFollowRequest && (
                      <div className="follow-request-actions">
                        {isPending ? (
                          <>
                            <button
                              className="follow-request-confirm"
                              disabled={isAccepting || isRejecting}
                              onClick={() =>
                                acceptMutation.mutate(
                                  notification.followRequestId
                                )
                              }
                            >
                              {isAccepting
                                ? "Accepting..."
                                : "Confirm"}
                            </button>

                            <button
                              className="follow-request-reject"
                              disabled={isAccepting || isRejecting}
                              onClick={() =>
                                rejectMutation.mutate(
                                  notification.followRequestId
                                )
                              }
                            >
                              {isRejecting
                                ? "Rejecting..."
                                : "Reject"}
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
                    <img
                      className="notification-post"
                      src={notification.post.imageUrl}
                      alt=""
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isFetchingNextPage && (
        <p>Loading more notifications...</p>
      )}

      <div
        ref={sentinelRef}
        style={{ height: "10px" }}
      />
    </main>
  );
}

export default Notifications;