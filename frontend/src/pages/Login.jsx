import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        try {
            setLoading(true);

            await login(email, password);

            navigate("/dashboard");
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">

            {/* LEFT SIDE */}
            <div className="login-brand">

                <div className="brand-content">

                    <div className="brand-logo">
                        ✓
                    </div>

                    <h1>TaskFlow</h1>

                    <h2>
                        Manage your work.<br />
                        Stay in flow.
                    </h2>

                    <p>
                        A simple collaborative workspace to organize
                        projects, manage tasks, and work together with your team.
                    </p>

                    <div className="feature-list">

                        <div className="feature-item">
                            <span>✓</span>

                            <div>
                                <strong>Organize Projects</strong>
                                <small>
                                    Keep all your work in one place.
                                </small>
                            </div>
                        </div>

                        <div className="feature-item">
                            <span>✓</span>

                            <div>
                                <strong>Track Tasks</strong>
                                <small>
                                    Know what needs to be done next.
                                </small>
                            </div>
                        </div>

                        <div className="feature-item">
                            <span>✓</span>

                            <div>
                                <strong>Collaborate</strong>
                                <small>
                                    Work together with your team.
                                </small>
                            </div>
                        </div>

                    </div>

                </div>

                <div className="decorative-circle circle-one"></div>
                <div className="decorative-circle circle-two"></div>

            </div>

            {/* RIGHT SIDE */}
            <div className="login-form-section">

                <div className="login-card">

                    <div className="mobile-logo">

                        <div className="brand-logo">
                            ✓
                        </div>

                        <h1>TaskFlow</h1>

                    </div>

                    <h2>Welcome back</h2>

                    <p className="login-subtitle">
                        Login to continue to your workspace.
                    </p>

                    <form onSubmit={handleSubmit}>

                        <label htmlFor="login-email">
                            Email
                        </label>

                        <input
                            id="login-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="Enter your email"
                        />

                        <label htmlFor="login-password">
                            Password
                        </label>

                        <input
                            id="login-password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Enter your password"
                        />

                        {error && (
                            <p className="error-message">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Logging in..."
                                : "Login"}
                        </button>

                    </form>

                    <p className="register-link">
                        Don't have an account?{" "}
                        <Link to="/register">
                            Create an account
                        </Link>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;