from pydantic import BaseModel

from app.schemas.activity import ActivityResponse


class DashboardResponse(BaseModel):
    project_count: int

    assigned_tasks: dict

    completed_this_week: int

    project_with_most_open_tasks: dict | None

    recent_activity: list[ActivityResponse]