import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import Feed from "./pages/feed/Feed";
import Login from "./pages/auth/Login";
import Contacts from "./pages/conversation/Contacts";
import Notifications from "./pages/notifications/Notifications";

function AppRoutes() {
    return (
        <Routes>
            {/* Sem Sidebar */}
            <Route path="/login" element={<Login />} />

            {/* Com Sidebar */}
            <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to="/feed" replace />} />

                <Route path="feed" element={<Feed />} />
                <Route path="contatos" element={<Contacts />}/>
                <Route path="notifications" element={<Notifications />} />
                
                {/* Vamos adicionar as outras depois */}
                {/* 
                <Route path="perfil" element={<Perfil />} />
                <Route path="contatos" element={<Contatos />} />
                
                */}
            </Route>
        </Routes>
    );
}

export default AppRoutes;