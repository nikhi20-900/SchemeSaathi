"""
Eligibility Rule Input Validators & Coercions.
Owned by: Member 2 (Eligibility Engine)

Responsibility:
- Validate and normalize user profile inputs (currency, age, category codes)
- Handle missing profile fields gracefully (NEEDS_VERIFICATION)
- Coerce string representations of numbers into floats
"""

from typing import Any, Dict, List, Optional


# ──────────────────────────────────────────────────────────
#  Profile-field normalization
# ──────────────────────────────────────────────────────────

def normalize_income(value: Any) -> Optional[float]:
    """
    Normalize an income field.
    Handles ₹/$/Rs prefix, commas, and lakh/crore suffixes.
    Returns None when the value cannot be parsed.
    """
    if isinstance(value, (int, float)):
        return float(value)
    if not isinstance(value, str):
        return None

    cleaned = (
        value.replace(",", "")
        .replace("₹", "")
        .replace("$", "")
        .replace("Rs.", "")
        .replace("Rs", "")
        .strip()
    )

    # Handle lakh / crore suffixes (common in Indian context)
    lower = cleaned.lower()
    multiplier = 1.0
    if lower.endswith("lakh") or lower.endswith("lakhs"):
        cleaned = lower.replace("lakhs", "").replace("lakh", "").strip()
        multiplier = 100_000.0
    elif lower.endswith("crore") or lower.endswith("crores"):
        cleaned = lower.replace("crores", "").replace("crore", "").strip()
        multiplier = 10_000_000.0

    try:
        return float(cleaned) * multiplier
    except (ValueError, TypeError):
        return None


def normalize_age(value: Any) -> Optional[int]:
    """Coerce an age value to an integer, or return None."""
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    if isinstance(value, str):
        try:
            return int(value.strip())
        except (ValueError, TypeError):
            return None
    return None


def normalize_string(value: Any) -> Optional[str]:
    """Lowercase-strip a string value."""
    if value is None:
        return None
    return str(value).strip().lower()


# Field-specific normalizer registry
FIELD_NORMALIZERS = {
    "age":              normalize_age,
    "annual_income":    normalize_income,
    "income":           normalize_income,
    "monthly_income":   normalize_income,
    "family_income":    normalize_income,
}


def validate_profile_field(field_name: str, value: Any) -> Any:
    """
    Validate and normalize a single profile field.

    If a dedicated normalizer exists for the field_name it is used.
    Otherwise the value is returned as-is (basic string normalization for
    string values).

    Returns:
        Normalized value, or None when the value is missing / un-parseable.
    """
    if value is None:
        return None

    normalizer = FIELD_NORMALIZERS.get(field_name)
    if normalizer is not None:
        return normalizer(value)

    # Generic string normalization for string fields
    if isinstance(value, str):
        stripped = value.strip()
        return stripped if stripped else None

    return value


def extract_profile_value(profile: Dict[str, Any], field_name: str) -> Any:
    """
    Extract and normalize a value from the user profile dict.

    Performs a case-insensitive lookup by trying the original key first,
    then a lowercase variant.

    Returns:
        The normalized value, or None if the field is absent.
    """
    raw = profile.get(field_name)
    if raw is None:
        # Try case-insensitive lookup
        lower_map = {k.lower(): v for k, v in profile.items()}
        raw = lower_map.get(field_name.lower())

    return validate_profile_field(field_name, raw)


def validate_rule_schema(rule: Dict[str, Any]) -> List[str]:
    """
    Validate that an eligibility rule dict has the required keys.
    Returns a list of error messages (empty = valid).
    """
    errors: List[str] = []
    for required_key in ("field", "operator", "value"):
        if required_key not in rule:
            errors.append(f"Missing required key '{required_key}' in rule.")
    return errors
