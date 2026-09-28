"""
Eligibility Evaluation Service.
Owned by: Member 2 (Eligibility Engine)

Responsibility:
- Coordinate deterministic criteria checks between profile and scheme rules
- Return granular evaluation breakdowns (PASS, FAIL, NEEDS_VERIFICATION)
- Serve as the bridge between the API layer and the engine
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from app.eligibility.engine import EligibilityEngine, EligibilityResult
from app.eligibility.scheme_rules import get_all_schemes, get_scheme_by_id


class EligibilityService:
    """
    Service layer for eligibility evaluation.

    Coordinates lookups of scheme rules and delegates evaluation
    to the deterministic EligibilityEngine.
    """

    @staticmethod
    def evaluate_profile_for_scheme(
        profile: Dict[str, Any],
        scheme_id: str,
    ) -> Dict[str, Any]:
        """
        Evaluate a user profile against a single scheme identified by scheme_id.

        Returns:
            A dict with scheme_id, scheme_name, overall_status, and criteria_results.
            If the scheme is not found, returns an error dict.
        """
        scheme = get_scheme_by_id(scheme_id)
        if scheme is None:
            return {
                "scheme_id": scheme_id,
                "scheme_name": "Unknown",
                "overall_status": "ERROR",
                "criteria_results": [],
                "message": f"Scheme '{scheme_id}' not found.",
            }

        result: EligibilityResult = EligibilityEngine.evaluate_scheme(scheme, profile)
        return result.to_dict()

    @staticmethod
    def evaluate_profile_for_all_schemes(
        profile: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """
        Evaluate a user profile against every registered scheme.

        Returns:
            A list of result dicts, one per scheme.
        """
        schemes = get_all_schemes()
        results: List[EligibilityResult] = EligibilityEngine.evaluate_multiple_schemes(
            schemes, profile
        )
        return [r.to_dict() for r in results]

    @staticmethod
    def evaluate_profile(
        profile: Dict[str, Any],
        scheme_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Unified entry point.

        If scheme_id is provided, evaluates against that one scheme.
        Otherwise evaluates against all schemes.

        Returns a structured response dict suitable for the API layer.
        """
        if scheme_id:
            result = EligibilityService.evaluate_profile_for_scheme(profile, scheme_id)
            results_list = [result]
        else:
            results_list = EligibilityService.evaluate_profile_for_all_schemes(profile)

        # Build summary
        eligible = sum(1 for r in results_list if r["overall_status"] == "ELIGIBLE")
        partial = sum(
            1 for r in results_list if r["overall_status"] == "PARTIALLY_ELIGIBLE"
        )
        ineligible = sum(
            1 for r in results_list if r["overall_status"] == "INELIGIBLE"
        )
        total = len(results_list)

        summary = (
            f"Evaluated {total} scheme(s): "
            f"{eligible} eligible, {partial} partially eligible, "
            f"{ineligible} ineligible."
        )

        return {
            "results": results_list,
            "total_schemes_evaluated": total,
            "summary": summary,
        }
