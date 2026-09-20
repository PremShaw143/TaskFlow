import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div className="app-layout">

            <aside className="sidebar">

                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">✓</div>
                    <span>TaskFlow</span>
                </div>

                <nav className="sidebar-nav">

                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        <span>▦</span>
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/projects"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        <span>▣</span>
                        Projects
                    </NavLink>

                    <NavLink
                        to="/assigned-to-me"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        <span>✓</span>
                        Assigned to Me
                    </NavLink>

                </nav>

                <div className="sidebar-bottom">

                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <strong>{user?.name}</strong>
                            <small>{user?.email}</small>
                        </div>
                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </aside>

            <main className="main-content">
                {children}
            </main>

        </div>
    );
}

export default Layout;