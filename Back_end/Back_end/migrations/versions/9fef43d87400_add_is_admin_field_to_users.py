"""Add is_admin field to users

Revision ID: 9fef43d87400
Revises: 4d446c2701c5
Create Date: 2025-07-03 15:31:25.087850
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '9fef43d87400'
down_revision = '4d446c2701c5'
branch_labels = None
depends_on = None

def upgrade():
    # Add 'is_admin' field with default=False to avoid NOT NULL violation
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_admin', sa.Boolean(), nullable=False, server_default=sa.false()))

def downgrade():
    # Remove 'is_admin' field
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('is_admin')
