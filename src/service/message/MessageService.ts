import api from "../../api/api";
import type { PageResponse } from "../../types/page/PageResponse";
import type { MessageResponse, UnreadCountResponse } from "../../types/message/MessageResponse";

export async function getMessages(conversationId: number, page: number, size = 50): Promise<PageResponse<MessageResponse>> {
  const { data } = await api.get<PageResponse<MessageResponse>>(`/messages/${conversationId}/messages`, {
    params: { page, size, sort: "createdAt,desc" },
  });
  return data;
}

export async function sendMessage(
  receiverId: number,
  textMessage: string
): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>(
    `/messages/${receiverId}`,
    { textMessage }
  );

  return data;
}

export async function markConversationAsRead(conversationId: number): Promise<void> {
  await api.post(`/messages/conversation/${conversationId}/read`);
}

export async function getUnreadConversationCounts(): Promise<UnreadCountResponse[]> {
  const { data } = await api.get<UnreadCountResponse[]>("/messages/conversations/unread");
  return data;
}
