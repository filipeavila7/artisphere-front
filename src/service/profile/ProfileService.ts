import api from "../../api/api";
import type { ProfileResponse } from "../../types/profile/ProfileResponse";
import type { ProfileUpdateRequest } from "../../types/profile/ProfileUpdateRequest";


export async function myProfile() : Promise<ProfileResponse> {
    const response = await api<ProfileResponse>("/profiles/me")
    
    return response.data
}


export async function GetUserProfile(userName : string) : Promise<ProfileResponse> {
    const response = await api<ProfileResponse>(`/profiles/user/${userName}`)
    
    return response.data
}


export async function updateMyProfile(
    request: ProfileUpdateRequest
): Promise<ProfileResponse> {
    const response = await api.put("/profiles/me", request);
    return response.data;
}