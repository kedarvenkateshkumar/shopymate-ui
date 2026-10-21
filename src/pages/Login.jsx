import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRoleFromToken } from "../services/jwt";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!username.trim() || !password) {
            setError("Please enter your username and password.");
            return;
        }

        try {
            setLoading(true);

            // AuthContext calls authService.login().
            // The service sends username, password and role: "USER".
            const token = await login(username.trim(), password);

            // Read the actual role returned in the JWT.
            const role = getRoleFromToken(token);

            if (role === "ADMIN") {
                navigate("/admin", { replace: true });
            } else if (role === "USER") {
                navigate("/products", { replace: true });
            } else {
                setError("Unable to determine your account role.");
            }
        } catch (err) {
            setError(err.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <aside className="auth-side">
                    <h2>Login</h2>
                    <p>Get access to your Orders, Cart and Recommendations</p>
                </aside>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <p className="error-message" role="alert">
                            {error}
                        </p>
                    )}

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-buy" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <p className="auth-alt">
                        New to E-Commerce?{" "}
                        <Link to="/register">Create an account</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;
