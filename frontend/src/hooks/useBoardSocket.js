const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const WS_URL = API_URL.replace(/^http/, "ws");
import { useEffect, useRef } from "react";

export default function useBoardSocket({
    projectId = null,
    userId = null,
    userSocket = false,
    onMessage,
}) {
    const socketRef = useRef(null);
    const onMessageRef = useRef(onMessage);

    // Always keep the latest callback
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            console.log("WebSocket: access token not found");
            return;
        }

        let socketUrl = "";

        // User-specific WebSocket
        if (userSocket && userId) {
            socketUrl =
    `${WS_URL}/ws/users/${userId}?token=${token}`;
        }

        // Project-specific WebSocket
        else if (projectId) {
            socketUrl =
    `${WS_URL}/ws/projects/${projectId}?token=${token}`;
        }

        else {
            return;
        }

        console.log("Opening WebSocket:", socketUrl);

        const socket = new WebSocket(socketUrl);

        socketRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket connected:", socketUrl);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                console.log(
                    "WebSocket event:",
                    data
                );

                if (onMessageRef.current) {
                    onMessageRef.current(data);
                }
            } catch (error) {
                console.error(
                    "WebSocket message error:",
                    error
                );
            }
        };

        socket.onerror = () => {
            console.error("WebSocket encountered an error.");
};

        socket.onclose = (event) => {
            console.log(
        `WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`
    );

            if (event.code === 1006) {
        console.warn(
            "WebSocket closed abnormally. Check the backend server or connection."
        );
    }
};

        return () => {
    console.log("Closing WebSocket:", socketUrl);

            if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
    ) {
        socket.close(1000, "Component unmounted");
    }

            socketRef.current = null;
};
    }, [
        projectId,
        userId,
        userSocket,
    ]);

    return socketRef;
}