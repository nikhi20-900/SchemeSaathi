"""
Citizen Profile Database Model.
"""

from sqlalchemy import Boolean, Column, Float, Integer, String

from app.database.connection import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, default="Nikhil Kumar")
    age = Column(Integer, nullable=False, default=20)
    state = Column(String, nullable=False, default="Karnataka")
    district = Column(String, nullable=True, default="Bengaluru Urban")
    education = Column(String, nullable=False, default="Undergraduate")
    course = Column(String, nullable=False, default="BCA")
    annual_income = Column(Float, nullable=False, default=240000.0)
    student_status = Column(Boolean, nullable=False, default=True)
    category = Column(String, nullable=False, default="2A")
