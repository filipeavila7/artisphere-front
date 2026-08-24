import { useMe } from "../../hooks/useMe";
import "../../styles/side-bar.css"

function UserSideBar() {
    const { data: user, isLoading, error } = useMe();

    if (isLoading) {
        return <p>Carregando...</p>;
    }

    if (error) {
        return (
            <div className="user-side-box">
                <p>You are not logged in.</p>

                <a href="/login">
                    Login
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