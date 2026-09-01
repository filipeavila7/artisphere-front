import api from "../../api/api";
import type { NotificationGetResponse } from "../../types/notifications/NotificationGetResponse";
import type { PageResponse } from "../../types/page/PageResponse";


export async function getNotification(
    page : number,
    size : number
): Promise<PageResponse<NotificationGetResponse>> {
    const response = await api.get<PageResponse<NotificationGetResponse>>(
        "/notifications",
        {
            params: {page, size}
        }
    )
    return response.data
    
}