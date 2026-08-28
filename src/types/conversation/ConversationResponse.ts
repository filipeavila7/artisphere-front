export interface ConversationResponse {
    conversationId: number;
    otherUserId: number;
    otherUserName: string;
    otherUserPhoto: string;
    lastMessage: string;
    lastMessageAt: string;
}