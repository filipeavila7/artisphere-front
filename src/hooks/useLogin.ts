import { useMutation } from "@tanstack/react-query";
import { login } from "../service/auth/AuthService";


// Quando alguém executar essa mutation, chame a função login
export function useLogin(){
    return useMutation({
        mutationFn: login
    })
}