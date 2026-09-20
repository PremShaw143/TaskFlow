
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/layout/Layout";

import {
    getProjects,
    createProject,
} from "../services/projectService";

import { apiRequest } from "../services/api";


function Projects() {

    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [creating, setCreating] = useState(false);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [formError, setFormError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [editingProject, setEditingProject] = useState(null);

    const [name, setName] = useState("");

    const [description, setDescription] = useState("");

    const [priority, setPriority] = useState("Medium");

    const [search, setSearch] = useState("");


    // ---------------------------------------------
    // LOAD PROJECTS
    // ---------------------------------------------

    async function loadProjects() {

        try {

            setLoading(true);

            setError("");

            const data = await getProjects();

            const priorityOrder = {
                High: 1,
                Medium: 2,
                Low: 3,
            };

            const sortedProjects = [...data].sort(
                (a, b) =>
                    (priorityOrder[a.priority] || 4) -
                    (priorityOrder[b.priority] || 4)
            );

            setProjects(sortedProjects);

        } catch (error) {

            setError(error.message);

        } finally {

            setLoading(false);

        }

    }


    // ---------------------------------------------
    // MANUAL REFRESH
    // ---------------------------------------------

    async function handleRefresh() {
        try {
            setRefreshing(true);
            setError("");
            await loadProjects();
        } catch (error) {
            console.error("Refresh failed:", error);
            setError(error.message || "Unable to refresh projects.");
        } finally {
            setRefreshing(false);
        }
    }


    // ---------------------------------------------
    // INITIAL LOAD
    // ---------------------------------------------

    useEffect(() => {

        loadProjects();

    }, []);


    // ---------------------------------------------
    // CREATE PROJECT
    // ---------------------------------------------

    async function handleCreateProject(event) {

        event.preventDefault();

        setFormError("");

        if (!name.trim()) {

            setFormError(
                "Project name is required."
            );

            return;

        }

        try {

            setCreating(true);

            const newProject = await createProject(
                name.trim(),
                description.trim(),
                priority
            );

            setProjects((currentProjects) => {

                const updatedProjects = [
                    ...currentProjects,
                    newProject,
                ];

                const priorityOrder = {
                    High: 1,
                    Medium: 2,
                    Low: 3,
                };

                return updatedProjects.sort(
                    (a, b) =>
                        (priorityOrder[a.priority] || 4) -
                        (priorityOrder[b.priority] || 4)
                );

            });

            setName("");

            setDescription("");

            setPriority("Medium");

            setShowForm(false);

        } catch (error) {

            setFormError(
                error.message
            );

        } finally {

            setCreating(false);

        }

    }


    // ---------------------------------------------
    // OPEN EDIT FORM
    // ---------------------------------------------

    function handleEditProject(project) {

        setEditingProject(project);

        setName(project.name || "");

        setDescription(project.description || "");

        setPriority(project.priority || "Medium");

        setFormError("");

    }


    // ---------------------------------------------
    // UPDATE PROJECT
    // ---------------------------------------------

    async function handleUpdateProject(event) {

        event.preventDefault();

        setFormError("");

        if (!name.trim()) {

            setFormError(
                "Project name is required."
            );

            return;

        }

        try {

            setSaving(true);

            const updatedProject = await apiRequest(
                `/projects/${editingProject.id}`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        name: name.trim(),
                        description: description.trim(),
                        priority: priority,
                    }),
                }
            );

            setProjects((currentProjects) => {

                const updatedProjects =
                    currentProjects.map((project) =>
                        project.id === updatedProject.id
                            ? updatedProject
                            : project
                    );

                const priorityOrder = {
                    High: 1,
                    Medium: 2,
                    Low: 3,
                };

                return updatedProjects.sort(
                    (a, b) =>
                        (priorityOrder[a.priority] || 4) -
                        (priorityOrder[b.priority] || 4)
                );

            });

            setEditingProject(null);

            setName("");

            setDescription("");

            setPriority("Medium");

        } catch (error) {

            setFormError(
                error.message
            );

        } finally {

            setSaving(false);

        }

    }


    // ---------------------------------------------
    // CLOSE EDIT
    // ---------------------------------------------

    function closeEdit() {

        setEditingProject(null);

        setName("");

        setDescription("");

        setPriority("Medium");

        setFormError("");

    }


    // ---------------------------------------------
    // SEARCH
    // ---------------------------------------------

    const filteredProjects =
        projects.filter((project) => {

            const searchText =
                search.toLowerCase().trim();

            if (!searchText) {

                return true;

            }

            const projectName =
                project.name?.toLowerCase() || "";

            const projectDescription =
                project.description?.toLowerCase() || "";

            return (
                projectName.includes(searchText) ||
                projectDescription.includes(searchText)
            );

        });


    // ---------------------------------------------
    // UI
    // ---------------------------------------------

    return (

        <Layout>

            <div className="projects-page">

                {/* HEADER */}

                <div className="page-header">

                    <div>

                        <h1>
                            Projects
                        </h1>

                        <p>
                            Manage your projects and collaborate
                            with your team.
                        </p>

                    </div>

                    <div className="page-header-actions">

                        <button
                            type="button"
                            className="refresh-button"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            title="Refresh projects"
                        >
                            <span className="refresh-icon">
                                ↻
                            </span>

                            <span>
                                {refreshing
                                    ? "Refreshing..."
                                    : "Refresh"}
                            </span>
                        </button>

                        <button
                            type="button"
                            className="primary-button"
                            onClick={() => {

                                setShowForm(!showForm);

                                setEditingProject(null);

                                setFormError("");

                            }}
                        >

                            {showForm
                                ? "Cancel"
                                : "+ New Project"}

                        </button>

                    </div>

                </div>


                {/* SEARCH */}

                {!loading &&
                    !error &&
                    projects.length > 0 && (

                        <div className="project-search-container">

                            <div className="project-search-box">

                                <span className="search-icon">
                                    🔍
                                </span>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search projects..."
                                />

                                {search && (

                                    <button
                                        type="button"
                                        className="search-clear-button"
                                        onClick={() =>
                                            setSearch("")
                                        }
                                        aria-label="Clear search"
                                    >
                                        ×
                                    </button>

                                )}

                            </div>

                            {search && (

                                <p className="search-result-count">

                                    {filteredProjects.length}{" "}

                                    {filteredProjects.length === 1
                                        ? "project"
                                        : "projects"}

                                    {" "}found

                                </p>

                            )}

                        </div>

                    )}


                {/* CREATE PROJECT */}

                {showForm && (

                    <div className="project-form-card">

                        <h2>
                            Create Project
                        </h2>

                        <form
                            onSubmit={
                                handleCreateProject
                            }
                        >

                            <label>
                                Project Name
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter project name"
                            />


                            <label>
                                Description
                            </label>

                            <textarea
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter project description"
                                rows="4"
                            />


                            <label>
                                Project Priority
                            </label>

                            <select
                                value={priority}
                                onChange={(event) =>
                                    setPriority(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="High">
                                    High
                                </option>

                                <option value="Medium">
                                    Medium
                                </option>

                                <option value="Low">
                                    Low
                                </option>

                            </select>


                            {formError && (

                                <p className="error-message">
                                    {formError}
                                </p>

                            )}


                            <button
                                type="submit"
                                className="primary-button"
                                disabled={creating}
                            >

                                {creating
                                    ? "Creating..."
                                    : "Create Project"}

                            </button>

                        </form>

                    </div>

                )}


                {/* EDIT PROJECT */}

                {editingProject && (

                    <div className="project-form-card">

                        <h2>
                            Edit Project
                        </h2>

                        <form
                            onSubmit={
                                handleUpdateProject
                            }
                        >

                            <label>
                                Project Name
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter project name"
                            />


                            <label>
                                Description
                            </label>

                            <textarea
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter project description"
                                rows="4"
                            />


                            <label>
                                Project Priority
                            </label>

                            <select
                                value={priority}
                                onChange={(event) =>
                                    setPriority(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="High">
                                    High
                                </option>

                                <option value="Medium">
                                    Medium
                                </option>

                                <option value="Low">
                                    Low
                                </option>

                            </select>


                            {formError && (

                                <p className="error-message">
                                    {formError}
                                </p>

                            )}


                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                }}
                            >

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={saving}
                                >

                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}

                                </button>


                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={closeEdit}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    </div>

                )}


                {/* LOADING */}

                {loading && (

                    <div className="empty-state">

                        <p>
                            Loading projects...
                        </p>

                    </div>

                )}


                {/* ERROR */}

                {!loading &&
                    error && (

                        <div className="empty-state">

                            <p className="error-message">
                                {error}
                            </p>

                            <button
                                className="primary-button"
                                onClick={loadProjects}
                            >
                                Try Again
                            </button>

                        </div>

                    )}


                {/* NO PROJECTS */}

                {!loading &&
                    !error &&
                    projects.length === 0 && (

                        <div className="empty-state">

                            <h2>
                                No projects yet
                            </h2>

                            <p>
                                Create your first project
                                to get started.
                            </p>

                            <button
                                className="primary-button"
                                onClick={() =>
                                    setShowForm(true)
                                }
                            >
                                Create Project
                            </button>

                        </div>

                    )}


                {/* NO SEARCH RESULTS */}

                {!loading &&
                    !error &&
                    projects.length > 0 &&
                    filteredProjects.length === 0 && (

                        <div className="empty-state">

                            <h2>
                                No projects found
                            </h2>

                            <p>
                                No project matches "{search}".
                            </p>

                            <button
                                className="primary-button"
                                onClick={() =>
                                    setSearch("")
                                }
                            >
                                Clear Search
                            </button>

                        </div>

                    )}


                {/* PROJECT CARDS */}

                {!loading &&
                    !error &&
                    filteredProjects.length > 0 && (

                        <div className="projects-grid">

                            {filteredProjects.map(
                                (project) => (

                                    <div
                                        className="project-card"
                                        key={project.id}
                                        onClick={() =>
                                            navigate(
                                                `/projects/${project.id}`
                                            )
                                        }
                                    >

                                        {/* ICON */}

                                        <div className="project-card-icon">

                                            {project.name
                                                ?.charAt(0)
                                                .toUpperCase()}

                                        </div>


                                        {/* NAME */}

                                        <h3>
                                            {project.name}
                                        </h3>


                                        {/* DESCRIPTION */}

                                        <p>
                                            {project.description ||
                                                "No description provided."}
                                        </p>


                                        {/* PROJECT PRIORITY */}

                                        <div
                                            className={
                                                `project-priority-badge priority-${(
                                                    project.priority ||
                                                    "Medium"
                                                ).toLowerCase()}`
                                            }
                                        >

                                            {project.priority ||
                                                "Medium"}{" "}
                                            priority

                                        </div>


                                        {/* FOOTER */}

                                        <div className="project-card-footer">

                                            <span>
                                                Project #
                                                {project.id}
                                            </span>


                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "10px",
                                                }}
                                            >

                                                <button
                                                    type="button"
                                                    className="secondary-button"
                                                    onClick={(event) => {

                                                        event.stopPropagation();

                                                        handleEditProject(
                                                            project
                                                        );

                                                    }}
                                                >
                                                    Edit
                                                </button>


                                                <span>
                                                    →
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

            </div>

        </Layout>

    );

}


export default Projects;
