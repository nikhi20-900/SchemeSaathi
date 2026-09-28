"""
Eligibility Check API Routes.
Owned by: Member 2 (Eligibility Engine)

Endpoints:
  POST /eligibility/check   – Evaluate a user profile against scheme rules
  GET  /eligibility/schemes  – List all schemes with their eligibility rules
  GET  /eligibility/schemes/{scheme_id} – Get a single scheme's rules
"""

from fastapi import APIRouter, HTTPException

from app.schemas.eligibility import (
    EligibilityCheckRequest,
    EligibilityCheckResponse,
)
from app.services.eligibility_service import EligibilityService
from app.eligibility.scheme_rules import get_all_schemes, get_scheme_by_id

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
def check_eligibility(payload: EligibilityCheckRequest):
    """
    Evaluate a user's profile against one or all government schemes.

    - If `scheme_id` is provided, evaluates against that single scheme.
    - If `scheme_id` is omitted, evaluates against all registered schemes.

    Returns per-criterion verdicts (PASS / FAIL / NEEDS_VERIFICATION)
    and an overall status (ELIGIBLE / INELIGIBLE / PARTIALLY_ELIGIBLE).
    """
    result = EligibilityService.evaluate_profile(
        profile=payload.user_profile,
        scheme_id=payload.scheme_id,
    )
    return result


@router.get(
    "/schemes",
    summary="List all schemes with eligibility rules",
    description="Returns every registered scheme along with its structured eligibility rules.",
)
def list_schemes():
    """Return all schemes with their eligibility rules."""
    schemes = get_all_schemes()
    return {"schemes": schemes, "total": len(schemes)}


@router.get(
    "/schemes/{scheme_id}",
    summary="Get a single scheme's eligibility rules",
    description="Look up a specific scheme by ID and return its structured rules.",
)
def get_scheme(scheme_id: str):
    """Return a single scheme by ID."""
    scheme = get_scheme_by_id(scheme_id)
    if scheme is None:
        raise HTTPException(status_code=404, detail=f"Scheme '{scheme_id}' not found.")
    return scheme
