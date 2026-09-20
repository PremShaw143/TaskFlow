 
import { useEffect, useState } from "react";

import Layout from "../components/layout/Layout";
import { apiRequest } from "../services/api";
import useBoardSocket from "../hooks/useBoardSocket";
import { useAuth } from "../context/AuthContext";


function AssignedToMe() {

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [updatingTaskId, setUpdatingTaskId] = useState(null);

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterPriority, setFilterPriority] = useState("");

    const [expandedTasks, setExpandedTasks] = useState({});

    const { user } = useAuth();


    // ---------------------------------------------
    // Load assigned tasks
    // ---------------------------------------------

    async function loadAssignedTasks(showLoading = true) {

        try {

            if (showLoading) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            const data = await apiRequest(
                "/tasks/assigned-to-me"
            );

            setTasks(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            setError(error.message);

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    }


    // ---------------------------------------------
    // User WebSocket
    // ---------------------------------------------

    useBoardSocket({
        userId: user?.id,
        userSocket: true,

        onMessage: (data) => {

            console.log(
                "Assigned To Me WebSocket event:",
                data
            );

            if (
                data.event === "task_assigned" ||
                data.event === "task_updated" ||
                data.event === "task_deleted"
            ) {

                loadAssignedTasks(false);

            }

        },
    });


    // ---------------------------------------------
    // Initial loading
    // ---------------------------------------------

    useEffect(() => {

        loadAssignedTasks();

    }, []);


    // ---------------------------------------------
    // Expand / collapse task
    // ---------------------------------------------

    function toggleTaskDetails(taskId) {

        setExpandedTasks((current) => ({
            ...current,
            [taskId]: !current[taskId],
        }));

    }


    // ---------------------------------------------
    // Update task status
    // ---------------------------------------------

    async function updateTaskStatus(task, newStatus) {

        try {

            setError("");
            setUpdatingTaskId(task.id);

            await apiRequest(
                `/projects/${task.project_id}/tasks/${task.id}`,
                {
                    method: "PUT",

                    body: JSON.stringify({
                        status: newStatus,
                    }),
                }
            );

            await loadAssignedTasks(false);

        } catch (error) {

            setError(error.message);

        } finally {

            setUpdatingTaskId(null);

        }
    }


    // ---------------------------------------------
    // Filter tasks
    // ---------------------------------------------

    const filteredTasks = tasks.filter((task) => {

        const searchText =
            search.toLowerCase().trim();

        const matchesSearch =
            !searchText ||
            task.title
                ?.toLowerCase()
                .includes(searchText) ||
            task.description
                ?.toLowerCase()
                .includes(searchText);

        const matchesStatus =
            !filterStatus ||
            task.status === filterStatus;

        const matchesPriority =
            !filterPriority ||
            task.priority === filterPriority;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority
        );

    });


    // ---------------------------------------------
    // Separate by status
    // ---------------------------------------------

    const todoTasks =
        filteredTasks.filter(
            (task) =>
                task.status === "To Do"
        );

    const progressTasks =
        filteredTasks.filter(
            (task) =>
                task.status === "In Progress"
        );

    const doneTasks =
        filteredTasks.filter(
            (task) =>
                task.status === "Done"
        );


    // ---------------------------------------------
    // Clear filters
    // ---------------------------------------------

    function handleClearFilters() {

        setSearch("");
        setFilterStatus("");
        setFilterPriority("");

    }


    // ---------------------------------------------
    // Loading
    // ---------------------------------------------

    if (loading) {

        return (

            <Layout>

                <div className="project-detail-page">

                    <div className="loading-state">

                        Loading assigned tasks...

                    </div>

                </div>

            </Layout>

        );

    }


    // ---------------------------------------------
    // Main UI
    // ---------------------------------------------

    return (

        <Layout>

            <div className="project-detail-page">

                {/* PAGE HEADER */}

                <div className="project-detail-header">

                    <div>

                        <h1>
                            Assigned To Me
                        </h1>

                        <p>
                            Tasks assigned to you across your projects.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                            loadAssignedTasks(false)
                        }
                        disabled={refreshing}
                    >

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh Tasks"}

                    </button>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="error-message">

                        {error}

                    </div>

                )}


                {/* FILTERS */}

                <div className="task-filters">

                    <input
                        type="text"
                        placeholder="Search my tasks..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />


                    <select
                        value={filterStatus}
                        onChange={(event) =>
                            setFilterStatus(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            All Statuses
                        </option>

                        <option value="To Do">
                            To Do
                        </option>

                        <option value="In Progress">
                            In Progress
                        </option>

                        <option value="Done">
                            Done
                        </option>

                    </select>


                    <select
                        value={filterPriority}
                        onChange={(event) =>
                            setFilterPriority(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            All Priorities
                        </option>

                        <option value="Low">
                            Low
                        </option>

                        <option value="Medium">
                            Medium
                        </option>

                        <option value="High">
                            High
                        </option>

                    </select>


                    <button
                        type="button"
                        onClick={handleClearFilters}
                    >
                        Clear Filters
                    </button>

                </div>


                {/* TASK COUNT */}

                <p className="search-result-count">

                    Showing {filteredTasks.length} of{" "}
                    {tasks.length} assigned tasks

                </p>


                {/* TASK BOARD */}

                <div className="task-board">

                    <AssignedTaskColumn
                        title="To Do"
                        tasks={todoTasks}
                        expandedTasks={expandedTasks}
                        updatingTaskId={updatingTaskId}
                        onToggleDetails={
                            toggleTaskDetails
                        }
                        onUpdateStatus={
                            updateTaskStatus
                        }
                    />


                    <AssignedTaskColumn
                        title="In Progress"
                        tasks={progressTasks}
                        expandedTasks={expandedTasks}
                        updatingTaskId={updatingTaskId}
                        onToggleDetails={
                            toggleTaskDetails
                        }
                        onUpdateStatus={
                            updateTaskStatus
                        }
                    />


                    <AssignedTaskColumn
                        title="Done"
                        tasks={doneTasks}
                        expandedTasks={expandedTasks}
                        updatingTaskId={updatingTaskId}
                        onToggleDetails={
                            toggleTaskDetails
                        }
                        onUpdateStatus={
                            updateTaskStatus
                        }
                    />

                </div>

            </div>

        </Layout>

    );
}


// =====================================================
// ASSIGNED TASK COLUMN
// =====================================================

function AssignedTaskColumn({
    title,
    tasks,
    expandedTasks,
    updatingTaskId,
    onToggleDetails,
    onUpdateStatus,
}) {

    return (

        <div className="task-column">

            <div className="task-column-header">

                <h3>
                    {title}
                </h3>

                <span>
                    {tasks.length}
                </span>

            </div>


            <div className="task-list">

                {tasks.length === 0 && (

                    <p className="no-tasks">
                        No tasks
                    </p>

                )}


                {tasks.map((task) => (

                    <div
                        className="task-card"
                        key={task.id}
                    >

                        {/* TASK HEADER */}

                        <div className="task-card-top">

                            <span
                                className={`priority-${task.priority.toLowerCase()}`}
                            >

                                {task.priority}

                            </span>

                        </div>


                        {/* TASK TITLE */}

                        <h4>
                            {task.title}
                        </h4>


                        {/* SHORT DESCRIPTION */}

                        {task.description && (

                            <p>

                                {task.description.length > 120
                                    ? `${task.description.substring(0, 120)}...`
                                    : task.description}

                            </p>

                        )}


                        {/* BASIC INFORMATION */}

                        <small>
                            Status: {task.status}
                        </small>


                        {task.due_date && (

                            <small>

                                Due:{" "}

                                {new Date(
                                    task.due_date
                                ).toLocaleDateString()}

                            </small>

                        )}


                        {/* STATUS BUTTONS */}
                        

                        <div className="task-status-control">
    <label>Status:</label>

    <select
        value={task.status}
        onChange={(e) =>
            onUpdateStatus(task, e.target.value)
        }
        disabled={updatingTaskId === task.id}
    >
        <option value="To Do">To Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
    </select>
</div>


                        {/* VIEW DETAILS */}

                        <button
                            type="button"
                            className="comments-toggle-button"
                            onClick={() =>
                                onToggleDetails(
                                    task.id
                                )
                            }
                        >

                            {expandedTasks[task.id]
                                ? "Hide Details"
                                : "View Task Details"}

                        </button>


                        {/* FULL DETAILS */}

                        {expandedTasks[task.id] && (

                            <div className="comments-section">

                                <h4>
                                    Task Details
                                </h4>


                                <div>

                                    <strong>
                                        Title
                                    </strong>

                                    <p>
                                        {task.title}
                                    </p>

                                </div>


                                <div>

                                    <strong>
                                        Description
                                    </strong>

                                    <p>
                                        {task.description ||
                                            "No description provided."}
                                    </p>

                                </div>


                                <div>

                                    <strong>
                                        Status
                                    </strong>

                                    <p>
                                        {task.status}
                                    </p>

                                </div>


                                <div>

                                    <strong>
                                        Priority
                                    </strong>

                                    <p>
                                        {task.priority}
                                    </p>

                                </div>


                                <div>

                                    <strong>
                                        Due Date
                                    </strong>

                                    <p>

                                        {task.due_date
                                            ? new Date(
                                                task.due_date
                                            ).toLocaleDateString()
                                            : "No due date"}

                                    </p>

                                </div>


                                <div>

                                    <strong>
                                        Task ID
                                    </strong>

                                    <p>
                                        #{task.id}
                                    </p>

                                </div>

                            </div>

                        )}

                    </div>

                ))}

            </div>

        </div>

    );

}


export default AssignedToMe;
