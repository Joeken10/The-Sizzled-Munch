"""Normalize emails and usernames

Revision ID: 4bad624719e4
Revises: 6ea23b5cac6e
Create Date: 2025-07-10 23:06:59.478832

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text

# revision identifiers, used by Alembic.
revision = '4bad624719e4'
down_revision = '6ea23b5cac6e'
branch_labels = None
depends_on = None

def upgrade():
    conn = op.get_bind()
    # Normalize emails and usernames in 'users' table
    conn.execute(text("UPDATE users SET email = LOWER(TRIM(email)) WHERE email IS NOT NULL"))
    conn.execute(text("UPDATE users SET username = TRIM(username) WHERE username IS NOT NULL"))
    
    # Normalize emails and usernames in 'admin_users' table
    conn.execute(text("UPDATE admin_users SET email = LOWER(TRIM(email)) WHERE email IS NOT NULL"))
    conn.execute(text("UPDATE admin_users SET username = TRIM(username) WHERE username IS NOT NULL"))

def downgrade():
    # Cannot safely reverse this data normalization
    pass
