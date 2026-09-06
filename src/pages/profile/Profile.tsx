import { useState } from "react";
import NotLogged from "../../components/auth/NotLogged";
import { useMe } from "../../hooks/useMe";
import { useProfile } from "../../hooks/useProfile";
import { FaCog, FaEdit, FaUserFriends } from "react-icons/fa";
import { FaBookmark, FaHeart, FaPlus, FaRegHeart, FaUserCheck } from "react-icons/fa6";

import "../../styles/profile.css";
import { IoIosDocument, IoIosShareAlt } from "react-icons/io";
import MyPosts from "../../components/post/MyPosts";
import { formatePfpL } from "../../utils/formateImgProfile";

type ProfileTab = "posts" | "liked" | "saved";

function Profile() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");

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

            <div className="pfp-new">
              <FaPlus />
            </div>
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
          <button className="btn-profile">
            <FaEdit /> Edit profile
          </button>

          <div className="profile-config">
            <FaCog className="pfp-cog" />
          </div>
        </div>

      </div>

      <p className="bio">{profile.bio}</p>

      <div className="profile-tabs">
        <button
          className={activeTab === "posts" ? "active" : ""}
          onClick={() => setActiveTab("posts")}
        >
          <IoIosDocument />
          Posts
        </button>

        <button
          className={activeTab === "liked" ? "active" : ""}
          onClick={() => setActiveTab("liked")}
        >
          <FaHeart />
          Liked
        </button>

        <button
          className={activeTab === "saved" ? "active" : ""}
          onClick={() => setActiveTab("saved")}
        >
          <FaBookmark />
          Saved
        </button>
      </div>

      <div className="profile-tab-content">
        {activeTab === "posts" && <MyPosts />}

        {/* Adicionar os outros componentes aqui */}
        {/* {activeTab === "liked" && <LikedPosts />} */}
        {/* {activeTab === "saved" && <SavedPosts />} */}
      </div>
    </div>
  );
}

export default Profile;