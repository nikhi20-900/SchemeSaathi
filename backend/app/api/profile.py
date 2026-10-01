"""
Citizen Profile API Routes.
Owned by: Member 4 / Integration
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.profile import UserProfile
from app.schemas.user import UserProfileCreate, UserProfileResponse

router = APIRouter(prefix="/profile", tags=["profile"])


def _get_or_create_profile(db: Session) -> UserProfile:
    profile = db.query(UserProfile).order_by(UserProfile.id.asc()).first()
    if profile is not None:
        return profile

    profile = UserProfile()
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("")
def get_profile(db: Session = Depends(get_db)) -> UserProfileResponse:
    return _get_or_create_profile(db)


@router.post("")
def update_profile(
    profile_data: UserProfileCreate, db: Session = Depends(get_db)
) -> UserProfileResponse:
    profile = db.query(UserProfile).order_by(UserProfile.id.asc()).first()
    if profile is None:
        profile = UserProfile()
        db.add(profile)

    for field, value in profile_data.model_dump().items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile
