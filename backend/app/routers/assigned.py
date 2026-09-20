from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.membership import ProjectMembership
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskResponse


router = APIRouter(
    prefix="/tasks",
    tags=["Assigned Tasks"],
)


@router.get(
    "/assigned-to-me",
    response_model=list[TaskResponse],
)
def get_assigned_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Get projects where the current user is a member
    member_project_ids = (
        db.query(ProjectMembership.project_id)
        .filter(
            ProjectMembership.user_id == current_user.id
        )
        .subquery()
    )

    # Get tasks assigned to the current user
    tasks = (
        db.query(Task)
        .filter(
            Task.assignee_id == current_user.id,
            Task.project_id.in_(member_project_ids),
        )
        .order_by(
            Task.created_at.desc()
        )
        .all()
    )

    return tasks