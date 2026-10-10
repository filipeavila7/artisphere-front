import { Link, NavLink, useNavigate } from "react-router-dom";
import "../../styles/side-bar.css";
import { AiOutlineHome } from "react-icons/ai";
import { IoSettingsOutline, IoNotificationsOutline } from "react-icons/io5";
import { FaPlus, FaRegMessage } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa";
import UserSideBar from "./UserSideBar";

import logo from "../../assets/logo.png";

const links = [
    { to: "/feed", label: "Feed", icon: <AiOutlineHome /> },
    { to: "/contacts", label: "Messages", icon: <FaRegMessage /> },
    { to: "/notifications", label: "Notifications", icon: <IoNotificationsOutline /> },
    { to: "/profile", label: "Profile", icon: <FaRegUser /> },
    { to: "/settings", label: "Settings", icon: <IoSettingsOutline /> },
];

function Sidebar() {
    const navigate = useNavigate();

    return (
        <aside className="sidebar">
            <div className="side-title-box">
                <Link to="/feed" className="side-brand">
                    <img src={logo} alt="" className="side-brand-logo" />
                    <h2 className="side-brand-name">Artisphere</h2>
                </Link>
            </div>

            <div className="side-box">
                <nav className="side-nav">
                    <div className="side-btn-box">
                        <button
                            type="button"
                            className="side-new-btn"
                            onClick={() => navigate("/new")}
                        >
                            <FaPlus className="side-new-icon" />
                            <span className="side-label">New post</span>
                        </button>
                    </div>

                    {links.map((link, index) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            title={link.label}
                            style={{ "--i": index } as React.CSSProperties}
                            className={({ isActive }) =>
                                isActive ? "side-link active" : "side-link"
                            }
                        >
                            <span className="side-icon">{link.icon}</span>
                            <span className="side-label">{link.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <UserSideBar />
            </div>
        </aside>
    );
}

export default Sidebar;