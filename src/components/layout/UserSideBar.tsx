import { useMe } from "../../hooks/useMe";


function UserSideBar() {
    const { data: user, isLoading, error } = useMe();

    if (isLoading) {
        return <p>Carregando...</p>;
    }

    if (error) {
        return (
            <div className="user-side-box">
                <p>Você não está logado.</p>

                <a href="/login">
                    Fazer login
                </a>
            </div>
        );
    }

    return (
       <div className="user-side-box">
            <img src={user?.profileImageUrl} />
            <span>{user?.userName}</span>
        </div>
    );
    
}

export default UserSideBar