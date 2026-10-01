"""User and profile Pydantic schemas."""

from typing import Optional, Union

from pydantic import BaseModel, ConfigDict


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
    id: Optional[Union[int, str]] = None

    model_config = ConfigDict(from_attributes=True)
