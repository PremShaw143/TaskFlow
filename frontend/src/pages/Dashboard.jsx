import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/layout/Layout";

function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadDashboard() {
        try {
            setLoading(true);
            setError("");

            const data = await apiRequest("/dashboard");
            setDashboard(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, []);

    if (loading) {
        return (
            <Layout>
                <div className="dashboard-page">
                    <p>Loading dashboard...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="dashboard-page">
                    <h2>Dashboard</h2>
                    <p className="error-message">{error}</p>

                    <button onClick={loadDashboard}>
                        Try Again
                    </button>
                </div>
            </Layout>
        );
    }

    const assignedTasks = dashboard?.assigned_tasks || {};

    return (
        <Layout>
            <div className="dashboard-page">

                <header className="dashboard-header">
                    <div>
                        <h1>TaskFlow</h1>
                        <p>Welcome back, {user?.name}</p>
                    </div>
                </header>

                <main className="dashboard-content">

                    <div className="dashboard-title">
                        <div>
                            <h2>Dashboard</h2>
                            <p>
                                Here's what's happening with your work.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate("/projects")}
                        >
                            View Projects
                        </button>
                    </div>

                    <section className="stats-grid">

                        <div className="stat-card">
                            <span>Projects</span>
                            <strong>
                                {dashboard?.project_count || 0}
                            </strong>
                        </div>

                        <div className="stat-card">
                            <span>To Do</span>
                            <strong>
                                {assignedTasks["To Do"] || 0}
                            </strong>
                        </div>

                        <div className="stat-card">
                            <span>In Progress</span>
                            <strong>
                                {assignedTasks["In Progress"] || 0}
                            </strong>
                        </div>

                        <div className="stat-card">
                            <span>Completed This Week</span>
                            <strong>
                                {dashboard?.completed_this_week || 0}
                            </strong>
                        </div>

                    </section>

                    <section className="dashboard-grid">

                        <div className="dashboard-card">
                            <h3>My Tasks</h3>

                            <div className="task-status">
                                <span>To Do</span>
                                <strong>
                                    {assignedTasks["To Do"] || 0}
                                </strong>
                            </div>

                            <div className="task-status">
                                <span>In Progress</span>
                                <strong>
                                    {assignedTasks["In Progress"] || 0}
                                </strong>
                            </div>

                            <div className="task-status">
                                <span>Done</span>
                                <strong>
                                    {assignedTasks["Done"] || 0}
                                </strong>
                            </div>

                            <button
                                onClick={() =>
                                    navigate("/assigned-to-me")
                                }
                            >
                                View My Tasks
                            </button>
                        </div>

                        <div className="dashboard-card">
                            <h3>Most Open Tasks</h3>

                            {dashboard?.project_with_most_open_tasks ? (
                                <>
                                    <h4>
                                        {
                                            dashboard
                                                .project_with_most_open_tasks
                                                .project_name
                                        }
                                    </h4>

                                    <p>
                                        {
                                            dashboard
                                                .project_with_most_open_tasks
                                                .open_tasks
                                        }{" "}
                                        open tasks
                                    </p>
                                </>
                            ) : (
                                <p>No open tasks found.</p>
                            )}

                            <button
                                onClick={() =>
                                    navigate("/projects")
                                }
                            >
                                View Projects
                            </button>
                        </div>

                    </section>

                    <section className="dashboard-card activity-card">

                        <h3>Recent Activity</h3>

                        {dashboard?.recent_activity?.length > 0 ? (
                            <div>
                                {dashboard.recent_activity.map(
                                    (activity) => (
                                        <div
                                            className="activity-item"
                                            key={activity.id}
                                        >
                                            <strong>
                                                {activity.description}
                                            </strong>

                                            <small>
                                                {new Date(
                                                    activity.created_at
                                                ).toLocaleString()}
                                            </small>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <p>No recent activity.</p>
                        )}

                    </section>

                </main>

            </div>
        </Layout>
    );
}

export default Dashboard;