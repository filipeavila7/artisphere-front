import { useMe } from "../../hooks/useMe";
import { useProfile } from "../../hooks/useProfile";

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
    return <p>Erro ao carregar usuário.</p>;
  }

  if (isLoadingProfile) {
    return <p>Carregando perfil...</p>;
  }

  if (isErrorProfile || !profile) {
    return <p>Erro ao carregar perfil.</p>;
  }

  return (
    <div className="profile-lay">
      <div></div>
      <h1>{profile.name}</h1>
      <p>@{profile.userName}</p>
      <p>{profile.bio}</p>
      <p>{profile.postCount}</p>
    </div>
  );
}

export default Profile;