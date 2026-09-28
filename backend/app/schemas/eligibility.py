"""
Eligibility Rule and Result Pydantic Schemas.
Managed by: Member 2 / Eligibility Engine

Pydantic schemas for:
- Eligibility rule definitions
- Eligibility evaluation requests
- Criterion-level results
- Overall eligibility verdicts
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ──────────────────────────────────────────────────────────
#  Rule definition schemas
# ──────────────────────────────────────────────────────────

class EligibilityRuleSchema(BaseModel):
    """Schema for a single eligibility rule attached to a scheme."""

    field: str = Field(
        ..., description="Profile field to evaluate (e.g. 'age', 'state', 'annual_income')."
    )
    operator: str = Field(
        ...,
        description=(
            "Comparison operator. Supported: "
            "equals, not_equals, greater_than, greater_than_or_equal, "
            "less_than, less_than_or_equal, in, not_in, contains "
            "(and shorthand aliases like ==, !=, >, >=, <, <=)."
        ),
    )
    value: Any = Field(
        ..., description="The required value(s) from the scheme definition."
    )
    description: Optional[str] = Field(
        None, description="Human-readable label for this criterion."
    )


class SchemeWithRulesSchema(BaseModel):
    """A scheme definition that includes structured eligibility rules."""

    id: str
    name: str
    department: Optional[str] = None
    description: Optional[str] = None
    eligibility_rules: List[EligibilityRuleSchema] = []


# ──────────────────────────────────────────────────────────
#  Evaluation request / response schemas
# ──────────────────────────────────────────────────────────

class EligibilityCheckRequest(BaseModel):
    """Request body for the eligibility check endpoint."""

    user_profile: Dict[str, Any] = Field(
        ...,
        description="User profile dict with fields like age, state, annual_income, etc.",
        json_schema_extra={
            "example": {
                "name": "Nikhil Kumar",
                "age": 20,
                "state": "Karnataka",
                "education": "Undergraduate",
                "course": "BCA",
                "annual_income": 240000,
                "student_status": True,
                "category": "2A",
            }
        },
    )
    scheme_id: Optional[str] = Field(
        None,
        description="Evaluate against a specific scheme. If omitted, all schemes are evaluated.",
    )


class CriterionEvaluationResult(BaseModel):
    """Result of evaluating a single eligibility criterion."""

    criterion: str = Field(..., description="Name / label of the criterion.")
    result: str = Field(
        ..., description="Verdict: PASS, FAIL, or NEEDS_VERIFICATION."
    )
    user_value: Any = Field(None, description="The user's actual value for this field.")
    required_value: Any = Field(None, description="The scheme's required value.")
    explanation: str = Field(
        ..., description="Human-readable explanation of the verdict."
    )


class SchemeEligibilityResult(BaseModel):
    """Aggregated eligibility result for one scheme."""

    scheme_id: str
    scheme_name: str = ""
    overall_status: str = Field(
        ...,
        description="Overall verdict: ELIGIBLE, INELIGIBLE, or PARTIALLY_ELIGIBLE.",
    )
    criteria_results: List[CriterionEvaluationResult] = []


class EligibilityCheckResponse(BaseModel):
    """Response body for the eligibility check endpoint."""

    results: List[SchemeEligibilityResult] = []
    total_schemes_evaluated: int = 0
    summary: Optional[str] = None
