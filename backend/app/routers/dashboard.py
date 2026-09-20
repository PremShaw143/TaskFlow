from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user

from app.models.user import User
from app.models.project import Project
from app.models.membership import ProjectMembership
from app.models.task import Task
from app.models.activity import Activity

from app.schemas.dashboard import DashboardResponse


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get(
    "",
    response_model=DashboardResponse
)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------
    # 1. Project count
    # --------------------------------

    memberships = (
        db.query(ProjectMembership)
        .filter(
            ProjectMembership.user_id == current_user.id
        )
        .all()
    )

    project_count = len(memberships)

    project_ids = [
        membership.project_id
        for membership in memberships
    ]

    # --------------------------------
    # 2. Assigned tasks by status
    # --------------------------------

    assigned_tasks = {
        "To Do": 0,
        "In Progress": 0,
        "Done": 0
    }

    tasks = (
        db.query(Task)
        .filter(
            Task.assignee_id == current_user.id
        )
        .all()
    )

    for task in tasks:

        if task.status in assigned_tasks:
            assigned_tasks[task.status] += 1

    # --------------------------------
    # 3. Tasks completed this week
    # --------------------------------

    now = datetime.utcnow()

    start_of_week = (
        now - timedelta(
            days=now.weekday()
        )
    ).replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )

    completed_this_week = 0

    for task in tasks:

        if task.completed_at is None:
            continue

        completed_at = task.completed_at

        # Make both datetime values timezone-naive
        # so comparison is safe with PostgreSQL timestamps.
        if completed_at.tzinfo is not None:
            completed_at = completed_at.replace(
                tzinfo=None
            )

        if (
            task.status == "Done"
            and completed_at >= start_of_week
        ):
            completed_this_week += 1

    # --------------------------------
    # 4. Project with most open tasks
    # --------------------------------

    project_with_most_open_tasks = None

    if project_ids:

        projects = (
            db.query(Project)
            .filter(
                Project.id.in_(project_ids)
            )
            .all()
        )

        highest_open_count = -1

        for project in projects:

            open_task_count = (
                db.query(Task)
                .filter(
                    Task.project_id == project.id,
                    Task.status != "Done"
                )
                .count()
            )

            if open_task_count > highest_open_count:

                highest_open_count = open_task_count

                project_with_most_open_tasks = {
                    "project_id": project.id,
                    "project_name": project.name,
                    "open_tasks": open_task_count
                }

    # --------------------------------
    # 5. Recent personal activity
    # --------------------------------

    recent_activity = (
        db.query(Activity)
        .filter(
            Activity.user_id == current_user.id
        )
        .order_by(
            Activity.created_at.desc()
        )
        .limit(10)
        .all()
    )

    # --------------------------------
    # Final response
    # --------------------------------

    return {
        "project_count": project_count,
        "assigned_tasks": assigned_tasks,
        "completed_this_week": completed_this_week,
        "project_with_most_open_tasks": project_with_most_open_tasks,
        "recent_activity": recent_activity
    }