"""
Deterministic Eligibility Rule Engine.
Owned by: Member 2 (Eligibility Engine)

Core architectural invariant:
  🔒 The LLM must NEVER independently determine eligibility.
  All eligibility decisions are made deterministically by this engine
  based on structured government scheme rules.

Responsibility:
- Evaluate a citizen's profile against published government criteria
- Return per-criterion verdicts: PASS | FAIL | NEEDS_VERIFICATION
- Derive an overall eligibility status:
    ELIGIBLE            – all criteria PASS
    INELIGIBLE          – at least one criterion FAIL
    PARTIALLY_ELIGIBLE  – mix of PASS and NEEDS_VERIFICATION (no FAIL)
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Optional

from app.eligibility.operators import evaluate_operator
from app.eligibility.validators import extract_profile_value, validate_rule_schema


# ──────────────────────────────────────────────────────────
#  Constants / Enums
# ──────────────────────────────────────────────────────────

class CriterionVerdict(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    NEEDS_VERIFICATION = "NEEDS_VERIFICATION"


class OverallStatus(str, Enum):
    ELIGIBLE = "ELIGIBLE"
    INELIGIBLE = "INELIGIBLE"
    PARTIALLY_ELIGIBLE = "PARTIALLY_ELIGIBLE"


# ──────────────────────────────────────────────────────────
#  Data containers
# ──────────────────────────────────────────────────────────

class CriterionResult:
    """Result of evaluating a single eligibility criterion."""

    __slots__ = ("criterion", "result", "user_value", "required_value", "explanation")

    def __init__(
        self,
        criterion: str,
        result: CriterionVerdict,
        user_value: Any,
        required_value: Any,
        explanation: str,
    ):
        self.criterion = criterion
        self.result = result
        self.user_value = user_value
        self.required_value = required_value
        self.explanation = explanation

    def to_dict(self) -> Dict[str, Any]:
        return {
            "criterion": self.criterion,
            "result": self.result.value,
            "user_value": self.user_value,
            "required_value": self.required_value,
            "explanation": self.explanation,
        }


class EligibilityResult:
    """Aggregated result of evaluating all criteria for a scheme."""

    __slots__ = ("scheme_id", "scheme_name", "overall_status", "criteria_results")

    def __init__(
        self,
        scheme_id: str,
        scheme_name: str,
        overall_status: OverallStatus,
        criteria_results: List[CriterionResult],
    ):
        self.scheme_id = scheme_id
        self.scheme_name = scheme_name
        self.overall_status = overall_status
        self.criteria_results = criteria_results

    def to_dict(self) -> Dict[str, Any]:
        return {
            "scheme_id": self.scheme_id,
            "scheme_name": self.scheme_name,
            "overall_status": self.overall_status.value,
            "criteria_results": [cr.to_dict() for cr in self.criteria_results],
        }


# ──────────────────────────────────────────────────────────
#  The Engine
# ──────────────────────────────────────────────────────────

class EligibilityEngine:
    """
    Deterministic Rules Engine that evaluates a user profile
    against a set of eligibility rules for a government scheme.

    Each rule is a dict with keys:
        field       – name of the profile field (e.g. "age", "state")
        operator    – comparison operator (e.g. "<=", "in", "equals")
        value       – the required value(s) from the scheme definition
        description – (optional) human-readable label for the criterion
    """

    # ────── Single-criterion evaluation ──────

    @classmethod
    def _evaluate_criterion(
        cls,
        rule: Dict[str, Any],
        user_profile: Dict[str, Any],
    ) -> CriterionResult:
        """
        Evaluate one eligibility criterion.

        Returns NEEDS_VERIFICATION when the user profile is missing the
        required field (prevents silent PASS on missing data).
        """
        field: str = rule["field"]
        operator: str = rule["operator"]
        rule_value = rule["value"]
        description: str = rule.get("description", field.replace("_", " ").title())

        # Extract & normalize the user's value
        user_value = extract_profile_value(user_profile, field)

        # Missing data → NEEDS_VERIFICATION (never a silent PASS)
        if user_value is None:
            return CriterionResult(
                criterion=description,
                result=CriterionVerdict.NEEDS_VERIFICATION,
                user_value=None,
                required_value=rule_value,
                explanation=(
                    f"Profile field '{field}' is missing. "
                    f"Please provide this information for verification."
                ),
            )

        # Evaluate the operator
        try:
            passed = evaluate_operator(operator, user_value, rule_value)
        except ValueError as exc:
            # Type mismatch or unknown operator → NEEDS_VERIFICATION
            return CriterionResult(
                criterion=description,
                result=CriterionVerdict.NEEDS_VERIFICATION,
                user_value=user_value,
                required_value=rule_value,
                explanation=f"Could not evaluate criterion: {exc}",
            )

        if passed:
            return CriterionResult(
                criterion=description,
                result=CriterionVerdict.PASS,
                user_value=user_value,
                required_value=rule_value,
                explanation=f"{description}: {user_value} satisfies {operator} {rule_value}.",
            )
        else:
            return CriterionResult(
                criterion=description,
                result=CriterionVerdict.FAIL,
                user_value=user_value,
                required_value=rule_value,
                explanation=f"{description}: {user_value} does not satisfy {operator} {rule_value}.",
            )

    # ────── Aggregate: Overall status ──────

    @staticmethod
    def _derive_overall_status(results: List[CriterionResult]) -> OverallStatus:
        """
        Derive the overall eligibility status from individual criterion results.

        Rules:
          - Any FAIL → INELIGIBLE
          - All PASS → ELIGIBLE
          - Otherwise → PARTIALLY_ELIGIBLE
        """
        has_fail = any(r.result == CriterionVerdict.FAIL for r in results)
        has_needs = any(r.result == CriterionVerdict.NEEDS_VERIFICATION for r in results)

        if has_fail:
            return OverallStatus.INELIGIBLE
        if has_needs:
            return OverallStatus.PARTIALLY_ELIGIBLE
        return OverallStatus.ELIGIBLE

    # ────── Public API ──────

    @classmethod
    def evaluate_scheme(
        cls,
        scheme: Dict[str, Any],
        user_profile: Dict[str, Any],
    ) -> EligibilityResult:
        """
        Evaluate a user profile against all eligibility rules of a scheme.

        Args:
            scheme: A scheme dict containing at minimum:
                - id (str)
                - name (str)
                - eligibility_rules (list[dict])
            user_profile: A dict with user profile fields.

        Returns:
            An EligibilityResult with per-criterion breakdowns.
        """
        scheme_id: str = scheme.get("id", "unknown")
        scheme_name: str = scheme.get("name", "Unknown Scheme")
        rules: List[Dict[str, Any]] = scheme.get("eligibility_rules", [])

        if not rules:
            return EligibilityResult(
                scheme_id=scheme_id,
                scheme_name=scheme_name,
                overall_status=OverallStatus.PARTIALLY_ELIGIBLE,
                criteria_results=[
                    CriterionResult(
                        criterion="Rules",
                        result=CriterionVerdict.NEEDS_VERIFICATION,
                        user_value=None,
                        required_value=None,
                        explanation="No eligibility rules defined for this scheme.",
                    )
                ],
            )

        # Validate each rule before evaluating
        criterion_results: List[CriterionResult] = []
        for rule in rules:
            errors = validate_rule_schema(rule)
            if errors:
                criterion_results.append(
                    CriterionResult(
                        criterion=rule.get("description", "Invalid Rule"),
                        result=CriterionVerdict.NEEDS_VERIFICATION,
                        user_value=None,
                        required_value=None,
                        explanation=f"Invalid rule definition: {'; '.join(errors)}",
                    )
                )
            else:
                criterion_results.append(cls._evaluate_criterion(rule, user_profile))

        overall = cls._derive_overall_status(criterion_results)

        return EligibilityResult(
            scheme_id=scheme_id,
            scheme_name=scheme_name,
            overall_status=overall,
            criteria_results=criterion_results,
        )

    @classmethod
    def evaluate_multiple_schemes(
        cls,
        schemes: List[Dict[str, Any]],
        user_profile: Dict[str, Any],
    ) -> List[EligibilityResult]:
        """
        Evaluate a user profile against multiple schemes.

        Returns:
            A list of EligibilityResult, one per scheme.
        """
        return [cls.evaluate_scheme(s, user_profile) for s in schemes]
