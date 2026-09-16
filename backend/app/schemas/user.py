"""
User and Profile Pydantic Schemas.
Managed by: Member 4 / Integration

Future responsibility:
Pydantic models for user profile creation, updating, and responses.
"""

from typing import Optional
from pydantic import BaseModel

class UserProfileBase(BaseModel):
    name: str = "Nikhil Kumar"
    age: int = 20
    state: str = "Karnataka"
    district: Optional[str] = "Bengaluru Urban"
    education: str = "Undergraduate"
    course: str = "BCA"
    annual_income: float = 240000.0
    student_status: bool = True
    category: str = "2A"

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    id: Optional[str] = "user-1"
