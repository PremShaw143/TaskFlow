import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import AssignedToMe from "./pages/AssignedToMe";
import { useAuth } from "./context/AuthContext";
import "./App.css";
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/projects"
                element={
                    <ProtectedRoute>
                        <Projects />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/projects/:projectId"
                element={
                    <ProtectedRoute>
                        <ProjectDetail />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/assigned-to-me"
                element={
                    <ProtectedRoute>
                        <AssignedToMe />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />

            <Route
                path="*"
                element={<Navigate to="/login" replace />}
            />
        </Routes>
    );
}

export default App;
