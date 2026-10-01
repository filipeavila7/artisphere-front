import { useInfiniteQuery } from "@tanstack/react-query";
import { getMyConnections } from "../service/follow/FollowService";

export function useMyConnections() {
    return useInfiniteQuery({
        queryKey: ["my-connections"],
        queryFn: ({ pageParam = 0 }) =>
            getMyConnections(pageParam, 20),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            if (lastPage.last) {
                return undefined;
            }

            return lastPage.number + 1;
        },
    });
}