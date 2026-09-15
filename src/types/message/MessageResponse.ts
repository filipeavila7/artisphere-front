export interface MessageResponse {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderPhoto: string | null;
  content: string;
  createdAt: string;
  readAt: string | null;
}

export interface ConversationUpdateResponse {
  conversationId: number;
  lastMessage: string;
  lastMessageAt: string;
  senderId: number;
}

export interface UnreadCountResponse {
  conversationId: number;
  unreadCount: number;
}
