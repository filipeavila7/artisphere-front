import api from "../../api/api";
import type { RegisterSuggestions } from "../../types/user/RegisterSuggestions";
import type { UserRequest } from "../../types/user/UserRequest";
import type { UserResponse } from "../../types/user/UserResponse";


// função para retornar os dados do usuario logado
export async function getMe(): Promise<UserResponse> {
  const response = await api.get("/users/me");

  return response.data;
}

// criar usuario
export async function createUser(request: UserRequest): Promise<void> {
  await api.post("/users/new", request);
}


export async function validateUsername(
  userName: string
): Promise<RegisterSuggestions> {
  const response = await api.get<RegisterSuggestions>(
    "/users/validate-username",
    {
      params: { userName },
    }
  );

  return response.data;
}

export async function validateEmail(
  email: string
): Promise<RegisterSuggestions> {
  const response = await api.get<RegisterSuggestions>(
    "/users/validate-email",
    {
      params: { email },
    }
  );

  return response.data;
}