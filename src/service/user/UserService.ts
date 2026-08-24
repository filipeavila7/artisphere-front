import api from "../../api/api";
import type { UserResponse } from "../../types/user/UserResponse";


// função para retornar os dados do usuario logado
export async function getMe(): Promise<UserResponse> {
    const response = await api.get("/users/me");

    return response.data;
}