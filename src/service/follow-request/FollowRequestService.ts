import api from "../../api/api";

export async function acceptFollowRequest(
    requestId: number
): Promise<void> {
    await api.post(`/follow-request/${requestId}/accept`);
}

export async function rejectFollowRequest(
    requestId: number
): Promise<void> {
    await api.post(`/follow-request/${requestId}/reject`);
}