"""set activity task null on delete

Revision ID: b626077f1e75
Revises: 0da51d366ae5
Create Date: 2026-09-17 18:07:16.921674

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b626077f1e75'
down_revision: Union[str, Sequence[str], None] = '0da51d366ae5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None
 
 
def upgrade() -> None:
    """Upgrade schema."""

    op.drop_constraint(
        "activities_task_id_fkey",
        "activities",
        type_="foreignkey"
    )

    op.create_foreign_key(
        "activities_task_id_fkey",
        "activities",
        "tasks",
        ["task_id"],
        ["id"],
        ondelete="SET NULL"
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint(
        "activities_task_id_fkey",
        "activities",
        type_="foreignkey"
    )

    op.create_foreign_key(
        "activities_task_id_fkey",
        "activities",
        "tasks",
        ["task_id"],
        ["id"]
    )