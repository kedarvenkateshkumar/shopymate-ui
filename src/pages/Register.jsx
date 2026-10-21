import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";

function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            await register(username, password);

            console.log("Registration success");
            setMessage("Registration successful!");

            navigate("/login");
        } catch (error) {
            console.error("Registration error:", error);
            setMessage(error.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <aside className="auth-side">
                    <h2>Looks like you're new here!</h2>
                    <p>Sign up with a username and password to get started</p>
                </aside>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="reg-username">Username</label>
                        <input
                            id="reg-username"
                            type="text"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-password">Password</label>
                        <input
                            id="reg-password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-buy" disabled={loading}>
                        {loading ? "Registering..." : "Continue"}
                    </button>

                    {message && <p className="error-message">{message}</p>}

                    <p className="auth-alt">
                        Existing user? <Link to="/login">Log in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Register;
