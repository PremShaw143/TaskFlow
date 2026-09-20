const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


// Stores the refresh request while it is running.
// Multiple API requests will wait for the same refresh.
let refreshPromise = null;


// --------------------------------------------------
// Make basic API request
// --------------------------------------------------

async function makeRequest(
    endpoint,
    options = {},
    token = null
) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {

        const response = await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,
                headers,
            }
        );

        return response;

    } catch (error) {

        console.error(
            "API connection error:",
            error
        );

        throw new Error(
            `Cannot connect to backend. Please make sure FastAPI is running at ${API_URL}.`
        );
    }
}


// --------------------------------------------------
// Refresh access token
// --------------------------------------------------

async function refreshSession() {

    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {

        const refreshToken =
            localStorage.getItem("refresh_token");

        if (!refreshToken) {

            throw new Error(
                "Refresh token not found"
            );
        }


        const response = await makeRequest(
            "/auth/refresh",
            {
                method: "POST",
                body: JSON.stringify({
                    refresh_token: refreshToken,
                }),
            }
        );


        const data =
            await response.json().catch(
                () => null
            );


        if (!response.ok) {

            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "refresh_token"
            );

            throw new Error(
                data?.detail ||
                "Session expired. Please login again."
            );
        }


        localStorage.setItem(
            "access_token",
            data.access_token
        );

        localStorage.setItem(
            "refresh_token",
            data.refresh_token
        );


        return data;

    })();


    try {

        return await refreshPromise;

    } finally {

        refreshPromise = null;

    }
}


// --------------------------------------------------
// Main API function
// --------------------------------------------------

export async function apiRequest(
    endpoint,
    options = {}
) {

    let accessToken =
        localStorage.getItem("access_token");


    // ------------------------------------------------
    // First request
    // ------------------------------------------------

    let response = await makeRequest(
        endpoint,
        options,
        accessToken
    );


    // ------------------------------------------------
    // Access token expired
    // ------------------------------------------------

    if (
        response.status === 401 &&
        endpoint !== "/auth/refresh"
    ) {

        try {

            // If another request is already refreshing,
            // wait for that same refresh request.
            const refreshData =
                await refreshSession();


            accessToken =
                refreshData.access_token;


            // Retry original request
            response = await makeRequest(
                endpoint,
                options,
                accessToken
            );

        } catch (error) {

            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "refresh_token"
            );

            throw new Error(
                error.message ||
                "Session expired. Please login again."
            );
        }
    }


    // ------------------------------------------------
    // Read response
    // ------------------------------------------------

    const data =
        await response.json().catch(
            () => null
        );


    // ------------------------------------------------
    // Handle API errors
    // ------------------------------------------------

    if (!response.ok) {

        throw new Error(
            data?.detail ||
            `Request failed (${response.status})`
        );
    }


    return data;
}


export { API_URL };