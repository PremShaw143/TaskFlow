from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import case
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import (
    get_current_user,
    require_project_member,
)
from app.websocket import manager

from app.models.activity import Activity
from app.models.comment import Comment
from app.models.membership import ProjectMembership
from app.models.task import Task
from app.models.user import User

from app.schemas.comment import (
    CommentCreate,
    CommentResponse,
)
from app.schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskUpdate,
)


router = APIRouter(
    prefix="/projects/{project_id}/tasks",
    tags=["Tasks"],
)


ALLOWED_STATUSES = [
    "To Do",
    "In Progress",
    "Done",
]

ALLOWED_PRIORITIES = [
    "Low",
    "Medium",
    "High",
]

ALLOWED_SORT_FIELDS = [
    "priority",
    "due_date",
    "created_at",
]


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def validate_due_date(due_date):
    """
    Validate and normalize due date.

    The database stores UTC-aware datetime values.
    """

    if due_date is None:
        return None

    if due_date.tzinfo is None:
        due_date = due_date.replace(
            tzinfo=timezone.utc
        )

    if due_date <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="Due date must be in the future",
        )

    return due_date


def validate_assignee(
    project_id: int,
    assignee_id: int | None,
    db: Session,
):
    """
    Make sure the assignee belongs to the project.
    """

    if assignee_id is None:
        return

    membership = (
        db.query(ProjectMembership)
        .filter(
            ProjectMembership.project_id == project_id,
            ProjectMembership.user_id == assignee_id,
        )
        .first()
    )

    if membership is None:
        raise HTTPException(
            status_code=400,
            detail="Assignee must be a member of this project",
        )


def get_task(
    project_id: int,
    task_id: int,
    db: Session,
):
    """
    Get a task belonging to the specified project.
    """

    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.project_id == project_id,
        )
        .first()
    )

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return task


# =========================================================
# CREATE TASK
# =========================================================

@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_task(
    project_id: int,
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_project_member(
        project_id,
        current_user,
        db,
    )

    # ---------------------------------------------
    # Title validation
    # ---------------------------------------------

    if not data.title or not data.title.strip():
        raise HTTPException(
            status_code=400,
            detail="Task title cannot be empty",
        )

    # ---------------------------------------------
    # Status validation
    # ---------------------------------------------

    if data.status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=400,
            detail="Invalid status",
        )

    # ---------------------------------------------
    # Priority validation
    # ---------------------------------------------

    if data.priority not in ALLOWED_PRIORITIES:
        raise HTTPException(
            status_code=400,
            detail="Invalid priority",
        )

    # ---------------------------------------------
    # Due date validation
    # ---------------------------------------------

    due_date = validate_due_date(
        data.due_date
    )

    # ---------------------------------------------
    # Assignee validation
    # ---------------------------------------------

    validate_assignee(
        project_id,
        data.assignee_id,
        db,
    )

    # ---------------------------------------------
    # Completed time
    # ---------------------------------------------

    completed_at = None

    if data.status == "Done":
        completed_at = datetime.now(
            timezone.utc
        )

    # ---------------------------------------------
    # Create task
    # ---------------------------------------------

    task = Task(
        project_id=project_id,
        created_by=current_user.id,
        assignee_id=data.assignee_id,
        title=data.title.strip(),
        description=data.description,
        status=data.status,
        priority=data.priority,
        due_date=due_date,
        completed_at=completed_at,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    # ---------------------------------------------
    # Activity
    # ---------------------------------------------

    activity = Activity(
        project_id=project_id,
        user_id=current_user.id,
        task_id=task.id,
        event_type="task_created",
        description=(
            f"Task '{task.title}' was created"
        ),
    )

    db.add(activity)
    db.commit()

    # ---------------------------------------------
    # Project WebSocket
    # ---------------------------------------------

    await manager.broadcast_project(
        project_id,
        {
            "event": "task_created",
            "project_id": project_id,
            "task_id": task.id,
        },
    )

    # ---------------------------------------------
    # Assigned user WebSocket
    # ---------------------------------------------

    if task.assignee_id is not None:

        await manager.broadcast_user(
            task.assignee_id,
            {
                "event": "task_assigned",
                "project_id": project_id,
                "task_id": task.id,
                "assignee_id": task.assignee_id,
            },
        )

    return task


# =========================================================
# GET PROJECT TASKS
# =========================================================

@router.get(
    "",
    response_model=list[TaskResponse],
)
def get_tasks(
    project_id: int,
    status_filter: str | None = None,
    assignee_id: int | None = None,
    priority: str | None = None,
    search: str | None = None,
    page: int = 1,
    page_size: int = 10,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_project_member(
        project_id,
        current_user,
        db,
    )

    # ---------------------------------------------
    # Pagination validation
    # ---------------------------------------------

    if page < 1:
        raise HTTPException(
            status_code=400,
            detail="Page must be 1 or greater",
        )

    if page_size < 1 or page_size > 100:
        raise HTTPException(
            status_code=400,
            detail="Page size must be between 1 and 100",
        )

    # ---------------------------------------------
    # Status validation
    # ---------------------------------------------

    if (
        status_filter is not None
        and status_filter not in ALLOWED_STATUSES
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid status",
        )

    # ---------------------------------------------
    # Priority validation
    # ---------------------------------------------

    if (
        priority is not None
        and priority not in ALLOWED_PRIORITIES
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid priority",
        )

    # ---------------------------------------------
    # Sort validation
    # ---------------------------------------------

    if sort_by not in ALLOWED_SORT_FIELDS:
        raise HTTPException(
            status_code=400,
            detail="Invalid sort field",
        )

    if sort_order not in [
        "asc",
        "desc",
    ]:
        raise HTTPException(
            status_code=400,
            detail="Sort order must be asc or desc",
        )

    # ---------------------------------------------
    # Base query
    # ---------------------------------------------

    query = (
        db.query(Task)
        .filter(
            Task.project_id == project_id
        )
    )

    # ---------------------------------------------
    # Status filter
    # ---------------------------------------------

    if status_filter is not None:

        query = query.filter(
            Task.status == status_filter
        )

    # ---------------------------------------------
    # Assignee filter
    # ---------------------------------------------

    if assignee_id is not None:

        query = query.filter(
            Task.assignee_id == assignee_id
        )

    # ---------------------------------------------
    # Priority filter
    # ---------------------------------------------

    if priority is not None:

        query = query.filter(
            Task.priority == priority
        )

    # ---------------------------------------------
    # Search by title
    # ---------------------------------------------

    if search and search.strip():

        query = query.filter(
            Task.title.ilike(
                f"%{search.strip()}%"
            )
        )

    # ---------------------------------------------
    # Sorting
    # ---------------------------------------------

    if sort_by == "priority":

        priority_case = case(
            (Task.priority == "Low", 1),
            (Task.priority == "Medium", 2),
            (Task.priority == "High", 3),
            else_=0,
        )

        if sort_order == "asc":

            query = query.order_by(
                priority_case.asc()
            )

        else:

            query = query.order_by(
                priority_case.desc()
            )

    elif sort_by == "due_date":

        if sort_order == "asc":

            query = query.order_by(
                Task.due_date.asc()
            )

        else:

            query = query.order_by(
                Task.due_date.desc()
            )

    else:

        if sort_order == "asc":

            query = query.order_by(
                Task.created_at.asc()
            )

        else:

            query = query.order_by(
                Task.created_at.desc()
            )

    # ---------------------------------------------
    # Pagination
    # ---------------------------------------------

    offset = (
        page - 1
    ) * page_size

    tasks = (
        query
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return tasks


# =========================================================
# UPDATE TASK
# =========================================================

@router.put(
    "/{task_id}",
    response_model=TaskResponse,
)
async def update_task(
    project_id: int,
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_project_member(
        project_id,
        current_user,
        db,
    )

    task = get_task(
        project_id,
        task_id,
        db,
    )

    # ---------------------------------------------
    # Remember old values
    # ---------------------------------------------

    old_assignee_id = task.assignee_id
    old_status = task.status

    update_data = data.model_dump(
        exclude_unset=True
    )

    # ---------------------------------------------
    # Title validation
    # ---------------------------------------------

    if "title" in update_data:

        title = update_data["title"]

        if not title or not title.strip():
            raise HTTPException(
                status_code=400,
                detail="Task title cannot be empty",
            )

        update_data["title"] = title.strip()

    # ---------------------------------------------
    # Status validation
    # ---------------------------------------------

    if "status" in update_data:

        new_status = update_data["status"]

        if new_status not in ALLOWED_STATUSES:
            raise HTTPException(
                status_code=400,
                detail="Invalid status",
            )

        # Only owner or assignee can mark Done
        if new_status == "Done":
            print(
    "DONE DEBUG:",
    "current_user_id =", current_user.id,
    "task_assignee_id =", task.assignee_id,
    "project_id =", project_id,
)
            membership = (
                db.query(ProjectMembership)
                .filter(
                    ProjectMembership.project_id == project_id,
                    ProjectMembership.user_id == current_user.id,
                )
                .first()
            )

            if membership is None:
                raise HTTPException(
                    status_code=403,
                    detail="You are not a member of this project",
                )

            if (
                membership.role != "owner"
                and task.assignee_id != current_user.id
            ):
                raise HTTPException(
                    status_code=403,
                    detail=(
                        "Only the task assignee or project owner "
                        "can mark it as Done"
                    ),
                )

    # ---------------------------------------------
    # Priority validation
    # ---------------------------------------------

    if "priority" in update_data:

        if (
            update_data["priority"]
            not in ALLOWED_PRIORITIES
        ):
            raise HTTPException(
                status_code=400,
                detail="Invalid priority",
            )

    # ---------------------------------------------
    # Due date validation
    # ---------------------------------------------

    if "due_date" in update_data:

        update_data["due_date"] = validate_due_date(
            update_data["due_date"]
        )

    # ---------------------------------------------
    # Assignee validation
    # ---------------------------------------------

    if "assignee_id" in update_data:

        validate_assignee(
            project_id,
            update_data["assignee_id"],
            db,
        )

    # ---------------------------------------------
    # Apply updates
    # ---------------------------------------------

    for field, value in update_data.items():

        if field in [
            "title",
            "description",
            "status",
            "priority",
            "due_date",
            "assignee_id",
        ]:
            setattr(
                task,
                field,
                value,
            )

    # ---------------------------------------------
    # Completed date
    # ---------------------------------------------

    if "status" in update_data:

        if update_data["status"] == "Done":

            task.completed_at = datetime.now(
                timezone.utc
            )

        else:

            task.completed_at = None

    # ---------------------------------------------
    # Activity: moved
    # ---------------------------------------------

    if (
        "status" in update_data
        and update_data["status"] != old_status
    ):

        activity = Activity(
            project_id=project_id,
            user_id=current_user.id,
            task_id=task.id,
            event_type="task_moved",
            description=(
                f"Task '{task.title}' moved "
                f"from {old_status} to {task.status}"
            ),
        )

        db.add(activity)

    # ---------------------------------------------
    # Activity: assigned
    # ---------------------------------------------

    if (
        "assignee_id" in update_data
        and update_data["assignee_id"]
        != old_assignee_id
    ):

        if task.assignee_id is None:

            description = (
                f"Task '{task.title}' was unassigned"
            )

        else:

            description = (
                f"Task '{task.title}' was assigned "
                f"to user {task.assignee_id}"
            )

        activity = Activity(
            project_id=project_id,
            user_id=current_user.id,
            task_id=task.id,
            event_type="task_assigned",
            description=description,
        )

        db.add(activity)

    # ---------------------------------------------
    # Save
    # ---------------------------------------------

    db.commit()
    db.refresh(task)

    # ---------------------------------------------
    # Project WebSocket
    # ---------------------------------------------

    await manager.broadcast_project(
        project_id,
        {
            "event": "task_updated",
            "project_id": project_id,
            "task_id": task.id,
        },
    )

    # ---------------------------------------------
    # Assignment WebSocket
    # ---------------------------------------------

    if (
        "assignee_id" in update_data
        and update_data["assignee_id"]
        != old_assignee_id
    ):

        new_assignee_id = task.assignee_id

        # New assignee
        if new_assignee_id is not None:

            await manager.broadcast_user(
                new_assignee_id,
                {
                    "event": "task_assigned",
                    "project_id": project_id,
                    "task_id": task.id,
                    "assignee_id": new_assignee_id,
                },
            )

        # Old assignee
        if old_assignee_id is not None:

            await manager.broadcast_user(
                old_assignee_id,
                {
                    "event": "task_unassigned",
                    "project_id": project_id,
                    "task_id": task.id,
                    "assignee_id": old_assignee_id,
                },
            )

    return task


# =========================================================
# DELETE TASK
# =========================================================

@router.delete(
    "/{task_id}"
)
async def delete_task(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_project_member(
        project_id,
        current_user,
        db,
    )

    task = get_task(
        project_id,
        task_id,
        db,
    )

    # ---------------------------------------------
    # Preserve activity history
    # ---------------------------------------------

    activities = (
        db.query(Activity)
        .filter(
            Activity.task_id == task.id
        )
        .all()
    )

    for activity in activities:
        activity.task_id = None

    # ---------------------------------------------
    # Delete task
    # ---------------------------------------------

    db.delete(task)
    db.commit()

    # ---------------------------------------------
    # WebSocket
    # ---------------------------------------------

    await manager.broadcast_project(
        project_id,
        {
            "event": "task_deleted",
            "project_id": project_id,
            "task_id": task_id,
        },
    )

    return {
        "message": "Task deleted successfully",
        "task_id": task_id,
    }


# =========================================================
# GET COMMENTS
# =========================================================

@router.get(
    "/{task_id}/comments",
    response_model=list[CommentResponse],
)
def get_comments(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_project_member(
        project_id,
        current_user,
        db,
    )

    task = get_task(
        project_id,
        task_id,
        db,
    )

    comments = (
        db.query(Comment)
        .filter(
            Comment.task_id == task.id
        )
        .order_by(
            Comment.created_at.asc()
        )
        .all()
    )

    return comments

# =========================================================
# ADD COMMENT
# =========================================================

@router.post(
    "/{task_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_comment(
    project_id: int,
    task_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check project membership
    require_project_member(
        project_id,
        current_user,
        db,
    )

    # Check task
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.project_id == project_id,
        )
        .first()
    )

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    # Validate comment
    if not data.content or not data.content.strip():
        raise HTTPException(
            status_code=400,
            detail="Comment cannot be empty",
        )

    # Create comment
    comment = Comment(
    task_id=task.id,
    author_id=current_user.id,
    content=data.content.strip(),
)

    db.add(comment)
    db.commit()
    db.refresh(comment)

    # Activity
    activity = Activity(
        project_id=project_id,
        user_id=current_user.id,
        task_id=task.id,
        event_type="comment_added",
        description=(
            f"Comment added to task '{task.title}'"
        ),
    )

    db.add(activity)
    db.commit()

    # Project WebSocket
    await manager.broadcast_project(
        project_id,
        {
            "event": "comment_added",
            "project_id": project_id,
            "task_id": task.id,
            "comment_id": comment.id,
            "user_id": current_user.id,
        },
    )

    return comment