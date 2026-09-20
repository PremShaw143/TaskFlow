import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    loginUser,
    registerUser,
    refreshAccessToken,
    logoutUser,
} from "../services/authService";

import { apiRequest } from "../services/api";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    // ---------------------------------------------
    // Load current logged-in user
    // ---------------------------------------------

    async function loadUser() {

        try {

            const data = await apiRequest("/me");

            setUser(data);

            return true;

        } catch (error) {

            setUser(null);

            return false;
        }
    }


    // ---------------------------------------------
    // Initialize authentication
    // ---------------------------------------------

    useEffect(() => {

        async function initializeAuth() {

            const accessToken =
                localStorage.getItem("access_token");

            const refreshToken =
                localStorage.getItem("refresh_token");


            // No tokens
            if (!accessToken || !refreshToken) {

                setLoading(false);

                return;
            }


            // First try existing access token
            const userLoaded = await loadUser();

            if (userLoaded) {

                setLoading(false);

                return;
            }


            // Access token may be expired.
            // Try refresh token.
            try {

                await refreshAccessToken();

                await loadUser();

            } catch (error) {

                console.log(
                    "Session refresh failed:",
                    error.message
                );

                logoutUser();

                setUser(null);
            }


            setLoading(false);
        }


        initializeAuth();

    }, []);


    // ---------------------------------------------
    // Login
    // ---------------------------------------------

    async function login(email, password) {

        await loginUser(
            email,
            password
        );

        await loadUser();
    }


    // ---------------------------------------------
    // Register
    // ---------------------------------------------

    async function register(
        name,
        email,
        password
    ) {

        return await registerUser(
            name,
            email,
            password
        );
    }


    // ---------------------------------------------
    // Manual refresh
    // ---------------------------------------------

    async function refresh() {

        await refreshAccessToken();

        await loadUser();
    }


    // ---------------------------------------------
    // Logout
    // ---------------------------------------------

    function logout() {

        logoutUser();

        setUser(null);
    }


    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                refresh,
                logout,
                isAuthenticated:
                    Boolean(user),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {

    return useContext(AuthContext);
}