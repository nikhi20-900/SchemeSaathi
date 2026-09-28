"""
Eligibility Rule Operators.
Owned by: Member 2 (Eligibility Engine)

Implements mathematical and logical operators for deterministic rule evaluation:
- equals (==)
- not_equals (!=)
- greater_than (>)
- greater_than_or_equal (>=)
- less_than (<)
- less_than_or_equal (<=)
- in
- not_in
- contains
"""

from typing import Any, List, Union


def _coerce_numeric(value: Any) -> Union[float, None]:
    """
    Attempt to coerce a value to a float for numeric comparisons.
    Strips common currency symbols (₹, $, etc.) and commas.
    Returns None if coercion fails.
    """
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        cleaned = value.replace(",", "").replace("₹", "").replace("$", "").replace("Rs.", "").replace("Rs", "").strip()
        try:
            return float(cleaned)
        except (ValueError, TypeError):
            return None
    return None


def _normalize_string(value: Any) -> str:
    """Normalize a string value for case-insensitive comparison."""
    return str(value).strip().lower()


def _normalize_list(values: Any) -> List[str]:
    """Normalize a list of values for case-insensitive 'in' comparisons."""
    if isinstance(values, list):
        return [_normalize_string(v) for v in values]
    if isinstance(values, str):
        return [_normalize_string(v) for v in values.split(",")]
    return [_normalize_string(values)]


# ──────────────────────────────────────────────────────────
#  Operator dispatch table
# ──────────────────────────────────────────────────────────

def _op_equals(user_value: Any, rule_value: Any) -> bool:
    """Check equality – numeric-aware, case-insensitive for strings."""
    num_u = _coerce_numeric(user_value)
    num_r = _coerce_numeric(rule_value)
    if num_u is not None and num_r is not None:
        return num_u == num_r
    return _normalize_string(user_value) == _normalize_string(rule_value)


def _op_not_equals(user_value: Any, rule_value: Any) -> bool:
    return not _op_equals(user_value, rule_value)


def _op_greater_than(user_value: Any, rule_value: Any) -> bool:
    num_u = _coerce_numeric(user_value)
    num_r = _coerce_numeric(rule_value)
    if num_u is None or num_r is None:
        raise ValueError(
            f"Cannot compare non-numeric values with '>': "
            f"user={user_value!r}, rule={rule_value!r}"
        )
    return num_u > num_r


def _op_greater_than_or_equal(user_value: Any, rule_value: Any) -> bool:
    num_u = _coerce_numeric(user_value)
    num_r = _coerce_numeric(rule_value)
    if num_u is None or num_r is None:
        raise ValueError(
            f"Cannot compare non-numeric values with '>=': "
            f"user={user_value!r}, rule={rule_value!r}"
        )
    return num_u >= num_r


def _op_less_than(user_value: Any, rule_value: Any) -> bool:
    num_u = _coerce_numeric(user_value)
    num_r = _coerce_numeric(rule_value)
    if num_u is None or num_r is None:
        raise ValueError(
            f"Cannot compare non-numeric values with '<': "
            f"user={user_value!r}, rule={rule_value!r}"
        )
    return num_u < num_r


def _op_less_than_or_equal(user_value: Any, rule_value: Any) -> bool:
    num_u = _coerce_numeric(user_value)
    num_r = _coerce_numeric(rule_value)
    if num_u is None or num_r is None:
        raise ValueError(
            f"Cannot compare non-numeric values with '<=': "
            f"user={user_value!r}, rule={rule_value!r}"
        )
    return num_u <= num_r


def _op_in(user_value: Any, rule_value: Any) -> bool:
    """Check if user_value is in the rule_value list."""
    allowed = _normalize_list(rule_value)
    return _normalize_string(user_value) in allowed


def _op_not_in(user_value: Any, rule_value: Any) -> bool:
    """Check if user_value is NOT in the rule_value list."""
    return not _op_in(user_value, rule_value)


def _op_contains(user_value: Any, rule_value: Any) -> bool:
    """Check if user_value (string) contains rule_value as a substring."""
    return _normalize_string(rule_value) in _normalize_string(user_value)


# Canonical mapping from operator name → function
OPERATOR_MAP = {
    "equals":                  _op_equals,
    "eq":                      _op_equals,
    "==":                      _op_equals,
    "not_equals":              _op_not_equals,
    "ne":                      _op_not_equals,
    "!=":                      _op_not_equals,
    "greater_than":            _op_greater_than,
    "gt":                      _op_greater_than,
    ">":                       _op_greater_than,
    "greater_than_or_equal":   _op_greater_than_or_equal,
    "gte":                     _op_greater_than_or_equal,
    ">=":                      _op_greater_than_or_equal,
    "less_than":               _op_less_than,
    "lt":                      _op_less_than,
    "<":                       _op_less_than,
    "less_than_or_equal":      _op_less_than_or_equal,
    "lte":                     _op_less_than_or_equal,
    "<=":                      _op_less_than_or_equal,
    "in":                      _op_in,
    "not_in":                  _op_not_in,
    "contains":                _op_contains,
}


def evaluate_operator(operator: str, user_value: Any, rule_value: Any) -> bool:
    """
    Evaluate a single operator against user and rule values.

    Args:
        operator:   One of the canonical operator names (e.g. "equals", ">=", "in").
        user_value: The value from the user's profile.
        rule_value: The required value from the scheme's eligibility rule.

    Returns:
        True if the user_value satisfies the rule, False otherwise.

    Raises:
        ValueError: If the operator is unknown or the values cannot be compared.
    """
    op_fn = OPERATOR_MAP.get(operator)
    if op_fn is None:
        raise ValueError(f"Unknown operator: {operator!r}")
    return op_fn(user_value, rule_value)
