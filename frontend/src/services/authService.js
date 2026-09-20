import { apiRequest } from "./api";

export async function registerUser(name, email, password) {
    return await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
            name,
            email,
            password,
        }),
    });
}

export async function loginUser(email, password) {
    const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email,
            password,
        }),
    });

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);

    return data;
}

export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
        throw new Error("Refresh token not found");
    }

    const data = await apiRequest("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({
            refresh_token: refreshToken,
        }),
    });

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);

    return data;
}

export function logoutUser() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
}