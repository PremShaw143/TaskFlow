from datetime import datetime

from pydantic import BaseModel


class ActivityResponse(BaseModel):
    id: int
    project_id: int
    user_id: int
    task_id: int | None
    event_type: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True