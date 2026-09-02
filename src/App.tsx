import {
    createBrowserRouter,
    Navigate,
    Outlet,
    ScrollRestoration,
} from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import Feed from "./pages/feed/Feed";
import Login from "./pages/auth/Login";
import Contacts from "./pages/conversation/Contacts";
import Notifications from "./pages/notifications/Notifications";

function RootLayout() {
    return (
        <>
            <Outlet />
            <ScrollRestoration
                // Reopening a route from the sidebar creates a new history key.
                // The pathname keeps one independent position for each route.
                getKey={(location) => location.pathname}
            />
        </>
    );
}

export const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            { path: "/login", element: <Login /> },
            {
                path: "/",
                element: <AppLayout />,
                children: [
                    { index: true, element: <Navigate to="/feed" replace /> },
                    { path: "feed", element: <Feed /> },
                    { path: "contatos", element: <Contacts /> },
                    { path: "notifications", element: <Notifications /> },
                ],
            },
        ],
    },
]);
