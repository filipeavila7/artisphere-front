import { Link } from "react-router-dom";
import { IoSettingsOutline } from "react-icons/io5";
import { useMe } from "../../hooks/useMe";
import "../../styles/side-bar.css";
import { formatePfpL } from "../../utils/formateImgProfile";

function UserSideBar() {
    const { data: user, isLoading, error } = useMe();

    if (isLoading) {
        return (
            <div className="user-side-box skeleton" aria-hidden="true">
                <div className="user-side-lay">
                    <div className="skeleton-circle" />
                    <div className="user-data-box">
                        <div className="skeleton-line" />
                        <div className="skeleton-line short" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-side-box-error">
                <p>You are not logged in.</p>

                <Link to="/login" className="side-login-link">
                    Login
                </Link>
            </div>
        );
    }

    return (
        <div className="user-side-box">
            <div className="user-side-lay">
                <img
                    className="user-side-img"
                    src={formatePfpL(user?.profileImageUrl)}
                    alt={user?.name ?? ""}
                />

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

export default UserSideBar;