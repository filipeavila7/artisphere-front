import { useState } from "react";
import { useNavigate } from "react-router-dom";

import NotLogged from "../../components/auth/NotLogged";
import { useMe } from "../../hooks/useMe";
import { useProfile } from "../../hooks/useProfile";
import { FaCheck, FaCog, FaEdit, FaUserFriends } from "react-icons/fa";
import { FaBookmark, FaHeart, FaPlus, FaUserCheck } from "react-icons/fa6";
import { IoIosDocument, IoIosShareAlt } from "react-icons/io";

import "../../styles/profile.css";

import MyPosts from "../../components/post/MyPosts";
import LikedPosts from "../../components/likes/LikedPosts";
import SavedPosts from "../../components/save/SavedPosts";
import StoryAvatar from "../../components/story/StoryAvatar";
import Loading from "../../components/layout/Loading";

type ProfileTab = "posts" | "liked" | "saved";

function Profile() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isUserError,
  } = useMe();

  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: isErrorProfile,
  } = useProfile();

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

  const handleShare = async () => {
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

              <button
                type="button"
                className="pfp-new"
                aria-label="Create story"
                title="Create story"
                onClick={() => navigate("/new/story")}
              >
                <FaPlus />
              </button>
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
            <button
              onClick={() => navigate("/profile/update")}
              className="btn-profile"
            >
              <FaEdit /> Edit profile
            </button>

            <div
              onClick={() => navigate("/profile/config")}
              className="profile-config"
            >
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

      <div className="profile-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "posts"}
          className={activeTab === "posts" ? "active" : ""}
          onClick={() => setActiveTab("posts")}
        >
          <IoIosDocument className="tab-icon" />
          Posts
        </button>

        <button
          role="tab"
          aria-selected={activeTab === "liked"}
          className={activeTab === "liked" ? "active" : ""}
          onClick={() => setActiveTab("liked")}
        >
          <FaHeart className="tab-icon" />
          Liked
        </button>

        <button
          role="tab"
          aria-selected={activeTab === "saved"}
          className={activeTab === "saved" ? "active" : ""}
          onClick={() => setActiveTab("saved")}
        >
          <FaBookmark className="tab-icon" />
          Saved
        </button>
      </div>

      <div className="profile-tab-content" key={activeTab}>
        {activeTab === "posts" && <MyPosts />}
        {activeTab === "liked" && <LikedPosts />}
        {activeTab === "saved" && <SavedPosts />}
      </div>
    </div>
  );
}

export default Profile;