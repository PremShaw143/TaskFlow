🚀 TaskFlow

A full-stack, real-time project and task management platform for modern teams.
Built with React, FastAPI, PostgreSQL, JWT Authentication & WebSockets.

<p align="center">
  <a href="https://youtu.be/8po67Lk8BWc?si=E50frszcuRXNQ9b_">
    <img src="https://img.shields.io/badge/▶️_Watch_Demo-YouTube-red?style=for-the-badge&logo=youtube&logoColor=white" alt="Watch Demo">
  </a>
  <a href="https://github.com/PremShaw143/TaskFlow">
    <img src="https://img.shields.io/badge/💻_GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repository">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%7C%20JavaScript%20%7C%20Vite-61DAFB?style=flat-square&logo=react&logoColor=black" alt="Frontend">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="Backend">
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="Database">
  <img src="https://img.shields.io/badge/Real--Time-WebSockets-6A1B9A?style=flat-square" alt="WebSockets">
  <img src="https://img.shields.io/badge/DevOps-Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker">
</p>

✨ What is TaskFlow?

TaskFlow is a Trello/Jira-style task management platform designed for teams to:

Create and manage projects

Manage project members

Assign and track tasks

Collaborate through comments

Track project activity

Receive real-time updates across multiple users

Monitor progress through a dashboard

🌟 Key Highlights

🔐 Secure

⚡ Real-Time

👥 Collaborative

📊 Insightful

JWT, refresh tokens & role-based access

WebSocket-powered live updates

Projects, members, tasks, comments & activity

Dashboard, filtering, sorting & task analytics

🆕 Latest Features

🔐 JWT Authentication & Refresh Tokens — secure sessions and protected APIs.

👥 Project Membership & Authorization — owner/member roles with project-level access control.

⚡ Real-Time Collaboration — authenticated WebSockets for live updates.

💬 Comments & Activity Feed — project collaboration and chronological activity tracking.

📊 Dashboard & Assigned Tasks — task summaries, recent activity, and assigned-task view.

🔎 Advanced Task Management — search, filtering, sorting, pagination, priorities, due dates, and assignments.

🐳 Dockerized Development — Dockerfiles and Docker Compose support.

🗃️ Database Migrations — Alembic-based PostgreSQL schema migrations.

✨ Features

🔐 Authentication & Security

User registration and login

Password hashing with bcrypt

JWT access-token authentication

Refresh-token flow

Protected API endpoints

Project-level membership authorization

Owner/member role enforcement

Secure environment-variable configuration

📁 Project Management

Create and edit projects

Project priority: 🔴 High / 🟡 Medium / 🟢 Low

Project owner and member roles

Invite registered users by email

View and remove project members

Delete projects

Automatic task cleanup when a project is deleted

✅ Task Management

Create, update, and delete tasks

Task title and description

Status: To Do → In Progress → Done

Priority: High / Medium / Low

Optional due dates

Assign tasks to project members

Search tasks by title

Filter by status, assignee, and priority

Server-side pagination

Sort by priority, due date, and created date

Automatic completed_at tracking

Assignee and due-date validation

👥 Team Collaboration

Shared project workspace

Task assignment

Comments for project members

Activity tracking

Member invitation/removal events

Automatic task unassignment when a member is removed

⚡ Real-Time Updates

TaskFlow uses authenticated WebSockets for live updates.

Event

Real-Time Update

Task created

✅

Task updated

✅

Task deleted

✅

Task assigned

✅

Member invited

✅

Member removed

✅

Comment added

✅

Project WebSockets are authenticated and project-scoped.

User-level WebSockets support personal events such as task assignments.

📊 Dashboard

The dashboard provides:

Total project count

Assigned tasks by status

Tasks completed this week

Project with the most open tasks

Recent activity

🎨 User Interface

Responsive React interface

Modern dark UI

Clear priority indicators

Loading states

Error handling

Inline validation

Disabled states during requests

Confirmation prompts for destructive actions

🏗️ Architecture

                     ┌─────────────────────┐
                     │      Browser        │
                     │   React Frontend    │
                     └──────────┬──────────┘
                                │
                 HTTP REST API  │  WebSocket
                                │
                 ┌──────────────▼──────────────┐
                 │        FastAPI Backend      │
                 │                             │
                 │  Authentication             │
                 │  Projects & Memberships     │
                 │  Tasks                      │
                 │  Comments                   │
                 │  Activity                   │
                 │  Dashboard                  │
                 │  WebSockets                 │
                 └──────────────┬──────────────┘
                                │
                          SQLAlchemy
                                │
                 ┌──────────────▼──────────────┐
                 │       PostgreSQL            │
                 │                             │
                 │ Users                       │
                 │ Projects                    │
                 │ Memberships                 │
                 │ Tasks                       │
                 │ Comments                    │
                 │ Activities                  │
                 │ Refresh Tokens              │
                 └─────────────────────────────┘

🛠️ Tech Stack

Area

Technologies

Frontend

React, Vite, JavaScript, CSS, WebSocket API

Backend

Python, FastAPI, SQLAlchemy, Pydantic, JWT, bcrypt, WebSockets

Database

PostgreSQL, Alembic

DevOps

Docker, Docker Compose, Nginx

Tools

Git, GitHub, VS Code, Swagger / OpenAPI

📂 Project Structure

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
│   │   └── versions/
│   ├── seed.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
├── .gitignore
└── README.md

🚦 Getting Started

Prerequisites

Python 3.13+

Node.js 22+

PostgreSQL

Git

Docker Desktop (optional)

1. Clone the Repository

git clone https://github.com/PremShaw143/TaskFlow.git
cd TaskFlow

2. Backend Setup

cd backend
python -m venv .venv

Windows:

.\.venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt

3. Configure Environment Variables

Create:

backend/.env

Use .env.example as the template.

Example:

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskflow
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

⚠️ Never commit the real .env file.

4. Create the Database

Create a PostgreSQL database named:

taskflow

Run migrations:

alembic upgrade head

5. Seed Demo Data

python seed.py

The seed script creates reusable demo users, a shared project, memberships, and sample tasks for local development.

Demo credentials are intentionally not included in this README. Configure your own local credentials when using the seed script.

6. Start the Backend

uvicorn app.main:app --reload

Backend:

http://127.0.0.1:8000

Swagger API documentation:

http://127.0.0.1:8000/docs

7. Frontend Setup

Open another terminal:

cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173

🐳 Running with Docker

From the project root:

docker compose up --build

Service

URL

Frontend

http://localhost:5173

Backend

http://localhost:8000

Swagger

http://localhost:8000/docs

The current Docker Compose setup uses PostgreSQL running separately from the application containers.

🔑 Authentication Flow

TaskFlow uses short-lived access tokens together with refresh tokens.

Login
  │
  ▼
FastAPI validates credentials
  │
  ├── Access Token
  │      └── Short lifetime
  │
  └── Refresh Token
         └── Longer lifetime
                │
                ▼
        Access token expires
                │
                ▼
        Frontend requests
        /auth/refresh
                │
                ▼
        New access token

The frontend automatically uses the access token for protected API requests and can request a new access token through /auth/refresh.

🔒 Authorization Model

Each project has two roles:

Role

Permissions

Owner

Update project, invite/remove members, delete project, owner-level operations

Member

View project, work with tasks, create/update permitted tasks, add comments

Task completion rule: Only the task assignee or project owner can move a task to Done.

🔄 WebSocket Design

Project WebSocket

/ws/projects/{project_id}?token={access_token}

The backend:

Validates the JWT

Identifies the user

Checks project membership

Creates a project-scoped connection

User WebSocket

/ws/users/{user_id}?token={access_token}

Used for user-specific events such as task assignments.

Example Event

{
  "event": "task_assigned",
  "project_id": 7,
  "task_id": 6,
  "assignee_id": 11
}

📡 Real-Time Event Flow

Example: User A creates a task.

User A
  │
  ▼
React
  │
  ▼
POST /projects/{id}/tasks
  │
  ▼
FastAPI
  │
  ├── Validate membership
  ├── Create task
  ├── Store activity
  └── Broadcast WebSocket event
              │
              ▼
        Project members
              │
              ▼
       React receives event
              │
              ▼
        Board refreshes

This allows multiple users to work on the same project while seeing changes without manually refreshing the page.

🗃️ Data Model

User
 │
 ├───────────────┐
 │               │
 ▼               ▼
Membership     RefreshToken
 │
 ▼
Project
 │
 ├──────────────► Task
 │                  │
 │                  └────► Comment
 │
 └──────────────► Activity

Core Tables

Table

Purpose

users

User accounts

projects

Project information

project_memberships

User/project roles

tasks

Project tasks

comments

Task comments

activities

Project activity history

refresh_tokens

Refresh-token records

Database schema changes are managed through Alembic migrations.

📋 Task Lifecycle

┌─────────┐
│  To Do  │
└────┬────┘
     │
     ▼
┌─────────────┐
│ In Progress │
└──────┬──────┘
       │
       ▼
┌─────────┐
│  Done   │
└─────────┘

When a task enters Done, completed_at is recorded.

If the task moves out of Done, the completion timestamp is cleared.

🔎 Task Search, Filtering & Sorting

Feature

Supported

Search

Title search

Filters

Status, Assignee, Priority

Sorting

Priority, Due date, Created date

Pagination

Server-side pagination

Multiple filters can be applied together.

📝 Activity Tracking

TaskFlow maintains a chronological project activity feed.

Examples:

Task created

Task moved

Task assigned

Member invited

Member removed

Comment added

Activities are displayed in reverse chronological order.

📊 Dashboard

The dashboard summarizes the user's current workspace:

Project count

Assigned tasks

Tasks by status

Completed this week

Project with most open tasks

Recent activity

🧪 Validation & Error Handling

The backend validates important business rules:

Task title cannot be empty.

New task due dates cannot be in the past.

Task assignees must belong to the project.

Removed members are automatically unassigned.

Project owners cannot remove themselves.

Unauthorized project access is rejected.

Only authorized users can mark tasks as Done.

The frontend also provides loading, error, validation, and request-disabled states.

🧩 API Overview

Authentication

POST /auth/register
POST /auth/login
POST /auth/refresh
GET  /me

Projects

GET    /projects
POST   /projects
GET    /projects/{project_id}
PUT    /projects/{project_id}
DELETE /projects/{project_id}

Members

GET    /projects/{project_id}/members
POST   /projects/{project_id}/members
DELETE /projects/{project_id}/members/{user_id}

Tasks

GET    /projects/{project_id}/tasks
POST   /projects/{project_id}/tasks
PUT    /projects/{project_id}/tasks/{task_id}
DELETE /projects/{project_id}/tasks/{task_id}

Dashboard

Dashboard information is available through the dashboard API.

TaskFlow also provides an assigned-to-me view across projects.

🧠 Important Implementation Decisions

Technology

Why it was used

FastAPI

API routing, OpenAPI docs, Pydantic validation, async/WebSocket support

PostgreSQL

Relational data, consistency, foreign keys, transactions

SQLAlchemy

Database abstraction and ORM models

React

Component-based frontend and dynamic UI updates

WebSockets

Real-time collaboration without polling

🛠️ Hard Parts

1. Project-Level Authorization

Every project operation verifies membership and the required role.

2. Task Assignment

Tasks can only be assigned to current project members.

3. Member Removal

Removing a member also handles their existing task assignments.

4. Task Completion Permissions

Only authorized users can move a task to Done.

5. Real-Time Synchronization

WebSocket events are authenticated and properly scoped to projects.

6. Access-Token Expiration

The frontend and backend work together to refresh expired access tokens.

🐞 Known Limitations

PostgreSQL currently runs separately from the application containers.

WebSocket reconnection can be improved for unstable networks.

Production deployment should use HTTPS/WSS and production-grade secret management.

Demo seed credentials should not be used in production.

🔮 Future Improvements

Drag-and-drop task movement

Advanced notification controls

Improved WebSocket reconnection and state recovery

Email invitations

File attachments

Team-level analytics

Automated backend and frontend tests

CI/CD pipeline

Production monitoring and logging

Redis-based WebSocket scaling

🤖 AI Usage

AI tools were used during development as a development assistant for:

Debugging implementation issues

Reviewing API behavior

Improving frontend validation and accessibility

Discussing architecture and implementation approaches

Generating development guidance

The application's architecture, integration, testing, debugging, and final implementation were reviewed and adapted during development.

🧑‍💻 Development Workflow

Requirements
    │
    ▼
Database Design
    │
    ▼
FastAPI Backend
    │
    ▼
Authentication
    │
    ▼
Projects & Memberships
    │
    ▼
Task Management
    │
    ▼
Comments & Activity
    │
    ▼
WebSockets
    │
    ▼
React Frontend
    │
    ▼
Docker
    │
    ▼
GitHub

📌 Demo Flow

Register User A

Register User B

User A creates a project

User A invites User B

User B joins the project

User A creates a task

User A assigns the task to User B

User B sees the assignment

User B moves the task from To Do → In Progress

User B marks the task as Done

Both users see the real-time update

Add a comment

Open the activity feed

Open the dashboard

Demonstrate the assigned-to-me view

🎥 Demo

▶️ Watch TaskFlow Demo on YouTube

🔗 Repository

💻 GitHub — PremShaw143/TaskFlow

📄 License

This project was created as a software development assessment/project and is currently provided without a separate open-source license.
