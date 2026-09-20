from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


# =========================================================
# CREATE PROJECT
# =========================================================

class ProjectCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=100
    )

    description: Optional[str] = None

    priority: str = "Medium"


# =========================================================
# UPDATE PROJECT
# =========================================================

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(
        default=None,
        max_length=100
    )

    description: Optional[str] = None

    priority: Optional[str] = None


# =========================================================
# PROJECT RESPONSE
# =========================================================

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    owner_id: int
    priority: str

    model_config = ConfigDict(
        from_attributes=True
    )