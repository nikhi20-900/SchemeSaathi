"""User profile database model."""

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class UserProfile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    state = Column(String, nullable=False)
    district = Column(String, nullable=True)
    education = Column(String, nullable=False)
    course = Column(String, nullable=False)
    annual_income = Column(Float, nullable=False)
    student_status = Column(Boolean, nullable=False, default=True)
    category = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    documents = relationship("Document", back_populates="profile")
