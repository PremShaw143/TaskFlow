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
