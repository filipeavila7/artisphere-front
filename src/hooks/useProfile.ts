import { useQuery } from "@tanstack/react-query";
import { myProfile } from "../service/profile/ProfileService";

export function useProfile(userId: number) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => myProfile,
    enabled: !!userId,
  });
}