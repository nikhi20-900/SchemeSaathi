"""
Eligibility Rule and Result Pydantic Schemas.
Managed by: Member 2 / Eligibility Engine

Future responsibility:
Pydantic schemas for eligibility evaluation requests, criterion results, and overall verdicts.
"""

from typing import Any, List
from pydantic import BaseModel

class CriterionEvaluationResult(BaseModel):
    criterion: str
    result: str  # "PASS", "FAIL", "NEEDS_VERIFICATION"
    user_value: Any
    required_value: Any
    explanation: str

class SchemeEligibilityResult(BaseModel):
    scheme_id: str
    overall_status: str  # "ELIGIBLE", "PARTIALLY_ELIGIBLE", "INELIGIBLE"
    criteria_results: List[CriterionEvaluationResult] = []
