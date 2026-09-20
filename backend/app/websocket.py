from fastapi import WebSocket


class ConnectionManager:

    def __init__(self):
        # Project-based connections
        self.project_connections = {}

        # User-based connections
        self.user_connections = {}

    # --------------------------------
    # Project WebSocket
    # --------------------------------

    async def connect_project(
        self,
        project_id: int,
        websocket: WebSocket
    ):
        await websocket.accept()

        if project_id not in self.project_connections:
            self.project_connections[project_id] = []

        self.project_connections[project_id].append(websocket)

    def disconnect_project(
        self,
        project_id: int,
        websocket: WebSocket
    ):
        if project_id in self.project_connections:

            if websocket in self.project_connections[project_id]:
                self.project_connections[project_id].remove(websocket)

            if not self.project_connections[project_id]:
                del self.project_connections[project_id]

    # --------------------------------
    # User WebSocket
    # --------------------------------

    async def connect_user(
        self,
        user_id: int,
        websocket: WebSocket
    ):
        await websocket.accept()

        if user_id not in self.user_connections:
            self.user_connections[user_id] = []

        self.user_connections[user_id].append(websocket)

    def disconnect_user(
        self,
        user_id: int,
        websocket: WebSocket
    ):
        if user_id in self.user_connections:

            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)

            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

    # --------------------------------
    # Broadcast to Project
    # --------------------------------

    async def broadcast_project(
        self,
        project_id: int,
        message: dict
    ):
        connections = self.project_connections.get(
            project_id,
            []
        )

        for connection in connections:
            await connection.send_json(message)

    # --------------------------------
    # Broadcast to User
    # --------------------------------

    async def broadcast_user(
        self,
        user_id: int,
        message: dict
    ):
        connections = self.user_connections.get(
            user_id,
            []
        )

        for connection in connections:
            await connection.send_json(message)


manager = ConnectionManager()