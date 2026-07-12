"""add firebase_uid to users

Revision ID: 002
Revises: 001
Create Date: 2026-07-12 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Add firebase_uid column to users table
    op.add_column('users', sa.Column('firebase_uid', sa.String(length=128), nullable=True))
    
    # Create index on firebase_uid
    op.create_index(op.f('ix_users_firebase_uid'), 'users', ['firebase_uid'], unique=True)


def downgrade():
    # Drop index and column
    op.drop_index(op.f('ix_users_firebase_uid'), table_name='users')
    op.drop_column('users', 'firebase_uid')
