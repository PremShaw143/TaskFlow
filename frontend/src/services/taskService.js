import { apiRequest } from "./api";


// ==========================================
// Get Tasks
// ==========================================

export async function getTasks(projectId, params = {}) {

    const query = new URLSearchParams();

    if (params.status) {
        query.append("status", params.status);
    }

    if (params.assignee_id) {
        query.append("assignee_id", params.assignee_id);
    }

    if (params.priority) {
        query.append("priority", params.priority);
    }

    if (params.search) {
        query.append("search", params.search);
    }

    if (params.page) {
        query.append("page", params.page);
    }

    if (params.page_size) {
        query.append("page_size", params.page_size);
    }

    if (params.sort_by) {
        query.append("sort_by", params.sort_by);
    }

    if (params.sort_order) {
        query.append("sort_order", params.sort_order);
    }

    const queryString = query.toString();

    return await apiRequest(
        `/projects/${projectId}/tasks${
            queryString
                ? `?${queryString}`
                : ""
        }`
    );
}


// ==========================================
// Create Task
// ==========================================

export async function createTask(
    projectId,
    taskData
) {

    return await apiRequest(
        `/projects/${projectId}/tasks`,
        {
            method: "POST",

            body: JSON.stringify(taskData),
        }
    );
}


// ==========================================
// Update Task
// ==========================================

export async function updateTask(
    projectId,
    taskId,
    taskData
) {

    return await apiRequest(
        `/projects/${projectId}/tasks/${taskId}`,
        {
            method: "PUT",

            body: JSON.stringify(taskData),
        }
    );
}


// ==========================================
// Delete Task
// ==========================================

export async function deleteTask(
    projectId,
    taskId
) {

    return await apiRequest(
        `/projects/${projectId}/tasks/${taskId}`,
        {
            method: "DELETE",
        }
    );
}


// ==========================================
// Get Comments
// ==========================================

export async function getComments(
    projectId,
    taskId
) {

    return await apiRequest(
        `/projects/${projectId}/tasks/${taskId}/comments`
    );
}


// ==========================================
// Create Comment
// ==========================================

export async function createComment(
    projectId,
    taskId,
    content
) {

    return await apiRequest(
        `/projects/${projectId}/tasks/${taskId}/comments`,
        {
            method: "POST",

            body: JSON.stringify({
                content: content,
            }),
        }
    );
}