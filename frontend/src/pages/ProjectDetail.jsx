    import { useEffect, useState } from "react";
    import { useNavigate, useParams } from "react-router-dom";
    import useBoardSocket from "../hooks/useBoardSocket";
    import Layout from "../components/layout/Layout";

    import {
        getTasks,
        createTask,
        updateTask,
        deleteTask,
        getComments,
        createComment,
    } from "../services/taskService";

    import {
        getProject,
        getProjectMembers,
        inviteMember,
        removeMember,
        deleteProject,
    } from "../services/projectService";

    import { useAuth } from "../context/AuthContext";


    function ProjectDetail() {

        const { projectId } = useParams();

        const { user } = useAuth();
        const navigate = useNavigate();
        async function handleRealtimeMessage(data) {
        console.log(
            "Realtime project event:",
            data
        );

        // Task created
        if (data.event === "task_created") {
            await loadTasks(false);
            return;
        }

        // Task updated
        if (data.event === "task_updated") {
            await loadTasks(false);

            // If comments for this task are open,
            // refresh them too.
            if (data.task_id && comments[data.task_id]) {
                try {
                    const updatedComments =
                        await getComments(
                            projectId,
                            data.task_id
                        );

                    setComments((current) => ({
                        ...current,
                        [data.task_id]:
                            updatedComments,
                    }));
                } catch (error) {
                    console.error(
                        "Failed to refresh comments:",
                        error
                    );
                }
            }

            return;
        }

        // Task deleted
        if (data.event === "task_deleted") {
            setTasks((currentTasks) =>
                currentTasks.filter(
                    (task) =>
                        task.id !== data.task_id
                )
            );

            // Remove comments belonging to deleted task
            if (data.task_id) {
                setComments((current) => {
                    const updated = {
                        ...current,
                    };

                    delete updated[data.task_id];

                    return updated;
                });
            }

            return;
        }

        // New comment
        if (data.event === "comment_added") {
            if (data.task_id) {
                try {
                    const updatedComments =
                        await getComments(
                            projectId,
                            data.task_id
                        );

                    setComments((current) => ({
                        ...current,
                        [data.task_id]:
                            updatedComments,
                    }));
                } catch (error) {
                    console.error(
                        "Failed to refresh comments:",
                        error
                    );
                }
            }

            return;
        }

        // Member invited
        if (data.event === "member_invited") {
            await loadMembers(false);
            return;
        }

        // Member removed
        if (data.event === "member_removed") {
            await loadMembers(false);
            await loadTasks(false);
            return;
        }
    }

        // Project-scoped realtime connection.
        useBoardSocket({
            projectId,
            onMessage: handleRealtimeMessage,
        });

        // ---------------------------------------------
        // Project / Task / Member state
        // ---------------------------------------------

        const [project, setProject] = useState(null);

        const [tasks, setTasks] = useState([]);

        const [members, setMembers] = useState([]);


        const [loading, setLoading] = useState(true);

        const [refreshing, setRefreshing] = useState(false);
        const [removingMemberId, setRemovingMemberId] = useState(null);
        const [deletingTaskId, setDeletingTaskId] = useState(null);
        const [updatingTaskId, setUpdatingTaskId] = useState(null);
        const [deletingProject, setDeletingProject] = useState(false);

        const [error, setError] = useState("");


        // ---------------------------------------------
        // Search and filter state
        // ---------------------------------------------

        const [search, setSearch] = useState("");

        const [filterPriority, setFilterPriority] =
            useState("");

        const [filterAssignee, setFilterAssignee] =
            useState("");

        const [filterStatus, setFilterStatus] =
            useState("");


        // ---------------------------------------------
        // Sorting state
        // ---------------------------------------------

        const [sortBy, setSortBy] =
            useState("created_at");

        const [sortOrder, setSortOrder] =
            useState("desc");


        // ---------------------------------------------
        // Pagination state
        // ---------------------------------------------

        const [page, setPage] = useState(1);

        const [pageSize] = useState(5);

        const [totalTasks, setTotalTasks] =
            useState(0);


        // ---------------------------------------------
        // Create task state
        // ---------------------------------------------

        const [showForm, setShowForm] =
            useState(false);

        const [creating, setCreating] =
            useState(false);

        const [title, setTitle] =
            useState("");

        const [description, setDescription] =
            useState("");

        const [priority, setPriority] =
            useState("Medium");

        const [assigneeId, setAssigneeId] =
            useState("");
        const [dueDate, setDueDate] =
    useState("");

        // ---------------------------------------------
        // Member state
        // ---------------------------------------------

        const [memberEmail, setMemberEmail] =
            useState("");

        const [inviting, setInviting] =
            useState(false);


        // ---------------------------------------------
        // Edit task state
        // ---------------------------------------------

        const [editingTask, setEditingTask] =
            useState(null);

        const [editTitle, setEditTitle] =
            useState("");

        const [editDescription, setEditDescription] =
            useState("");

        const [editPriority, setEditPriority] =
            useState("Medium");

        const [editStatus, setEditStatus] =
            useState("To Do");

        const [editDueDate, setEditDueDate] =
            useState("");

        const [editAssigneeId, setEditAssigneeId] =
            useState("");

        const [updatingTask, setUpdatingTask] =
            useState(false);
        // ---------------------------------------------
    // Comment state
    // ---------------------------------------------

        const [comments, setComments] = useState({});
        const [commentInputs, setCommentInputs] = useState({});
        const [commentLoading, setCommentLoading] = useState({});
        const [commentSubmitting, setCommentSubmitting] = useState({});

        // ---------------------------------------------
        // Check project owner
        // ---------------------------------------------

        const isOwner =
            project?.owner_id === user?.id;


        // ---------------------------------------------
        // Load project
        // ---------------------------------------------

        async function loadProject(showError = true) {

            try {

                const projectData =
                    await getProject(projectId);

                setProject(projectData);

                return true;

            } catch (error) {

                if (showError) {
                    setError(error.message);
                }

                throw error;

            }
        }


        // ---------------------------------------------
        // Load members
        // ---------------------------------------------

        async function loadMembers(showError = true) {

            try {

                const memberData =
                    await getProjectMembers(
                        projectId
                    );

                setMembers(memberData);

                return true;

            } catch (error) {

                if (showError) {
                    setError(error.message);
                }

                throw error;

            }
        }


        // ---------------------------------------------
        // Load tasks
        // ---------------------------------------------
    

        async function loadTasks(showError = true) {
        try {
            const taskData = await getTasks(
                projectId,
                {
                    status: filterStatus || undefined,
                    assignee_id: filterAssignee || undefined,
                    priority: filterPriority || undefined,
                    search: search.trim() || undefined,
                    page: page,
                    page_size: pageSize,
                    sort_by: sortBy,
                    sort_order: sortOrder,
                }
            );

            const rawTasks = Array.isArray(taskData)
                ? taskData
                : Array.isArray(taskData?.items)
                    ? taskData.items
                    : [];

            const safeTasks = rawTasks
                .filter((task) => task && typeof task === "object")
                .map((task) => ({
                    ...task,
                    title: task.title || "Untitled task",
                    status:
                        task.status === "In Progress" || task.status === "Done"
                            ? task.status
                            : "To Do",
                    priority:
                        task.priority === "High" || task.priority === "Low"
                            ? task.priority
                            : "Medium",
                    assignee_id: task.assignee_id ?? null,
                    due_date: task.due_date ?? null,
                }));

            setTasks(safeTasks);
            setTotalTasks(
                Array.isArray(taskData)
                    ? safeTasks.length
                    : Number(taskData?.total) || safeTasks.length
            );
        } catch (error) {
            if (showError) {
                setError(error.message);
            }

            throw error;
        }
    }

        // ---------------------------------------------
        // Manual refresh
        // ---------------------------------------------

        async function handleRefresh() {
            try {
                setRefreshing(true);
                setError("");

                await Promise.all([
                    loadProject(false),
                    loadMembers(false),
                    loadTasks(false),
                ]);

                const openTaskIds = Object.keys(comments);

                if (openTaskIds.length > 0) {
                    const commentResults = await Promise.all(
                        openTaskIds.map(async (taskId) => {
                            try {
                                const data = await getComments(
                                    projectId,
                                    Number(taskId)
                                );

                                return {
                                    taskId,
                                    data,
                                };
                            } catch (error) {
                                console.error(
                                    `Failed to refresh comments for task ${taskId}:`,
                                    error
                                );

                                return {
                                    taskId,
                                    data: comments[taskId] || [],
                                };
                            }
                        })
                    );

                    setComments((current) => {
                        const updated = { ...current };

                        commentResults.forEach((result) => {
                            updated[result.taskId] = result.data;
                        });

                        return updated;
                    });
                }
            } catch (error) {
                console.error("Refresh failed:", error);
                setError(error.message || "Unable to refresh project data.");
            } finally {
                setRefreshing(false);
            }
        }

        // ---------------------------------------------
        // Initial project loading
        // ---------------------------------------------

        useEffect(() => {
        if (!loading) {
            loadTasks();
        }
    }, [
        page,
        sortBy,
        sortOrder,
        search,
        filterPriority,
        filterAssignee,
        filterStatus,
    ]);

        useEffect(() => {
            let cancelled = false;

            async function loadInitialData() {

                setLoading(true);
                setError("");

                const results = await Promise.allSettled([
                    loadProject(false),
                    loadMembers(false),
                    loadTasks(false),
                ]);

                if (cancelled) {
                    return;
                }

                const failedRequest = results.find(
                    (result) => result.status === "rejected"
                );

                if (failedRequest) {
                    setError(
                        failedRequest.reason?.message ||
                        "Unable to load some project data."
                    );
                } else {
                    setError("");
                }

                setLoading(false);
            }

            loadInitialData();

            return () => {
                cancelled = true;
            };

        }, [projectId]);




        // ---------------------------------------------
        // Invite member
        // ---------------------------------------------

        async function handleInviteMember(event) {

            event.preventDefault();


            if (!memberEmail.trim()) {

                setError(
                    "Member email is required."
                );

                return;
            }


            try {

                setInviting(true);

                setError("");


                const result =
                    await inviteMember(
                        projectId,
                        memberEmail.trim()
                    );


                const updatedMembers =
                    await getProjectMembers(
                        projectId
                    );


                setMembers(updatedMembers);

                setMemberEmail("");


                alert(
                    result.message ||
                    "Member invited successfully."
                );


            } catch (error) {

                setError(error.message);

            } finally {

                setInviting(false);

            }
        }


        // ---------------------------------------------
        // Remove member
        // ---------------------------------------------

        async function handleRemoveMember(
            member
        ) {

            const confirmed =
                window.confirm(
                    `Remove ${member.name} from this project?`
                );


            if (!confirmed) {

                return;
            }


            try {

                setRemovingMemberId(member.user_id);
                setError("");


                await removeMember(
                    projectId,
                    member.user_id
                );


                await loadMembers();

                await loadTasks();


            } catch (error) {

                setError(error.message);

            } finally {

                setRemovingMemberId(null);

            }
        }

        // ---------------------------------------------
// Delete project
// ---------------------------------------------

async function handleDeleteProject() {
    const confirmed = window.confirm(
        "Are you sure you want to delete this project? This will permanently delete the project, tasks, members, comments, and activities."
    );

    if (!confirmed) {
        return;
    }

    try {
        setDeletingProject(true);
        setError("");

        await deleteProject(projectId);

        navigate("/projects");
    } catch (error) {
        setError(error.message);
    } finally {
        setDeletingProject(false);
    }
}


        // ---------------------------------------------
        // Create task
        // ---------------------------------------------

        async function handleCreateTask(event) {

            event.preventDefault();


            if (!title.trim()) {

                setError(
                    "Task title is required."
                );

                return;
            }

            if (dueDate) {
                const selectedDate = new Date(`${dueDate}T23:59:59`);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (selectedDate < today) {
                    setError("Due date cannot be in the past.");
                    return;
                }
            }


            try {

                setCreating(true);

                setError("");


                await createTask(
    projectId,
    {
        title: title.trim(),
        description: description.trim() || null,
        priority: priority,
        due_date: dueDate || null,
        assignee_id: assigneeId
            ? Number(assigneeId)
            : null,
    }
);

            await loadTasks(false);


                setTitle("");

                setDescription("");

                setPriority("Medium");

                setAssigneeId("");

                setDueDate("");

                setShowForm(false);


            } catch (error) {

                setError(error.message);

            } finally {

                setCreating(false);

            }
        }


        // ---------------------------------------------
        // Change task status
        // ---------------------------------------------

        async function handleStatusChange(
            task,
            newStatus
        ) {

            try {

                setUpdatingTaskId(task.id);
                setError("");


                const updatedTask =
                    await updateTask(
                        projectId,
                        task.id,
                        {
                            status:
                                newStatus,
                        }
                    );


                setTasks(
                    (currentTasks) =>
                        currentTasks.map(
                            (item) =>
                                item.id === task.id
                                    ? updatedTask
                                    : item
                        )
                );


            } catch (error) {

                setError(error.message);

            } finally {

                setUpdatingTaskId(null);

            }
        }


        // ---------------------------------------------
        // Delete task
        // ---------------------------------------------

        async function handleDeleteTask(
            taskId
        ) {

            const confirmed =
                window.confirm(
                    "Are you sure you want to delete this task?"
                );


            if (!confirmed) {

                return;
            }


            try {

                setDeletingTaskId(taskId);
                setError("");


                await deleteTask(
                    projectId,
                    taskId
                );


                setTasks(
                    (currentTasks) =>
                        currentTasks.filter(
                            (task) =>
                                task.id !== taskId
                        )
                );


            } catch (error) {

                setError(error.message);

            } finally {

                setDeletingTaskId(null);

            }
        }


        // ---------------------------------------------
        // Start editing task
        // ---------------------------------------------

        function handleStartEditTask(
            task
        ) {

            setEditingTask(task);


            setEditTitle(
                task.title || ""
            );


            setEditDescription(
                task.description || ""
            );


            setEditPriority(
                task.priority || "Medium"
            );


            setEditStatus(
                task.status || "To Do"
            );


            setEditDueDate(
                task.due_date
                    ? task.due_date.slice(0, 10)
                    : ""
            );


            setEditAssigneeId(
                task.assignee_id
                    ? String(task.assignee_id)
                    : ""
            );


            setError("");
        }


        // ---------------------------------------------
        // Update task
        // ---------------------------------------------

        async function handleEditTask(
            event
        ) {

            event.preventDefault();


            if (!editTitle.trim()) {

                setError(
                    "Task title cannot be empty."
                );

                return;
            }


            try {

                setUpdatingTask(true);

                setError("");


                const updatedTask =
                    await updateTask(
                        projectId,
                        editingTask.id,
                        {
                            title:
                                editTitle.trim(),

                            description:
                                editDescription.trim() ||
                                null,

                            priority:
                                editPriority,

                            status:
                                editStatus,

                            due_date:
                                editDueDate ||
                                null,

                            assignee_id:
                                editAssigneeId
                                    ? Number(
                                        editAssigneeId
                                    )
                                    : null,
                        }
                    );


                setTasks(
                    (currentTasks) =>
                        currentTasks.map(
                            (task) =>
                                task.id ===
                                updatedTask.id
                                    ? updatedTask
                                    : task
                        )
                );


                setEditingTask(null);


            } catch (error) {

                setError(error.message);

            } finally {

                setUpdatingTask(false);

            }
        }
        


        // ---------------------------------------------
    // Load comments
    // ---------------------------------------------

    async function handleLoadComments(taskId) {

        try {

            setCommentLoading((current) => ({
                ...current,
                [taskId]: true,
            }));

            setError("");

            const data = await getComments(
                projectId,
                taskId
            );

            setComments((current) => ({
                ...current,
                [taskId]: data,
            }));

        } catch (error) {

            setError(error.message);

        } finally {

            setCommentLoading((current) => ({
                ...current,
                [taskId]: false,
            }));

        }
    }


    // ---------------------------------------------
    // Comment input
    // ---------------------------------------------

    function handleCommentInputChange(
        taskId,
        value
    ) {

        setCommentInputs((current) => ({
            ...current,
            [taskId]: value,
        }));

    }


    // ---------------------------------------------
    // Add comment
    // ---------------------------------------------

    async function handleAddComment(
        taskId
    ) {

        const content =
            commentInputs[taskId]?.trim() || "";

        if (!content) {

            setError(
                "Comment cannot be empty."
            );

            return;
        }

        try {

            setCommentSubmitting((current) => ({
                ...current,
                [taskId]: true,
            }));

            setError("");

            const newComment =
                await createComment(
                    projectId,
                    taskId,
                    content
                );

            setComments((current) => ({
                ...current,
                [taskId]: [
                    ...(current[taskId] || []),
                    newComment,
                ],
            }));

            setCommentInputs((current) => ({
                ...current,
                [taskId]: "",
            }));

        } catch (error) {

            setError(error.message);

        } finally {

            setCommentSubmitting((current) => ({
                ...current,
                [taskId]: false,
            }));

        }
    }

        // ---------------------------------------------
        // Tasks returned by the backend
        // ---------------------------------------------

        const filteredTasks = tasks;


        // ---------------------------------------------
        // Task columns
        // ---------------------------------------------

        const todoTasks =
            filteredTasks.filter(
                (task) =>
                    task.status ===
                    "To Do"
            );


        const progressTasks =
            filteredTasks.filter(
                (task) =>
                    task.status ===
                    "In Progress"
            );


        const doneTasks =
            filteredTasks.filter(
                (task) =>
                    task.status ===
                    "Done"
            );


        // ---------------------------------------------
        // Pagination calculations
        // ---------------------------------------------

        const totalPages =
            totalTasks > 0
                ? Math.ceil(
                    totalTasks / pageSize
                )
                : 1;


        // ---------------------------------------------
        // Clear filters
        // ---------------------------------------------

        function handleClearFilters() {

            setSearch("");

            setFilterPriority("");

            setFilterAssignee("");

            setFilterStatus("");
            setPage(1);
        }


        // ---------------------------------------------
        // Loading
        // ---------------------------------------------

        if (loading) {

            return (

                <Layout>

                    <div className="project-detail-page">

                        <div className="loading-state">

                            Loading project...

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


                    {/* =====================================
                        PROJECT HEADER
                    ====================================== */}

                    <div className="project-detail-header">

                        <div>

                            <h1>
                                {project?.name ||
                                    "Project"}
                            </h1>


                            <p>
                                {project?.description ||
                                    "Manage tasks and collaborate with your team."}
                            </p>

                        </div>


                
        <div className="project-header-actions">

    <button
        type="button"
        className="refresh-button"
        onClick={handleRefresh}
        disabled={refreshing}
        title="Refresh project data"
    >
        <span className="refresh-icon">
            ↻
        </span>

        <span>
            {refreshing ? "Refreshing..." : "Refresh"}
        </span>
    </button>

    {isOwner && (
        <button
            type="button"
            className="delete-project-button"
            onClick={handleDeleteProject}
            disabled={deletingProject}
        >
            {deletingProject ? "Deleting..." : "Delete Project"}
        </button>
    )}

    <button
        type="button"
        className="primary-button"
        onClick={() => setShowForm(!showForm)}
    >
        {showForm ? "Cancel" : "+ New Task"}
    </button>

</div>
                        </div>
                    {/* =====================================
                        ERROR
                    ====================================== */}

                    {error && (

                        <div className="error-message">

                            {error}

                        </div>

                    )}


                    {/* =====================================
                        MEMBERS
                    ====================================== */}

                    <div className="members-card">

                        <div className="members-header">

                            <div>

                                <h2>
                                    Project Members
                                </h2>


                                <p>

                                    {members.length}{" "}
                                    member
                                    {members.length !==
                                    1
                                        ? "s"
                                        : ""}

                                </p>

                            </div>

                        </div>


                        {/* INVITE */}

                        {isOwner && (

                            <form
                                className="invite-member-form"
                                onSubmit={
                                    handleInviteMember
                                }
                            >

                                <input id="member-email" name="memberEmail" type="email" autoComplete="email" value={memberEmail}
                                    onChange={(
                                        event
                                    ) =>
                                        setMemberEmail(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter registered user's email"
                                />


                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        inviting
                                    }
                                >

                                    {inviting
                                        ? "Inviting..."
                                        : "Invite Member"}

                                </button>

                            </form>

                        )}


                        {/* MEMBER LIST */}

                        <div className="members-list">

                            {members.map(
                                (member) => (

                                    <div
                                        className="member-item"
                                        key={
                                            member.user_id
                                        }
                                    >

                                        <div className="member-avatar">

                                            {member.name
                                                ?.charAt(
                                                    0
                                                )
                                                .toUpperCase()}

                                        </div>


                                        <div className="member-details">

                                            <strong>
                                                {
                                                    member.name
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    member.email
                                                }
                                            </span>

                                        </div>


                                        <span className="member-role">

                                            {member.role}

                                        </span>


                                        {isOwner &&
                                            member.role !==
                                            "owner" && (

                                                <button
                                                    className="remove-member-button"
                                                    onClick={() =>
                                                        handleRemoveMember(
                                                            member
                                                        )
                                                    }
                                                    disabled={
                                                        removingMemberId === member.user_id
                                                    }
                                                >

                                                    {removingMemberId === member.user_id
                                                        ? "Removing..."
                                                        : "Remove"}

                                                </button>

                                            )}

                                    </div>

                                )
                            )}

                        </div>

                    </div>


                    {/* =====================================
                        CREATE TASK FORM
                    ====================================== */}

                    {showForm && (

                        <div className="task-form-card">

                            <h2>
                                Create Task
                            </h2>


                            <form
                                onSubmit={
                                    handleCreateTask
                                }
                            >

                                <label htmlFor="task-title">
                                    Title
                                </label>


                                <input id="task-title" name="title" type="text" autoComplete="off" value={title}
                                    onChange={(
                                        event
                                    ) =>
                                        setTitle(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Task title"
                                />


                                <label htmlFor="task-description">
                                    Description
                                </label>


                                <textarea id="task-description" name="description" value={description}
                                    onChange={(
                                        event
                                    ) =>
                                        setDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Task description"
                                    rows="3"
                                />


                                <label htmlFor="task-priority">
                                    Priority
                                </label>


                                <select id="task-priority" name="priority" value={priority}
                                    onChange={(
                                        event
                                    ) =>
                                        setPriority(
                                            event.target.value
                                        )
                                    }
                                >

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


                                <label htmlFor="task-assignee">
                                    Assignee
                                </label>


                                <label htmlFor="task-due-date">
                                    Due Date
                                </label>

                                <input id="task-due-date" name="dueDate" type="date" value={dueDate}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(event) => {
                                        setDueDate(event.target.value);
                                        if (error === "Due date cannot be in the past.") {
                                            setError("");
                                        }
                                    }}
                                />

                                <select id="task-assignee" name="assigneeId" value={assigneeId}
                                    onChange={(
                                        event
                                    ) =>
                                        setAssigneeId(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Unassigned
                                    </option>


                                    {members.map(
                                        (member) => (

                                            <option
                                                key={
                                                    member.user_id
                                                }
                                                value={
                                                    member.user_id
                                                }
                                            >

                                                {
                                                    member.name
                                                }

                                                {" ("}

                                                {
                                                    member.email
                                                }

                                                {")"}

                                            </option>

                                        )
                                    )}

                                </select>


                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        creating
                                    }
                                >

                                    {creating
                                        ? "Creating..."
                                        : "Create Task"}

                                </button>

                            </form>

                        </div>

                    )}


                    {/* =====================================
                        SEARCH / FILTER / SORT
                    ====================================== */}

                    <div className="task-filters">


                        {/* SEARCH */}

                        <input id="task-search" name="taskSearch" type="text" autoComplete="off" placeholder="Search tasks by title..." value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                        />


                        {/* PRIORITY */}

                        <select id="filter-priority" name="filterPriority" value={filterPriority}
                            onChange={(event) => {
                                setFilterPriority(event.target.value);
                                setPage(1);
                            }}
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


                        {/* ASSIGNEE */}

                        <select id="filter-assignee" name="filterAssignee" value={filterAssignee}
                            onChange={(event) => {
                                setFilterAssignee(event.target.value);
                                setPage(1);
                            }}
                        >

                            <option value="">
                                All Assignees
                            </option>


                            {members.map(
                                (member) => (

                                    <option
                                        key={
                                            member.user_id
                                        }
                                        value={
                                            member.user_id
                                        }
                                    >

                                        {
                                            member.name
                                        }

                                    </option>

                                )
                            )}

                        </select>


                        {/* STATUS */}

                        <select id="filter-status" name="filterStatus" value={filterStatus}
                            onChange={(event) => {
                                setFilterStatus(event.target.value);
                                setPage(1);
                            }}
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


                        {/* SORT FIELD */}

                        <select id="sort-by" name="sortBy" value={sortBy}
                            onChange={(event) => {
                                setSortBy(event.target.value);
                                setPage(1);
                            }}
                        >

                            <option value="created_at">
                                Date Created
                            </option>

                            <option value="priority">
                                Priority
                            </option>

                            <option value="due_date">
                                Due Date
                            </option>

                        </select>


                        {/* SORT ORDER */}

                        <select id="sort-order" name="sortOrder" value={sortOrder}
                            onChange={(event) => {
                                setSortOrder(event.target.value);
                                setPage(1);
                            }}
                        >

                            <option value="desc">
                                Newest / Highest First
                            </option>

                            <option value="asc">
                                Oldest / Lowest First
                            </option>

                        </select>


                        {/* CLEAR */}

                        <button
                            type="button"
                            onClick={
                                handleClearFilters
                            }
                        >

                            Clear Filters

                        </button>

                    </div>


                    {/* =====================================
                        TASK BOARD
                    ====================================== */}

                    <div className="task-board">


                        <TaskColumn
        title="To Do"
        tasks={todoTasks}
        members={members}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteTask}
        onEdit={handleStartEditTask}
        deletingTaskId={deletingTaskId}
        updatingTaskId={updatingTaskId}
        comments={comments}
        commentInputs={commentInputs}
        commentLoading={commentLoading}
        commentSubmitting={commentSubmitting}
        onLoadComments={handleLoadComments}
        onCommentInputChange={handleCommentInputChange}
        onAddComment={handleAddComment}
    />

                        <TaskColumn
        title="In Progress"
        tasks={progressTasks}
        members={members}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteTask}
        onEdit={handleStartEditTask}
        deletingTaskId={deletingTaskId}
        updatingTaskId={updatingTaskId}
        comments={comments}
        commentInputs={commentInputs}
        commentLoading={commentLoading}
        commentSubmitting={commentSubmitting}
        onLoadComments={handleLoadComments}
        onCommentInputChange={handleCommentInputChange}
        onAddComment={handleAddComment}
    />


                        <TaskColumn
        title="Done"
        tasks={doneTasks}
        members={members}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteTask}
        onEdit={handleStartEditTask}
        deletingTaskId={deletingTaskId}
        updatingTaskId={updatingTaskId}
        comments={comments}
        commentInputs={commentInputs}
        commentLoading={commentLoading}
        commentSubmitting={commentSubmitting}
        onLoadComments={handleLoadComments}
        onCommentInputChange={handleCommentInputChange}
        onAddComment={handleAddComment}
    />

                    </div>


                    {/* =====================================
                        PAGINATION
                    ====================================== */}

                    <div className="task-pagination">


                        <button
                            type="button"
                            disabled={
                                page === 1
                            }
                            onClick={() =>
                                setPage(
                                    page - 1
                                )
                            }
                        >

                            Previous

                        </button>


                        <span>

                            Page {page} of{" "}
                            {totalPages}

                        </span>


                        <button
                            type="button"
                            disabled={
                                page >=
                                totalPages
                            }
                            onClick={() =>
                                setPage(
                                    page + 1
                                )
                            }
                        >

                            Next

                        </button>

                    </div>


                    {/* =====================================
                        EDIT TASK MODAL
                    ====================================== */}

                    {editingTask && (

                        <div className="edit-task-overlay">

                            <div className="edit-task-modal">


                                <div className="edit-task-header">

                                    <h2>
                                        Edit Task
                                    </h2>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditingTask(
                                                null
                                            )
                                        }
                                    >

                                        ×

                                    </button>

                                </div>


                                <form
                                    onSubmit={
                                        handleEditTask
                                    }
                                >


                                    <label htmlFor="edit-task-title">
                                        Title
                                    </label>


                                    <input id="edit-task-title" name="editTitle" type="text" value={editTitle}
                                        onChange={(
                                            event
                                        ) =>
                                            setEditTitle(
                                                event.target.value
                                            )
                                        }
                                        required
                                    />


                                    <label htmlFor="edit-task-description">
                                        Description
                                    </label>


                                    <textarea id="edit-task-description" name="editDescription" value={editDescription}
                                        onChange={(
                                            event
                                        ) =>
                                            setEditDescription(
                                                event.target.value
                                            )
                                        }
                                    />


                                    <label htmlFor="edit-task-priority">
                                        Priority
                                    </label>


                                    <select id="edit-task-priority" name="editPriority" value={editPriority}
                                        onChange={(
                                            event
                                        ) =>
                                            setEditPriority(
                                                event.target.value
                                            )
                                        }
                                    >

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


                                    <label htmlFor="edit-task-status">
                                        Status
                                    </label>


                                    <select id="edit-task-status" name="editStatus" value={editStatus}
                                        onChange={(
                                            event
                                        ) =>
                                            setEditStatus(
                                                event.target.value
                                            )
                                        }
                                    >

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


                                    <label htmlFor="edit-task-due-date">
                                        Due Date
                                    </label>


                                    <input id="edit-task-due-date" name="editDueDate" type="date" value={editDueDate}
                                        onChange={(
                                            event
                                        ) =>
                                            setEditDueDate(
                                                event.target.value
                                            )
                                        }
                                    />


                                    <label htmlFor="edit-task-assignee">
                                        Assignee
                                    </label>


                                    <select id="edit-task-assignee" name="editAssigneeId" value={editAssigneeId}
                                        onChange={(
                                            event
                                        ) =>
                                            setEditAssigneeId(
                                                event.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Unassigned
                                        </option>


                                        {members.map(
                                            (member) => (

                                                <option
                                                    key={
                                                        member.user_id
                                                    }
                                                    value={
                                                        member.user_id
                                                    }
                                                >

                                                    {
                                                        member.name
                                                    }

                                                    {" ("}

                                                    {
                                                        member.email
                                                    }

                                                    {")"}

                                                </option>

                                            )
                                        )}

                                    </select>


                                    <div className="edit-task-actions">


                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditingTask(
                                                    null
                                                )
                                            }
                                        >

                                            Cancel

                                        </button>


                                        <button
                                            type="submit"
                                            disabled={
                                                updatingTask
                                            }
                                        >

                                            {updatingTask
                                                ? "Updating..."
                                                : "Update Task"}

                                        </button>

                                    </div>

                                </form>

                            </div>

                        </div>

                    )}

                </div>

            </Layout>
        );
    }


    /* =====================================================
    TASK COLUMN
    ===================================================== */

    function TaskColumn({
        title,
        tasks = [],
        members = [],
        onStatusChange,
        onDelete,
        onEdit,
        deletingTaskId,
        updatingTaskId,
        comments,
        commentInputs,
        commentLoading,
        commentSubmitting,
        onLoadComments,
        onCommentInputChange,
        onAddComment,
    }) {
        const safeTasks = Array.isArray(tasks) ? tasks : [];
        const safeMembers = Array.isArray(members) ? members : [];

        return (

            <div className="task-column">

                <div className="task-column-header">

                    <h3>{title}</h3>

                    <span>{safeTasks.length}</span>

                </div>

                <div className="task-list">

                    {safeTasks.length === 0 && (
                        <p className="no-tasks">
                            No tasks
                        </p>
                    )}

                    {safeTasks.map((task) => (

                        <div
                            className="task-card"
                            key={task.id}
                        >

                            <div className="task-card-top">

                                <span
                                    className={`priority-${(task.priority || "Medium").toLowerCase()}`}
                                >
                                    {task.priority}
                                </span>

                                <div>

                                    <button
                                        type="button"
                                        className="edit-task-button"
                                        onClick={() => onEdit(task)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        className="delete-task-button"
                                        onClick={() => onDelete(task.id)}
                                        disabled={deletingTaskId === task.id}
                                        title={
                                            deletingTaskId === task.id
                                                ? "Deleting task..."
                                                : "Delete task"
                                        }
                                    >
                                        {deletingTaskId === task.id ? "Deleting..." : "🗑"}
                                    </button>

                                </div>

                            </div>

                            <h4>{task.title}</h4>

                            {task.description && (
                                <p>{task.description}</p>
                            )}

                            {task.assignee_id && (
                                <small>
                                    Assigned to{" "}
                                    {safeMembers.find(
                                        (member) =>
                                            Number(member.user_id) ===
                                            Number(task.assignee_id)
                                    )?.name || "Unknown user"}
                                </small>
                            )}

                            {task.due_date && (
                                <small>
                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                </small>
                            )}

                            <select
                                value={task.status || "To Do"}
                                onChange={(event) =>
                                    onStatusChange(
                                        task,
                                        event.target.value
                                    )
                                }
                                disabled={updatingTaskId === task.id}
                                title={
                                    updatingTaskId === task.id
                                        ? "Updating task..."
                                        : "Change task status"
                                }
                            >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>

                            {/* COMMENTS */}
                            <div className="task-comments">

                                <button
                                    type="button"
                                    className="comments-toggle-button"
                                    onClick={() => onLoadComments(task.id)}
                                    disabled={commentLoading[task.id]}
                                >
                                    {commentLoading[task.id]
                                        ? "Loading..."
                                        : comments[task.id]
                                            ? "Refresh Comments"
                                            : "View Comments"}
                                </button>

                                {comments[task.id] && (
                                    <div className="comments-section">

                                        {comments[task.id].length === 0 ? (
                                            <p className="no-comments">
                                                No comments yet.
                                            </p>
                                        ) : (
                                            comments[task.id].map((comment) => (
                                                <div
                                                    className="comment-item"
                                                    key={comment.id}
                                                >
                                                    <strong>
                                                        {comment.author?.name ||
                                                            comment.user?.name ||
                                                            comment.author_name ||
                                                            "User"}
                                                    </strong>

                                                    <p>{comment.content}</p>

                                                    {comment.created_at && (
                                                        <small>
                                                            {new Date(
                                                                comment.created_at
                                                            ).toLocaleString()}
                                                        </small>
                                                    )}
                                                </div>
                                            ))
                                        )}

                                        <div className="comment-input-row">

                                            <input id={`comment-${task.id}`} name={`comment-${task.id}`} type="text" value={commentInputs[task.id] || ""}
                                                onChange={(event) =>
                                                    onCommentInputChange(
                                                        task.id,
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Write a comment..."
                                                disabled={commentSubmitting[task.id]}
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key === "Enter" &&
                                                        !event.shiftKey
                                                    ) {
                                                        event.preventDefault();
                                                        onAddComment(task.id);
                                                    }
                                                }}
                                            />

                                            <button
                                                type="button"
                                                disabled={
                                                    commentSubmitting[task.id] ||
                                                    !(commentInputs[task.id] || "").trim()
                                                }
                                                onClick={() => onAddComment(task.id)}
                                            >
                                                {commentSubmitting[task.id]
                                                    ? "Posting..."
                                                    : "Comment"}
                                            </button>

                                        </div>

                                    </div>
                                )}

                            </div>

                        </div>

                    ))}

                </div>

            </div>
        );
    }


    export default ProjectDetail;
