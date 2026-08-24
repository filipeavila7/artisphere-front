import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";

function AppLayout() {
    return (
        <div className="app-layout">
            <Sidebar />

            <main className="app-box">
                <NavBar />
                <div className="app-content">
                    <Outlet />
                </div>

            </main>
        </div>
    );
}

export default AppLayout;