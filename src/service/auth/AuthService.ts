import api from "../../api/api";
import type { LoginRequest } from "../../types/auth/LoginRequest";
import type { LoginResponse } from "../../types/auth/LoginResponse";



// retorna login response e recebe login request
export async function login(data : LoginRequest) : Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("auth/login", data)

    return response.data
}