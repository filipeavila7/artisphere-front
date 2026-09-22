import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { FaCog, FaUserFriends } from "react-icons/fa";
import { FaUserCheck } from "react-icons/fa6";
import { IoIosDocument, IoIosShareAlt } from "react-icons/io";

import NotLogged from "../../components/auth/NotLogged";
import ConfirmationModal from "../../components/modal/ConfirmationModal";

import { useMe } from "../../hooks/useMe";
import { useOtherProfile } from "../../hooks/useProfile";

import {
  followUser,
  unfollowUser,
} from "../../service/follow/FollowService";

import { openConversation } from "../../service/conversation/ConversationService";

import { formatePfpL } from "../../utils/formateImgProfile";

import "../../styles/profile.css";
import UserPosts from "../../components/post/UserPosts";

type ProfileTab = "posts";

function Profile() {
  const { userName } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab] = useState<ProfileTab>("posts");
  const [isUnfollowModalOpen, setIsUnfollowModalOpen] = useState(false);

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

  if (isLoadingUser) {
    return <p>Carregando usuário...</p>;
  }

  if (isUserError || !user) {
    return <NotLogged />;
  }

  if (isLoadingProfile) {
    return <p>Carregando perfil...</p>;
  }

  if (isErrorProfile || !profile) {
    return <p>Erro ao carregar perfil.</p>;
  }

  const isMyProfile = profile.userName === user.userName;

  return (
    <div className="profile-lay">
      <div className="profile-box">

        <div className="profile-content">

          <div className="profile-pfp-box">
            <img
              className="profile-pfp"
              src={formatePfpL(profile.imageUrlProfile)}
              alt=""
            />
          </div>

          <div className="profile-data-box">

            <div className="profile-data">
              <h1>{profile.name}</h1>
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

            <div className="username-lay">

              <div className="username-box">
                <p>@{profile.userName}</p>
              </div>

              <div className="username-box">
                <p>
                  Share profile{" "}
                  <IoIosShareAlt className="share-icon" />
                </p>
              </div>

            </div>

          </div>
        </div>

        <div className="profile-actions">

          {!isMyProfile && (
            <button
              className="btn-profile"
              onClick={handleMessage}
              disabled={messageMutation.isPending}
            >
              {messageMutation.isPending ? "Opening..." : "Message"}
            </button>
          )}

          {isMyProfile ? (
            <button className="btn-profile">
              You
            </button>
          ) : profile.amIfollowing ? (
            <button
              className="btn-profile-following"
              onClick={handleUnfollow}
              disabled={unfollowMutation.isPending}
            >
              Following
            </button>
          ) : (
            <button
              className="btn-profile"
              onClick={handleFollow}
              disabled={followMutation.isPending}
            >
              Follow
            </button>
          )}

          <div className="profile-config">
            <FaCog className="pfp-cog" />
          </div>

        </div>

      </div>

      <p className="bio">{profile.bio}</p>

      <div className="profile-tab-content">
        {activeTab === "posts" && (
          <UserPosts userName={profile.userName} />
        )}
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