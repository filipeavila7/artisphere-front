import { QueryClient } from "@tanstack/react-query";

// gerencia as queries da aplicação inteira: cache, refetch, tentativas, estado das requisições etc.
export const queryClient = new QueryClient({
    // configurações sejam padrão para todas as minhas queries.
    defaultOptions: {
        queries: {
            // O staleTime diz por quanto tempo os dados são considerados frescos (fresh).
            // evita fazer nova requisição enquanto os dados estao frescos 
            staleTime: 1000 * 60 * 10, 
            // Se uma requisição falhar, tente novamente uma vez.
            retry: 1,
        },
    },
});