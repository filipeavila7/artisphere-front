import { useMutation } from "@tanstack/react-query";
import { login } from "../service/auth/AuthService";
import { useToast } from "./useToast";
import axios from "axios";
import { useNavigate } from "react-router-dom";


// Quando alguém executar essa mutation, chame a função login
export function useLogin() {
    const { showToast } = useToast();
    const navigate = useNavigate();

    
    return useMutation({
        mutationFn: login,

        // guarda o token da resposta 
        onSuccess: (data) => {
            localStorage.setItem("accessToken", data.accessToken);

            navigate("/") // navega pro feed
        },

        onError: (error) => {
            if (axios.isAxiosError(error)) {
                showToast(
                    "error",
                    error.response?.data?.message ?? "Erro ao realizar login"
                );
            }
        }
    })
}