import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMyProfile } from "../service/profile/ProfileService";

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateMyProfile,

        onSuccess: (updatedProfile) => {
            queryClient.setQueryData(
                ["my-profile"],
                updatedProfile
            );
        },

        onError: (error) => {
            console.log(error);
        },
    });
}