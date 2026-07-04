"""Add Notes material type

Revision ID: 4abca63218a4
Revises: 79fb4e314b08
Create Date: 2026-07-04 19:11:59.594253

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4abca63218a4'
down_revision: Union[str, Sequence[str], None] = '79fb4e314b08'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE material_type ADD VALUE IF NOT EXISTS 'Notes'")


def downgrade() -> None:
    """Downgrade schema."""
    # Postgres cannot drop enum values without recreating the type; the
    # 'Notes' label is left in place on downgrade.
    pass
