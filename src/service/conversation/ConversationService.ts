import api from "../../api/api";
import type { ConversationResponse } from "../../types/conversation/ConversationResponse";
import type { PageResponse } from "../../types/page/PageResponse";

// pegar as conversar do usuario logado
export async function getConversations(
    page : number,
    size : number
):Promise<PageResponse<ConversationResponse>> {
    const response = await api.get<PageResponse<ConversationResponse>>(
        "/conversation/my", 
        {
            params: { page, size }, // passa pagina e tamanho da pagina nos parametros
        }
    )

    return response.data

}


// criar conversa com novos usuarios
export async function openConversation(
    otherUserId: number
): Promise<ConversationResponse> {

    const response = await api.post<ConversationResponse>(
        `/conversation/new/${otherUserId}`
    );

    return response.data;
}