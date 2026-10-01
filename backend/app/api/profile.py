"""Citizen profile API routes backed by SQLAlchemy."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models import UserProfile
from app.schemas.user import UserProfileCreate, UserProfileResponse

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/", response_model=UserProfileResponse)
def get_profile(db: Session = Depends(get_db)):
    profile = db.execute(select(UserProfile).order_by(UserProfile.id.asc())).scalar_one_or_none()
    if profile is None:
        profile = UserProfile(**UserProfileCreate().model_dump())
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.post("/", response_model=UserProfileResponse)
def update_profile(profile_data: UserProfileCreate, db: Session = Depends(get_db)):
    profile = db.execute(select(UserProfile).order_by(UserProfile.id.asc())).scalar_one_or_none()
    if profile is None:
        profile = UserProfile(**profile_data.model_dump())
        db.add(profile)
    else:
        for key, value in profile_data.model_dump().items():
            setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile
