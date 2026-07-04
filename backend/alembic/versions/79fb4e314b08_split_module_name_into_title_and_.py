"""Split module name into title and position

Revision ID: 79fb4e314b08
Revises: 3e75e1c45246
Create Date: 2026-07-04 18:58:42.002619

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '79fb4e314b08'
down_revision: Union[str, Sequence[str], None] = '3e75e1c45246'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Rename in place (preserves existing data) rather than add+drop.
    op.alter_column('modules', 'name', new_column_name='title')

    # Existing titles were stored as "Module N: Actual Title" — strip the
    # auto-generated prefix now that the number lives in its own column.
    op.execute(r"UPDATE modules SET title = regexp_replace(title, '^Module\s+\d+\s*:\s*', '')")

    op.add_column('modules', sa.Column('position', sa.Integer(), nullable=True))
    op.execute(
        """
        UPDATE modules m
        SET position = sub.rn
        FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY subject_id ORDER BY id) AS rn
            FROM modules
        ) sub
        WHERE m.id = sub.id
        """
    )
    op.alter_column('modules', 'position', nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.execute(r"UPDATE modules SET title = 'Module ' || position || ': ' || title")
    op.drop_column('modules', 'position')
    op.alter_column('modules', 'title', new_column_name='name')
