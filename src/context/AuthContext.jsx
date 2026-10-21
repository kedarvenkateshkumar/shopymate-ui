import {
    createContext,
    useContext,
    useState
} from "react";

import { getRoleFromToken } from "../services/jwt";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(
        () => localStorage.getItem("token")
    );

    // Extract role from the current JWT
    const role = getRoleFromToken(token);

    async function login(username, password, role) {
        const newToken = await authService.login(
            username,
            password,
            role
        );

        setToken(newToken);
        return newToken;
    }

    function logout() {
        authService.logout();
        setToken(null);
    }

    return (
        <AuthContext.Provider
            value={{
                token,
                role,
                isAuthenticated: Boolean(token),
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
