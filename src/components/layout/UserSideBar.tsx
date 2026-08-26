import { IoSettingsOutline } from "react-icons/io5";
import { useMe } from "../../hooks/useMe";
import "../../styles/side-bar.css"

function UserSideBar() {
    const { data: user, isLoading, error } = useMe();

    if (isLoading) {
        return <p>Carregando...</p>;
    }

    if (error) {
        return (
            <div className="user-side-box-error">
                <p>You are not logged in.</p>

                <a href="/login">
                    Login
                </a>
            </div>
        );
    }

    return (
        <div className="user-side-box">
            <div className="user-side-lay">
                <img className="user-side-img" src={user?.profileImageUrl} />
                <div className="user-data-box">
                    <p className="side-name">{user?.name}</p>
                    <span>@{user?.userName}</span>
                </div>
            </div>

            <div className="side-cog-box">
                <IoSettingsOutline className="cog-side" />
            </div>
        </div>
    );

}

export default UserSideBar