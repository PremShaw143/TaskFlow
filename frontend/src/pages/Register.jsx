import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const cleanName = name.trim();
        const cleanEmail = email.trim();

        if (
            !cleanName ||
            !cleanEmail ||
            !password ||
            !confirmPassword
        ) {
            setError("All fields are required.");
            return;
        }

        if (cleanName.length < 2) {
            setError("Name must be at least 2 characters.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            await register(
                cleanName,
                cleanEmail,
                password
            );

            setSuccess(
                "Registration successful. Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (error) {
            setError(
                error?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card register-card">

                <div className="auth-brand">
                    <div className="auth-brand-icon">
                        ✓
                    </div>

                    <div>
                        <h1>TaskFlow</h1>
                        <p>
                            Plan. Collaborate. Complete.
                        </p>
                    </div>
                </div>

                <div className="auth-heading">
                    <h2>Create Account</h2>

                    <p>
                        Start managing your projects with
                        TaskFlow.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                >

                    <div className="form-group">
                        <label htmlFor="register-name">
                            Full Name
                        </label>

                        <input
                            id="register-name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="Enter your name"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-email">
                            Email Address
                        </label>

                        <input
                            id="register-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="you@example.com"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-password">
                            Password
                        </label>

                        <input
                            id="register-password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Minimum 8 characters"
                            disabled={loading}
                        />

                        <span className="field-hint">
                            Use at least 8 characters.
                        </span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-confirm-password">
                            Confirm Password
                        </label>

                        <input
                            id="register-confirm-password"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Re-enter your password"
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div
                            className="auth-alert auth-alert-error"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    {success && (
                        <div
                            className="auth-alert auth-alert-success"
                            role="status"
                        >
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-submit-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating account..."
                            : "Create Account"}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>
                        Already have an account?
                    </span>{" "}

                    <Link to="/login">
                        Sign in
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default Register;