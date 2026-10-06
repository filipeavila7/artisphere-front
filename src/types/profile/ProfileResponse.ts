export interface ProfileResponse {
  userId: number;
  name: string;
  bio: string;
  imageUrlProfile: string;
  messageStatus: string;
  userName: string;
  followCount : number;
  followerCount: number;
  postCount : number;
  amIfollowing : boolean;
  isPrivateProfile : boolean; 
  followRequestStatus: "PENDING" | "ACCEPTED" | "REJECTED" | null;
  hasStory : boolean;
  hasUnviewedStory: boolean;
  hasUnviewedCloseFriendsStory : boolean;
}