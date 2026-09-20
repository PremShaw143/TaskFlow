from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import case
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import (
    get_current_user,
    require_project_member,
    require_project_owner,
)
from app.websocket import manager

from app.models.activity import Activity
from app.models.membership import ProjectMembership
from app.models.project import Project
from app.models.task import Task
from app.models.user import User

from app.schemas.activity import ActivityResponse
from app.schemas.member import MemberInvite, MemberResponse
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)


router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)


# =========================================================
# CREATE PROJECT
# =========================================================

@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = Project(
        name=data.name.strip(),
        description=data.description.strip()
        if data.description
        else None,
        owner_id=current_user.id,
        priority=data.priority,
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    membership = ProjectMembership(
        project_id=project.id,
        user_id=current_user.id,
        role="owner",
    )

    db.add(membership)
    db.commit()

    return project


# =========================================================
# GET MY PROJECTS
# =========================================================

@router.get(
    "",
    response_model=list[ProjectResponse],
)
def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    projects = (
        db.query(Project)
        .join(ProjectMembership)
        .filter(
            ProjectMembership.user_id == current_user.id
        )
        .order_by(
            case(
                (Project.priority == "High", 1),
                (Project.priority == "Medium", 2),
                (Project.priority == "Low", 3),
                else_=4,
            )
        )
        .all()
    )

    return projects


# =========================================================
# GET SINGLE PROJECT
# =========================================================

@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check that project exists
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id
        )
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    # Check that current user belongs to project
    require_project_member(
        project_id,
        current_user,
        db,
    )

    return project


# =========================================================
# UPDATE PROJECT
# =========================================================

@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
)
def update_project(
    project_id: int,
    data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only project owner can edit project details
    require_project_owner(
        project_id,
        current_user,
        db,
    )

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id
        )
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    # Update project name
    if data.name is not None:
        if not data.name.strip():
            raise HTTPException(
                status_code=400,
                detail="Project name cannot be empty",
            )

        project.name = data.name.strip()

    # Update description
    if data.description is not None:
        project.description = (
            data.description.strip()
            if data.description.strip()
            else None
        )

    # Update project priority
    if data.priority is not None:
        if data.priority not in [
            "Low",
            "Medium",
            "High",
        ]:
            raise HTTPException(
                status_code=400,
                detail="Invalid project priority",
            )

        project.priority = data.priority

    db.commit()
    db.refresh(project)

    return project


# =========================================================
# INVITE MEMBER
# =========================================================

@router.post(
    "/{project_id}/members/invite"
)
async def invite_member(
    project_id: int,
    data: MemberInvite,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only project owner can invite
    require_project_owner(
        project_id,
        current_user,
        db,
    )

    # Check project exists
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id
        )
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    # Find registered user
    user = (
        db.query(User)
        .filter(
            User.email == data.email
        )
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User with this email is not registered",
        )

    # Check existing membership
    existing_member = (
        db.query(ProjectMembership)
        .filter(
            ProjectMembership.project_id == project_id,
            ProjectMembership.user_id == user.id,
        )
        .first()
    )

    if existing_member:
        raise HTTPException(
            status_code=400,
            detail="User is already a member of this project",
        )

    # Create membership
    membership = ProjectMembership(
        project_id=project_id,
        user_id=user.id,
        role="member",
    )

    db.add(membership)
    db.commit()
    db.refresh(membership)

    # Activity
    activity = Activity(
        project_id=project_id,
        user_id=current_user.id,
        task_id=None,
        event_type="member_invited",
        description=(
            f"User '{user.email}' was invited to the project"
        ),
    )

    db.add(activity)
    db.commit()

    # Notify project members
    await manager.broadcast_project(
        project_id,
        {
            "event": "member_invited",
            "project_id": project_id,
            "user_id": user.id,
        },
    )

    # Notify invited user
    await manager.broadcast_user(
        user.id,
        {
            "event": "member_invited",
            "project_id": project_id,
            "user_id": user.id,
        },
    )

    return {
        "message": "User invited successfully",
        "user_id": user.id,
        "email": user.email,
        "role": "member",
    }


# =========================================================
# GET PROJECT MEMBERS
# =========================================================

@router.get(
    "/{project_id}/members",
    response_model=list[MemberResponse],
)
def get_members(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_project_member(
        project_id,
        current_user,
        db,
    )

    members = (
        db.query(ProjectMembership)
        .join(User)
        .filter(
            ProjectMembership.project_id == project_id
        )
        .all()
    )

    return [
        {
            "user_id": member.user.id,
            "name": member.user.name,
            "email": member.user.email,
            "role": member.role,
        }
        for member in members
    ]


# =========================================================
# REMOVE MEMBER
# =========================================================

@router.delete(
    "/{project_id}/members/{user_id}"
)
async def remove_member(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only owner can remove members
    require_project_owner(
        project_id,
        current_user,
        db,
    )

    membership = (
        db.query(ProjectMembership)
        .filter(
            ProjectMembership.project_id == project_id,
            ProjectMembership.user_id == user_id,
        )
        .first()
    )

    if membership is None:
        raise HTTPException(
            status_code=404,
            detail="Member not found in this project",
        )

    # Owner cannot be removed
    if membership.role == "owner":
        raise HTTPException(
            status_code=400,
            detail="Project owner cannot be removed",
        )

    # Find tasks assigned to this member
    tasks = (
        db.query(Task)
        .filter(
            Task.project_id == project_id,
            Task.assignee_id == user_id,
        )
        .all()
    )

    task_ids = []

    # Automatically unassign removed member
    for task in tasks:
        task.assignee_id = None
        task_ids.append(task.id)

    # Remove membership
    db.delete(membership)
    db.commit()

    # Activity
    activity = Activity(
        project_id=project_id,
        user_id=current_user.id,
        task_id=None,
        event_type="member_removed",
        description=(
            f"User {user_id} was removed from the project"
        ),
    )

    db.add(activity)
    db.commit()

    # Notify removed user
    await manager.broadcast_user(
        user_id,
        {
            "event": "member_removed",
            "project_id": project_id,
            "user_id": user_id,
        },
    )

    # Notify removed user about unassigned tasks
    for task_id in task_ids:
        await manager.broadcast_user(
            user_id,
            {
                "event": "task_unassigned",
                "project_id": project_id,
                "task_id": task_id,
                "assignee_id": user_id,
            },
        )

    # Notify project members
    await manager.broadcast_project(
        project_id,
        {
            "event": "member_removed",
            "project_id": project_id,
            "user_id": user_id,
        },
    )

    # Notify project members about task updates
    for task_id in task_ids:
        await manager.broadcast_project(
            project_id,
            {
                "event": "task_updated",
                "project_id": project_id,
                "task_id": task_id,
            },
        )

    return {
        "message": "Member removed successfully",
        "user_id": user_id,
    }


# =========================================================
# DELETE PROJECT
# =========================================================

@router.delete(
    "/{project_id}"
)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only owner can delete
    require_project_owner(
        project_id,
        current_user,
        db,
    )

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id
        )
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    db.delete(project)
    db.commit()

    return {
        "message": "Project deleted successfully",
        "project_id": project_id,
    }


# =========================================================
# PROJECT ACTIVITY FEED
# =========================================================

@router.get(
    "/{project_id}/activities",
    response_model=list[ActivityResponse],
)
def get_project_activities(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_project_member(
        project_id,
        current_user,
        db,
    )

    activities = (
        db.query(Activity)
        .filter(
            Activity.project_id == project_id
        )
        .order_by(
            Activity.created_at.desc()
        )
        .all()
    )

    return activities