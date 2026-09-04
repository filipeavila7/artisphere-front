import NotLogged from "../../components/auth/NotLogged";
import { useMe } from "../../hooks/useMe";
import { useProfile } from "../../hooks/useProfile";
import { FaUserFriends } from "react-icons/fa";
import { FaUserCheck } from "react-icons/fa6";

import "../../styles/profile.css"
import { IoDocumentTextOutline } from "react-icons/io5";

function Profile() {
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
            <img className="profile-pfp" src={profile.imageUrlProfile} alt="" />
          </div>

          <div className="profile-data-box">
            <div className="profile-data">
              <h1 >{profile.name}</h1>
             
            </div>

            <div className="follow-data-box">
              <div>
                <div className="follow-content">
                    <IoDocumentTextOutline /> <p>{profile.postCount}</p>
                </div>
                  Posts
              </div>

              <div>
                <div className="follow-content">
                    <FaUserFriends /> <p>{profile.followerCount}</p>
                </div>
                  Followers
              </div>


              <div>
                <div className="follow-content">
                    <IoDocumentTextOutline /> <p>{profile.followCount}</p>
                </div>
                  Follows
              </div>
              
            </div>


          </div>

          
        </div>

          oi

      </div>
      <p>{profile.bio}</p>
    </div>
  );
}

export default Profile;