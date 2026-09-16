import { useQuery } from "@tanstack/react-query";
import { myProfile, GetUserProfile } from "../service/profile/ProfileService";

export function useProfile() {
    return useQuery({
        queryKey: ["my-profile"],
        queryFn: myProfile,
    });
}

export function useOtherProfile(userName?: string) {
    return useQuery({
        queryKey: ["profile", userName],
        queryFn: () => GetUserProfile(userName!),
        enabled: !!userName,
    });
}