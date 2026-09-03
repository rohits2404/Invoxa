import { createBrowserRouter, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";

function ProtectedShell() {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-(--bg) text-(--ink-muted) text-sm">
                Loading...
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
    return <AppShell />;
}

export const router = createBrowserRouter([
    { path: "/", element: <Landing /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    {
        path: "/",
        element: <ProtectedShell />,
        children: [
            { path: "dashboard", element: <Dashboard /> },
            { path: "invoices", element: <Invoices /> },
        ],
    },
]);
