import { useQuery } from "@tanstack/react-query";
import { getMe } from "../service/user/UserService";

export function useMe(){
    return useQuery({
        queryKey: ["me"],
        queryFn : getMe,
        staleTime: 1000 * 60 * 5
    })
}