import { NavLink } from "react-router-dom";
import "../../styles/side-bar.css";
import { AiOutlineHome } from "react-icons/ai";
import { IoSettingsOutline } from "react-icons/io5";
import { FaRegMessage } from "react-icons/fa6";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import Button from "../button/Button";

function Sidebar() {
    return (
        <aside className="sidebar">

            <nav className="side-nav">
                <div className="side-btn-box">
                    <Button>New post</Button>
                </div>
                <div className="side-lay">
                    <NavLink
                        to="/feed"
                        className={({ isActive }) =>
                            isActive ? "side-link active" : "side-link"
                        }
                    >
                        <AiOutlineHome className="side-icon" />
                        Feed
                    </NavLink>
                </div>



                <div className="side-lay">
                    <NavLink
                        to="/contatos"
                        className={({ isActive }) =>
                            isActive ? "side-link active" : "side-link"
                        }
                    >
                        <FaRegMessage className="side-icon" />
                        Messages
                    </NavLink>
                </div>

                <div className="side-lay">
                    <NavLink
                        to="/notifications"
                        className={({ isActive }) =>
                            isActive ? "side-link active" : "side-link"
                        }
                    >
                        <IoNotificationsOutline className="side-icon-g" />
                        Notifications
                    </NavLink>
                </div>

                <div className="side-lay">
                    <NavLink
                        to="/perfil"
                        className={({ isActive }) =>
                            isActive ? "side-link active" : "side-link"
                        }
                    >
                        <FaRegUser className="side-icon" />
                        Profile
                    </NavLink>
                </div>

                <div className="side-lay">
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            isActive ? "side-link active" : "side-link"
                        }
                    >
                        <IoSettingsOutline className="side-icon" />
                        Settings
                    </NavLink>
                </div>

            </nav>
        </aside>
    );
}

export default Sidebar;