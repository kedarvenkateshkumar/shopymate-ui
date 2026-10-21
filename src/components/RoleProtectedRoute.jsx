import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleProtectedRoute({ children, requiredRole }) {
    const { isAuthenticated, role } = useAuth();

    // Not logged in
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Logged in, but does not have the required role
    if (role !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Authorized
    return children;
}

export default RoleProtectedRoute;
