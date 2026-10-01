"""Eligibility check API routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.eligibility import EligibilityCheckRequest, EligibilityCheckResponse
from app.services.eligibility_service import EligibilityService
from app.services.scheme_service import SchemeService

router = APIRouter(prefix="/eligibility", tags=["eligibility"])


@router.post(
    "/check",
    response_model=EligibilityCheckResponse,
    summary="Check eligibility",
    description=(
        "Deterministic eligibility evaluation. Evaluates a user profile "
        "against structured government scheme rules. The LLM does NOT "
        "determine eligibility — this engine does."
    ),
)
def check_eligibility(payload: EligibilityCheckRequest, db: Session = Depends(get_db)):
    if payload.scheme_id:
        scheme = SchemeService.get_scheme_by_id(db, payload.scheme_id)
        schemes = [scheme] if scheme else []
    else:
        schemes = SchemeService.list_schemes(db)

    return EligibilityService.evaluate_profile(
        profile=payload.user_profile,
        scheme_id=payload.scheme_id,
        schemes=schemes,
    )


@router.get(
    "/schemes",
    summary="List all schemes with eligibility rules",
    description="Returns every registered scheme along with its structured eligibility rules.",
)
def list_schemes(db: Session = Depends(get_db)):
    schemes = SchemeService.list_schemes(db)
    return {"schemes": schemes, "total": len(schemes)}


@router.get(
    "/schemes/{scheme_id}",
    summary="Get a single scheme's eligibility rules",
    description="Look up a specific scheme by ID and return its structured rules.",
)
def get_scheme(scheme_id: str, db: Session = Depends(get_db)):
    scheme = SchemeService.get_scheme_by_id(db, scheme_id)
    if scheme is None:
        raise HTTPException(status_code=404, detail=f"Scheme '{scheme_id}' not found.")
    return scheme
