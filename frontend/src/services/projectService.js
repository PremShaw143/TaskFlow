import { apiRequest } from "./api";


// Get all projects
export async function getProjects() {
    return await apiRequest("/projects");
}


// Get one project
export async function getProject(projectId) {
    return await apiRequest(
        `/projects/${projectId}`
    );
}


// Create project
export async function createProject(
    name,
    description,
    priority
) {
    return await apiRequest("/projects", {
        method: "POST",
        body: JSON.stringify({
            name,
            description: description || null,
            priority: priority || "Medium",
        }),
    });
}


// Get project members
export async function getProjectMembers(
    projectId
) {
    return await apiRequest(
        `/projects/${projectId}/members`
    );
}


// Invite member
export async function inviteMember(
    projectId,
    email
) {
    return await apiRequest(
        `/projects/${projectId}/members/invite`,
        {
            method: "POST",
            body: JSON.stringify({
                email,
            }),
        }
    );
}


// Remove member
export async function removeMember(
    projectId,
    userId
) {
    return await apiRequest(
        `/projects/${projectId}/members/${userId}`,
        {
            method: "DELETE",
        }
    );
}


// Get project activity
export async function getProjectActivity(
    projectId
) {
    return await apiRequest(
        `/projects/${projectId}/activities`
    );
}


// Delete project
export async function deleteProject(
    projectId
) {
    return await apiRequest(
        `/projects/${projectId}`,
        {
            method: "DELETE",
        }
    );
}