import { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";


import { formatTime } from "../../utils/formateData";
import { useMe } from "../../hooks/useMe";



import "../../styles/notifications.css";
import { getNotification } from "../../service/notifications/NotificationService";

const PAGE_SIZE = 20;

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
    return <p>You need to be logged in to view your notifications.</p>;
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

              {notification.senderPhoto && (
                <img
                  src={notification.senderPhoto}
                  alt={notification.senderName}
                  className="notification-pfp"
                />
              )}

              <div>
                <p className="notification-content">
                  {notification.content}
                </p>

                <p className="notification-date">
                  {formatTime(notification.createdAt)}
                </p>
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