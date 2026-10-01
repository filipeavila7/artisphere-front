import api from "../../api/api";
import type { CloseFriendsRequest } from "../../types/close-friends/CloseFriendsRequest";
import type { CloseFriendsResponse } from "../../types/close-friends/CloseFriendsResponse";
import type { PageResponse } from "../../types/page/PageResponse";

export async function getMyCloseFriends(
  page = 0,
  size = 20
): Promise<PageResponse<CloseFriendsResponse>> {
  const response = await api.get("/close-friends", {
    params: {
      page,
      size,
    },
  });

  return response.data;
}

export async function addUsersInCloseFriends(
  request: CloseFriendsRequest
): Promise<CloseFriendsResponse[]> {
  const response = await api.post("/close-friends", request);

  return response.data;
}

export async function removeUsersFromCloseFriends(
  request: CloseFriendsRequest
): Promise<CloseFriendsResponse[]> {
  const response = await api.delete("/close-friends", {
    data: request,
  });

  return response.data;
}