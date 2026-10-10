import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { FaCheck, FaCog, FaUserFriends } from "react-icons/fa";
import { FaUserCheck } from "react-icons/fa6";
import { IoIosDocument, IoIosShareAlt } from "react-icons/io";

import NotLogged from "../../components/auth/NotLogged";
import ConfirmationModal from "../../components/modal/ConfirmationModal";

import { useMe } from "../../hooks/useMe";
import { useOtherProfile } from "../../hooks/useProfile";

import { followUser, unfollowUser } from "../../service/follow/FollowService";
import { openConversation } from "../../service/conversation/ConversationService";

import "../../styles/profile.css";
import UserPosts from "../../components/post/UserPosts";
import PrivateProfile from "../../components/post/PrivateProfile";
import StoryAvatar from "../../components/story/StoryAvatar";
import Loading from "../../components/layout/Loading";

type ProfileTab = "posts";

function Profile() {
  const { userName } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab] = useState<ProfileTab>("posts");
  const [isUnfollowModalOpen, setIsUnfollowModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isUserError,
  } = useMe();

  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: isErrorProfile,
  } = useOtherProfile(userName);

  const followMutation = useMutation({
    mutationFn: () => followUser(profile!.userId),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["profile", profile?.userName],
      });

      void queryClient.invalidateQueries({
        queryKey: ["my-profile"],
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUser(profile!.userId),

    onSuccess: () => {
      setIsUnfollowModalOpen(false);

      void queryClient.invalidateQueries({
        queryKey: ["profile", profile?.userName],
      });

      void queryClient.invalidateQueries({
        queryKey: ["my-profile"],
      });
    },
  });

  const messageMutation = useMutation({
    mutationFn: () => openConversation(profile!.userId),

    onSuccess: (conversation) => {
      navigate(`/messages/${conversation.conversationId}`);
    },
  });

  const handleFollow = () => {
    if (!profile) return;

    followMutation.mutate();
  };

  const handleUnfollow = () => {
    if (!profile) return;

    setIsUnfollowModalOpen(true);
  };

  const handleConfirmUnfollow = () => {
    if (!profile) return;

    unfollowMutation.mutate();
  };

  const handleMessage = () => {
    if (!profile) return;

    navigate(`/messages/new/${profile.userName}`);
  };

  const handleShare = async () => {
    if (!profile) return;

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/user/${encodeURIComponent(profile.userName)}`
      );

      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar link do perfil:", error);
    }
  };

  if (isLoadingUser) {
    return <Loading />;
  }

  if (isUserError || !user) {
    return <NotLogged />;
  }

  if (isLoadingProfile) {
    return <Loading />;
  }

  if (isErrorProfile || !profile) {
    return <p>Erro ao carregar perfil.</p>;
  }

  const isMyProfile = profile.userName === user.userName;

  const canSeePosts =
    !profile.isPrivateProfile || isMyProfile || profile.amIfollowing;

  return (
    <div className="profile-lay">
      <div className="profile-box">
        <div className="profile-cover" />

        <div className="profile-main">
          <div className="profile-content">
            <div className="profile-pfp-box">
              <StoryAvatar
                imageUrl={profile.imageUrlProfile}
                userName={profile.userName}
                hasStory={profile.hasStory}
                hasUnviewedStory={profile.hasUnviewedStory}
                hasUnviewedCloseFriendsStory={profile.hasUnviewedCloseFriendsStory}
                size={170}
              />
            </div>

            <div className="profile-data-box">
              <div className="profile-data">
                <h1>{profile.name}</h1>
              </div>

              <div className="username-lay">
                <div className="username-box static">
                  <p>@{profile.userName}</p>
                </div>

                <button
                  type="button"
                  className={`username-box ${copied ? "copied" : ""}`}
                  onClick={handleShare}
                >
                  {copied ? (
                    <>
                      Link copied <FaCheck className="share-icon" />
                    </>
                  ) : (
                    <>
                      Share profile <IoIosShareAlt className="share-icon" />
                    </>
                  )}
                </button>
              </div>

              <div className="follow-data-box">
                <div>
                  <div className="follow-content">
                    <IoIosDocument className="profile-icon" />
                    <p>{profile.postCount}</p>
                  </div>

                  <p className="follow-p">Posts</p>
                </div>

                <div>
                  <div className="follow-content">
                    <FaUserFriends className="profile-icon" />
                    <p>{profile.followerCount}</p>
                  </div>

                  <p className="follow-p">Followers</p>
                </div>

                <div>
                  <div className="follow-content">
                    <FaUserCheck className="profile-icon" />
                    <p>{profile.followCount}</p>
                  </div>

                  <p className="follow-p">Follows</p>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            {!isMyProfile && (
              <button
                className="btn-profile outline"
                onClick={handleMessage}
                disabled={messageMutation.isPending}
              >
                {messageMutation.isPending ? "Opening..." : "Message"}
              </button>
            )}

            {isMyProfile ? (
              <button className="btn-profile outline">You</button>
            ) : profile.amIfollowing ? (
              <button
                className="btn-profile-following"
                onClick={handleUnfollow}
                disabled={unfollowMutation.isPending}
              >
                Following
              </button>
            ) : profile.followRequestStatus === "PENDING" ? (
              <button className="btn-profile outline" disabled>
                Requested
              </button>
            ) : (
              <button
                className="btn-profile"
                onClick={handleFollow}
                disabled={followMutation.isPending}
              >
                {followMutation.isPending ? "Following..." : "Follow"}
              </button>
            )}

            <div className="profile-config">
              <FaCog className="pfp-cog" />
            </div>
          </div>
        </div>

        {profile.bio && (
          <div className="bio-box">
            <p className="bio">{profile.bio}</p>
          </div>
        )}
      </div>

      <div className="profile-tab-content" key={activeTab}>
        {activeTab === "posts" &&
          (canSeePosts ? (
            <UserPosts
              userName={profile.userName}
              canSeePosts={canSeePosts}
            />
          ) : (
            <PrivateProfile />
          ))}
      </div>

      <ConfirmationModal
        isOpen={isUnfollowModalOpen}
        title="Unfollow user?"
        message={`Are you sure you want to unfollow @${profile.userName}?`}
        confirmText="Unfollow"
        cancelText="Cancel"
        isLoading={unfollowMutation.isPending}
        onConfirm={handleConfirmUnfollow}
        onCancel={() => setIsUnfollowModalOpen(false)}
      />
    </div>
  );
}

export default Profile;