🚀 TaskFlow

<p align="center">
  <strong>A full-stack, real-time project and task management platform for modern teams.</strong><br>
  Built with React, FastAPI, PostgreSQL, JWT Authentication & WebSockets.
</p>

<p align="center">
  <a href="https://youtu.be/8po67Lk8BWc?si=E50frszcuRXNQ9b_">
    <img src="https://img.shields.io/badge/▶️%20Watch%20Demo-YouTube-red?style=for-the-badge&logo=youtube&logoColor=white" alt="Watch TaskFlow Demo">
  </a>
  <a href="https://github.com/PremShaw143/TaskFlow">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repository">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%7C%20JavaScript%20%7C%20Vite-61DAFB?style=flat-square&logo=react&logoColor=black">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white">
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white">
  <img src="https://img.shields.io/badge/Real--Time-WebSockets-6A1B9A?style=flat-square">
  <img src="https://img.shields.io/badge/DevOps-Docker-2496ED?style=flat-square&logo=docker&logoColor=white">
</p>

🎥 Project Demo: Watch the TaskFlow Demo on YouTube

✨ What is TaskFlow?

TaskFlow is a Trello/Jira-style task management platform designed for teams to create projects, manage members, assign tasks, track progress, collaborate through comments, and receive real-time updates across multiple users.

🌟 Why TaskFlow?

🔐 Secure

⚡ Real-Time

👥 Collaborative

📊 Insightful

JWT authentication, refresh tokens & role-based access

WebSocket-powered live updates

Projects, members, tasks, comments & activity

Dashboard, filters, sorting & task analytics

🆕 Latest Features

Production-style features for secure, collaborative team workflows:

🔐 JWT Authentication & Refresh Tokens — secure login sessions with protected API access.

👥 Project Membership & Authorization — owner/member roles with project-level access control.

⚡ Real-Time Collaboration — authenticated WebSockets for live task, member, and comment updates.

💬 Comments & Activity Feed — project collaboration with chronological activity tracking.

📊 Dashboard & Assigned Tasks — task status summaries, recent activity, and a dedicated assigned-to-me view.

🔎 Advanced Task Management — search, filtering, sorting, pagination, priorities, due dates, and task assignment.

🐳 Dockerized Development — Dockerfiles and Docker Compose support for the application.

🗃️ Database Migrations — Alembic-based schema migration workflow with PostgreSQL.

🧭 Quick Navigation

Features · Architecture · Tech Stack · Project Structure · Getting Started · Docker · Authentication · WebSockets · API · Future Improvements

✨ Features

🔐 Authentication & Security

User registration and login

Password hashing using bcrypt

JWT access-token authentication

Refresh-token flow for maintaining sessions

Protected API endpoints

Project-level membership authorization

Owner/member role enforcement

Secure environment-variable configuration

📁 Project Management

Create projects

Edit project details

Project priority:

🔴 High

🟡 Medium

🟢 Low

Project owner and member roles

Invite registered users by email

View project members

Remove project members

Delete projects

Automatic task cleanup when a project is deleted

✅ Task Management

Create, update, and delete tasks

Task title and description

Status workflow:

To Do

In Progress

Done

Priority:

High

Medium

Low

Optional due dates

Assign tasks to project members

Search tasks by title

Filter by:

Status

Assignee

Priority

Pagination

Sorting by:

Priority

Due date

Created date

Automatic completed_at tracking

Assignee validation

Due-date validation

👥 Team Collaboration

Project members can work on shared tasks

Task assignment

Comments visible to project members

Activity tracking

Member invitation/removal events

Automatic task unassignment when a member is removed

⚡ Real-Time Updates

TaskFlow uses WebSockets to provide live project updates.

Real-time events include:

Task created

Task updated

Task deleted

Task assigned

Member invited

Member removed

Comment added

Project WebSockets are authenticated and scoped to the project.

A separate user-level WebSocket supports updates such as tasks assigned to the current user.

📊 Dashboard

The dashboard provides:

Total project count

Assigned task counts by status

Tasks completed this week

Project with the most open tasks

Recent activity

🎨 User Interface

Responsive React interface

Dark modern UI

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

Frontend

React

Vite

JavaScript

CSS

WebSocket API

Backend

Python

FastAPI

SQLAlchemy

Pydantic

JWT

bcrypt

WebSockets

Database

PostgreSQL

Alembic migrations

DevOps

Docker

Docker Compose

Nginx

Development Tools

Git

GitHub

VS Code

Swagger / OpenAPI

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
│   │
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
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
├── .gitignore
└── README.md

🚦 Getting Started

Prerequisites

Install the following:

Python 3.13+

Node.js 22+

PostgreSQL

Git

Docker Desktop (optional)

1. Clone the Repository

git clone https://github.com/PremShaw143/TaskFlow.git
cd TaskFlow

2. Backend Setup

Open a terminal inside the backend directory:

cd backend

Create a virtual environment:

python -m venv .venv

Activate it on Windows:

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

Never commit the real .env file. It is excluded through .gitignore.

4. Create the Database

Create a PostgreSQL database named:

taskflow

Then run the migrations:

alembic upgrade head

5. Seed Demo Data

Run:

python seed.py

The seed script creates reusable demo users, a shared project, memberships, and sample tasks.

Seed users

Owner

Email: seed.owner@taskflow.com
Password: SeedOwner@123

Member

Email: seed.member@taskflow.com
Password: SeedMember@123

These credentials are intended for local/demo development. Change or remove demo credentials before using a production deployment.

6. Start the Backend

From:

backend/

Run:

uvicorn app.main:app --reload

Backend:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/docs

7. Frontend Setup

Open another terminal:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173

🐳 Running with Docker

TaskFlow includes Dockerfiles for both the frontend and backend.

From the project root:

docker compose up --build

Frontend:

http://localhost:5173

Backend:

http://localhost:8000

Swagger API documentation:

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

The frontend stores the authentication tokens locally and automatically uses the access token for protected API requests.

The refresh endpoint can be used when the access token expires.

🔒 Authorization Model

TaskFlow uses project membership to control access.

Each project has:

Owner
Member

Owner

The project owner can:

Update project details

Invite members

Remove members

Delete the project

Perform owner-level project operations

Member

Project members can:

View project data

Work with project tasks

Create tasks

Update permitted tasks

Add comments

Task completion also has an additional rule:

Only the task assignee or project owner can move a task to Done.

🔄 WebSocket Design

TaskFlow uses authenticated WebSocket connections.

Project WebSocket

/ws/projects/{project_id}?token={access_token}

The backend:

Validates the JWT.

Identifies the user.

Checks project membership.

Creates a project-scoped connection.

This prevents users from receiving real-time events for projects they do not belong to.

User WebSocket

/ws/users/{user_id}?token={access_token}

This connection is used for user-specific events such as task assignments.

Example event

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

The main database entities are:

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

Core tables

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

The task API supports:

Search

Title search

Filters

Status
Assignee
Priority

Multiple filters can be applied together.

Sorting

Priority
Due date
Created date

Pagination

The API supports server-side pagination using page and page-size parameters.

📝 Activity Tracking

TaskFlow maintains a chronological project activity feed.

Examples include:

Task created

Task moved

Task assigned

Member invited

Member removed

Comment added

Activities are displayed in reverse chronological order.

📊 Dashboard

The dashboard summarizes the user's current workspace.

It includes:

Project count
      │
      ├── Assigned tasks
      │
      ├── Tasks by status
      │
      ├── Completed this week
      │
      ├── Project with most open tasks
      │
      └── Recent activity

🧪 Validation & Error Handling

The backend validates important business rules before modifying data.

Examples:

Task title cannot be empty.

New task due dates cannot be in the past.

Task assignees must belong to the project.

Removed members are automatically unassigned.

Project owners cannot remove themselves.

Unauthorized project access is rejected.

Only authorized users can mark tasks as Done.

The frontend displays loading, error, validation, and request-disabled states where appropriate.

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

Project membership operations are exposed through the project routes.

GET  /projects/{project_id}/members
POST /projects/{project_id}/members
DELETE /projects/{project_id}/members/{user_id}

Tasks

GET    /projects/{project_id}/tasks
POST   /projects/{project_id}/tasks
PUT    /projects/{project_id}/tasks/{task_id}
DELETE /projects/{project_id}/tasks/{task_id}

Dashboard

Dashboard information is available through the dashboard API.

Assigned Tasks

TaskFlow also provides an assigned-to-me view across projects.

🧠 Important Implementation Decisions

FastAPI

FastAPI was selected because it provides:

Clear API routing

Automatic OpenAPI documentation

Pydantic validation

Strong async/WebSocket support

A lightweight backend structure

PostgreSQL

PostgreSQL was selected for:

Relational project/member/task relationships

Strong consistency

Foreign-key constraints

Reliable transactional operations

SQLAlchemy

SQLAlchemy provides the database abstraction layer and keeps database models separate from API schemas.

React

React provides component-based UI development and makes it straightforward to update task boards when WebSocket events arrive.

WebSockets

WebSockets were used instead of polling for project-level real-time collaboration.

🛠️ Hard Parts

Some of the more involved parts of the implementation were:

1. Project-level authorization

Every project operation needs to verify that the current user belongs to that project and has the required role.

2. Task assignment rules

A task can only be assigned to someone who is currently a member of the project.

3. Member removal

Removing a member also requires handling their existing task assignments so that deleted memberships do not leave invalid assignees.

4. Task completion permissions

The application applies a separate authorization rule for moving a task to Done.

5. Real-time synchronization

WebSocket events need to be authenticated and scoped correctly so project users receive relevant updates.

6. Access-token expiration

The frontend and backend need to cooperate so an expired access token can be refreshed without requiring the user to log in again immediately.

🐞 Known Limitations

The current Docker Compose configuration uses PostgreSQL outside the application containers.

WebSocket reconnection behavior can be improved further for unstable network conditions.

Production deployment should use HTTPS/WSS and production-grade secret management.

Demo seed credentials should not be used for a real production environment.

🔮 Future Improvements

Possible future improvements include:

Drag-and-drop task movement

More advanced notification controls

Improved WebSocket reconnection and state recovery

Email invitations

File attachments

Team-level analytics

Automated backend and frontend tests

CI/CD pipeline

Production monitoring and logging

Redis-based WebSocket scaling for multiple backend instances

🤖 AI Usage

AI tools were used during development as a development assistant for tasks such as:

Debugging implementation issues

Reviewing API behavior

Improving frontend validation and accessibility

Discussing architecture and implementation approaches

Generating development guidance

The application's architecture, integration, testing, debugging, and final implementation were reviewed and adapted during development.

🧑‍💻 Development Workflow

The project was developed incrementally:

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

A typical demonstration can follow this sequence:

Register User A.

Register User B.

User A creates a project.

User A invites User B.

User B joins the project.

User A creates a task.

User A assigns the task to User B.

User B sees the assignment.

User B moves the task from To Do → In Progress.

User B marks the task as Done.

Both users can see real-time project updates.

Add a comment.

Open the activity feed.

Open the dashboard.

Demonstrate the assigned-to-me view.

🔗 Repository

GitHub:
https://github.com/PremShaw143/TaskFlow

📄 License

This project was created as a software development assessment/project and is currently provided without a separate open-source license.
