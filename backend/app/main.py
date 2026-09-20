from fastapi import (
    FastAPI,
    Depends,
    WebSocket,
    WebSocketDisconnect
)

from jose import jwt, JWTError
from fastapi.middleware.cors import CORSMiddleware
from app.dependencies import get_current_user
from app.models.user import User
from app.models.membership import ProjectMembership
from app.routers.dashboard import router as dashboard_router
from app.routers.auth import router as auth_router
from app.routers.projects import router as projects_router
from app.routers.tasks import router as tasks_router

from app.auth import ALGORITHM
from app.database import SessionLocal, settings
from app.websocket import manager
from app.routers import assigned


app = FastAPI(
    title="TaskFlow API",
    description="Collaborative task management application",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://taskflow-frontend-mi4v.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------------
# Routers
# -----------------------------

app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(tasks_router)
app.include_router(dashboard_router)
app.include_router(assigned.router)


# -----------------------------
# Basic Routes
# -----------------------------

@app.get("/")
def root():
    return {
        "message": "TaskFlow API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }


# -----------------------------
# WebSocket
# -----------------------------

@app.websocket("/ws/projects/{project_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    project_id: int
):
    print("WebSocket request received")

    token = websocket.query_params.get("token")

    if not token:
        print("WebSocket: No token provided")
        await websocket.close(code=1008)
        return

    db = SessionLocal()

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        print("Token decoded successfully")

        if payload.get("type") != "access":
            print("WebSocket: Invalid token type")
            await websocket.close(code=1008)
            return

        user_id = payload.get("sub")

        if not user_id:
            print("WebSocket: No user ID in token")
            await websocket.close(code=1008)
            return

        print("User ID:", user_id)

        user = (
            db.query(User)
            .filter(User.id == int(user_id))
            .first()
        )

        if not user:
            print(
                "WebSocket: User not found:",
                user_id
            )
            await websocket.close(code=1008)
            return

        membership = (
            db.query(ProjectMembership)
            .filter(
                ProjectMembership.project_id == project_id,
                ProjectMembership.user_id == user.id
            )
            .first()
        )

        if not membership:
            print(
                "WebSocket: User is not a member",
                user.id,
                "Project:",
                project_id
            )
            await websocket.close(code=1008)
            return

        print(
            "Membership verified for user",
            user.id,
            "Project:",
            project_id
        )

        await manager.connect_project(
            project_id,
            websocket
        )

        print("WebSocket connected successfully")

        await websocket.send_json({
            "event": "connected",
            "project_id": project_id,
            "user_id": user.id
        })

        try:
            while True:
                await websocket.receive_text()

        except WebSocketDisconnect:

            print(
                "WebSocket disconnected:",
                user.id,
                "Project:",
                project_id
            )

            manager.disconnect_project(
                project_id,
                websocket
            )

    except JWTError as error:

        print(
            "WebSocket JWT error:",
            error
        )

        await websocket.close(code=1008)

    except Exception as error:

        print(
            "WebSocket error:",
            error
        )

        await websocket.close(code=1011)

    finally:
        db.close()
        
@app.websocket("/ws/users/{user_id}")
async def user_websocket_endpoint(
    websocket: WebSocket,
    user_id: int
):
    print("User WebSocket request received")

    token = websocket.query_params.get("token")

    if not token:
        print("User WebSocket: No token provided")
        await websocket.close(code=1008)
        return

    db = SessionLocal()

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        if payload.get("type") != "access":
            print("User WebSocket: Invalid token type")
            await websocket.close(code=1008)
            return

        token_user_id = payload.get("sub")

        if not token_user_id:
            print("User WebSocket: No user ID")
            await websocket.close(code=1008)
            return

        token_user_id = int(token_user_id)

        # User can only connect to their own user channel
        if token_user_id != user_id:
            print("User WebSocket: User ID mismatch")
            await websocket.close(code=1008)
            return

        user = (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )

        if not user:
            print("User WebSocket: User not found")
            await websocket.close(code=1008)
            return

        await manager.connect_user(
            user_id,
            websocket
        )

        print(
            "User WebSocket connected:",
            user_id
        )

        await websocket.send_json({
            "event": "user_connected",
            "user_id": user_id
        })

        try:
            while True:
                await websocket.receive_text()

        except WebSocketDisconnect:
            print(
                "User WebSocket disconnected:",
                user_id
            )

            manager.disconnect_user(
                user_id,
                websocket
            )

    except JWTError as error:
        print(
            "User WebSocket JWT error:",
            error
        )

        await websocket.close(code=1008)

    except Exception as error:
        print(
            "User WebSocket error:",
            error
        )

        await websocket.close(code=1011)

    finally:
        db.close()