import { useQuery } from "@tanstack/react-query";
import { myProfile } from "../service/profile/ProfileService";

export function useProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: myProfile,
  });
}