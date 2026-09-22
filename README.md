# TaskFlow — Full-Stack Task Management System

TaskFlow is a full-stack, real-time task management application built with React, FastAPI, PostgreSQL, JWT authentication, and WebSockets.

It provides a Trello/Jira-style platform where teams can create projects, manage members, assign tasks, collaborate through comments, and receive real-time updates.

## 🎥 Demo

[Watch the TaskFlow Demo](https://youtu.be/8po67Lk8BWc?si=E50frszcuRXNQ9b_)

[GitHub Repository](https://github.com/PremShaw143/TaskFlow)

## 🚀 Features

### 🔐 Authentication & Security

* User registration and login
* Password hashing using bcrypt
* JWT access tokens
* Refresh-token authentication
* Protected API endpoints
* Project-level membership authorization
* Owner/member role-based access
* Secure environment variables

### 📁 Project Management

* Create, update, and delete projects
* Set project priority
* Add and remove project members
* Invite registered users by email
* Owner and member roles
* Automatic task cleanup when a project is deleted

### ✅ Task Management

* Create, update, and delete tasks
* Task title and description
* Status: To Do, In Progress, Done
* Priority: High, Medium, Low
* Assign tasks to project members
* Due-date support
* Search tasks by title
* Filter by status, priority, and assignee
* Sorting by priority, due date, and creation date
* Pagination
* completed_at tracking

### 💬 Collaboration

* Project comments
* Activity tracking
* Member invitation/removal events
* Automatic task unassignment when a member is removed
* Shared project task management

### ⚡ Real-Time Updates

TaskFlow uses WebSockets for real-time communication.

| Event          | Description              |
| -------------- | ------------------------ |
| Task Created   | New task notification    |
| Task Updated   | Task changes             |
| Task Deleted   | Task removal             |
| Task Assigned  | Assignment updates       |
| Member Invited | New member notification  |
| Member Removed | Member removal           |
| Comment Added  | New comment notification |

### 📊 Dashboard

The dashboard provides:

* Total project count
* Assigned tasks by status
* Tasks completed this week
* Project with most open tasks
* Recent activity
* Assigned-to-me tasks

## 🛠️ Tech Stack

| Category       | Technologies                       |
| -------------- | ---------------------------------- |
| Frontend       | React, Vite, JavaScript, HTML, CSS |
| Backend        | Python, FastAPI, Pydantic          |
| Database       | PostgreSQL                         |
| ORM            | SQLAlchemy                         |
| Authentication | JWT, bcrypt                        |
| Real-Time      | WebSockets                         |
| Migrations     | Alembic                            |
| API            | REST APIs, OpenAPI                 |
| DevOps         | Docker, Docker Compose, Nginx      |
| Tools          | Git, GitHub, VS Code               |

## 🏗️ Architecture

React Frontend → REST API / WebSocket → FastAPI Backend → SQLAlchemy → PostgreSQL

 

## 📂 Project Structure

```text
TaskFlow/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── activity.py
│   │   │   ├── comment.py
│   │   │   ├── membership.py
│   │   │   ├── project.py
│   │   │   ├── refresh_token.py
│   │   │   ├── task.py
│   │   │   └── user.py
│   │   │
│   │   ├── routers/
│   │   │   ├── assigned.py
│   │   │   ├── auth.py
│   │   │   ├── dashboard.py
│   │   │   ├── projects.py
│   │   │   └── tasks.py
│   │   │
│   │   ├── schemas/
│   │   ├── auth.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── main.py
│   │   └── websocket.py
│   │
│   ├── alembic/
│   ├── seed.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🔑 Authentication Flow
``` text
User Login
↓
Access Token + Refresh Token
↓
Access Token used for API requests
↓
Access Token expires
↓
Refresh Token
↓
New Access Token
```

## 🔒 Authorization

### Project Owner

* Update project
* Invite members
* Remove members
* Delete project
* Manage project operations

### Project Member

* View project
* Create and update permitted tasks
* Work on assigned tasks
* Add comments

### Task Completion

Only the task assignee or project owner can mark a task as Done.

## ⚡ WebSocket

Project WebSocket:

/ws/projects/{project_id}?token={access_token}

User WebSocket:

/ws/users/{user_id}?token={access_token}

WebSocket connections are authenticated using JWT and project membership is verified before allowing project-level communication.

## 🗃️ Database Design

```text
User
├── Membership
│   └── Project
│       ├── Task
│       │   └── Comment
│       └── Activity
│
└── Refresh Token
```
### Core Tables

| Table               | Purpose                    |
| ------------------- | -------------------------- |
| users               | User accounts              |
| projects            | Project information        |
| project_memberships | User-project relationships |
| tasks               | Project tasks              |
| comments            | Task comments              |
| activities          | Project activity history   |
| refresh_tokens      | Refresh-token storage      |

## 🔎 Task Search & Filtering

Task management supports:

* Title search
* Status filtering
* Priority filtering
* Assignee filtering
* Pagination
* Priority sorting
* Due-date sorting
* Creation-date sorting

## 🌐 API Overview

### Authentication

POST /auth/register
POST /auth/login
POST /auth/refresh
GET /me

### Projects

GET /projects
POST /projects
GET /projects/{project_id}
PUT /projects/{project_id}
DELETE /projects/{project_id}

### Members

GET /projects/{project_id}/members
POST /projects/{project_id}/members
DELETE /projects/{project_id}/members/{user_id}

### Tasks

GET /projects/{project_id}/tasks
POST /projects/{project_id}/tasks
PUT /projects/{project_id}/tasks/{task_id}
DELETE /projects/{project_id}/tasks/{task_id}

## ⚙️ Getting Started

### Requirements

* Python 3.13+
* Node.js 22+
* PostgreSQL
* Git
* Docker (optional)

### 1. Clone Repository

git clone https://github.com/PremShaw143/TaskFlow.git
cd TaskFlow

### 2. Backend Setup

cd backend
python -m venv .venv

Windows:
.venv\Scripts\activate

pip install -r requirements.txt

### 3. Configure Environment

Create:

backend/.env

Example:

DATABASE_URL=postgresql://username:password@localhost:5432/taskflow
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

### 4. Database Setup

Create a PostgreSQL database named:

taskflow

Run migrations:

alembic upgrade head

Optional seed:

python seed.py

### 5. Start Backend

uvicorn app.main:app --reload

Backend:

http://127.0.0.1:8000

API Documentation:

http://127.0.0.1:8000/docs

### 6. Start Frontend

cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173

## 🐳 Docker

Run the complete application using:

docker compose up --build

This starts the required application services using Docker Compose.

## 💡 Key Implementation Decisions

### FastAPI

Used for:

* REST APIs
* Request validation
* OpenAPI documentation
* Authentication
* WebSockets

### PostgreSQL

Used for:

* Relational data
* Foreign-key relationships
* Transactions
* Data consistency

### SQLAlchemy

Provides database abstraction and ORM-based database operations.

### React

Used to build the responsive frontend and reusable UI components.

### WebSockets

Used instead of polling to provide real-time project and task updates.

## 🧠 Challenging Parts

The major implementation challenges included:

1. Project-level authorization
2. Task assignment validation
3. Member removal handling
4. Task completion permissions
5. Real-time WebSocket synchronization
6. Access-token expiration and refresh
7. Keeping frontend state synchronized with backend updates

## 🤖 AI Usage

AI tools were used as a development assistant for:

* Debugging
* API review
* Frontend validation
* Accessibility suggestions
* Architecture discussions
* Development guidance

The architecture, integration, testing, debugging, and final implementation were reviewed and adapted during development.

## 🔮 Future Improvements

* Drag-and-drop task management
* Email invitations
* Notifications
* File attachments
* Team analytics
* Automated tests
* CI/CD pipeline
* Monitoring and logging
* Redis-based WebSocket scaling
* Improved WebSocket reconnection and state recovery

## 📌 Demo Flow
``` text
Register Users
↓
Create Project
↓
Invite Member
↓
Create & Assign Task
↓
Update Task Status
↓
Real-Time Update
↓
Add Comment
↓
View Activity
↓
Check Dashboard
```
## 👨‍💻 Author

Prem Kumar Shaw

* GitHub: https://github.com/PremShaw143
* LinkedIn: https://www.linkedin.com/in/PremShaw/
* LeetCode: https://leetcode.com/u/Prembwubtd/

## 📄 License

This project was developed as a software assessment/project. No separate open-source license is currently included.
