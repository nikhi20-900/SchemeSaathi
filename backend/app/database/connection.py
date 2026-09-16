"""
Database Connection and Session Factory.
Managed by: Member 4 / Integration

Future responsibility:
SQLAlchemy engine, session maker, and Base declarative model.
Supports PostgreSQL (with pgvector) and SQLite for local development.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """
    Database session dependency.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
