"""
Deterministic Eligibility Engine Package.
Owned by: Member 2 (Eligibility Engine)
"""

from app.eligibility.engine import (
    CriterionResult,
    CriterionVerdict,
    EligibilityEngine,
    EligibilityResult,
    OverallStatus,
)
from app.eligibility.operators import evaluate_operator
from app.eligibility.validators import (
    extract_profile_value,
    normalize_age,
    normalize_income,
    validate_profile_field,
    validate_rule_schema,
)

__all__ = [
    "CriterionResult",
    "CriterionVerdict",
    "EligibilityEngine",
    "EligibilityResult",
    "OverallStatus",
    "evaluate_operator",
    "extract_profile_value",
    "normalize_age",
    "normalize_income",
    "validate_profile_field",
    "validate_rule_schema",
]
