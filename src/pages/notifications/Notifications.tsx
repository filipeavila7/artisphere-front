import { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";


import { formatTime } from "../../utils/formateData";
import { useMe } from "../../hooks/useMe";

import {
  FaHeart,
  FaUserPlus,
  FaEnvelope,
  FaCheck,
  FaReply,
  FaComment,
} from "react-icons/fa";

import type { NotificationType } from "../../types/notifications/NotificationGetResponse";

import "../../styles/notifications.css";
import { getNotification } from "../../service/notifications/NotificationService";
import NotLogged from "../../components/auth/NotLogged";
import { formatePfpL } from "../../utils/formateImgProfile";

const PAGE_SIZE = 20;

const notificationIconClasses: Record<NotificationType, string> = {
  COMMENT: "notification-icon comment",
  LIKE: "notification-icon like",
  FOLLOW: "notification-icon follow",
  MESSAGE: "notification-icon message",
  READ: "notification-icon read",
  REPLY: "notification-icon reply",
};

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  COMMENT: <FaComment />,
  LIKE: <FaHeart />,
  FOLLOW: <FaUserPlus />,
  MESSAGE: <FaEnvelope />,
  READ: <FaCheck />,
  REPLY: <FaReply />,
};

function Notifications() {
  const sentinelRef = useRef<HTMLDivElement>(null);

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
    return <NotLogged />
  }

  if (isError) {
    return <p>Failed to load notifications.</p>;
  }

  return (
    <main className="notification-lay">

      {isLoading && (
        <p>Loading notifications...</p>
      )}

      <div className="notification-list">
        {notifications.map((notification) => (
          <div
            className="notification-box"
            key={notification.id}
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
                  <p className="notification-content"> {notification.content}</p>
                  <p className="notification-date">
                    {formatTime(notification.createdAt)}
                  </p>
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
        ))}
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