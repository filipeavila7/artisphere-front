import api from "../../api/api";
import type { PageResponse } from "../../types/page/PageResponse";
import type { SaveResponse } from "../../types/save/SaveResponse";

export async function getMySavedPosts(
    page : number,
    size : number
) : Promise<PageResponse<SaveResponse>> {
    const response = await api.get<PageResponse<SaveResponse>>("/save",
        {
            params: { page, size }, // passa pagina e tamanho da pagina nos parametros
        }
    )

    console.log("SAVED POSTS:", response.data);

    return response.data
}