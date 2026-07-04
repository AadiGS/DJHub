"""change email to username

Revision ID: 78b91f1a25de
Revises: 2f6c01170f1f
Create Date: 2026-07-05 00:08:45.792128

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '78b91f1a25de'
down_revision: Union[str, Sequence[str], None] = '2f6c01170f1f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('users', 'email', new_column_name='username')
    op.drop_index('ix_users_email', table_name='users')
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('users', 'username', new_column_name='email')
    op.drop_index('ix_users_username', table_name='users')
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    # ### end Alembic commands ###
