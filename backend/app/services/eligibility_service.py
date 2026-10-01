"""Eligibility evaluation service."""

from __future__ import annotations

from typing import Any

from app.eligibility.engine import EligibilityEngine, EligibilityResult


class EligibilityService:
    @staticmethod
    def evaluate_profile_for_scheme(
        profile: dict[str, Any],
        scheme_id: str,
        scheme: dict[str, Any] | None,
    ) -> dict[str, Any]:
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
        profile: dict[str, Any],
        schemes: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        results: list[EligibilityResult] = EligibilityEngine.evaluate_multiple_schemes(
            schemes, profile
        )
        return [result.to_dict() for result in results]

    @staticmethod
    def evaluate_profile(
        profile: dict[str, Any],
        schemes: list[dict[str, Any]],
        scheme_id: str | None = None,
    ) -> dict[str, Any]:
        if scheme_id:
            scheme = next((item for item in schemes if item["id"].upper() == scheme_id.upper()), None)
            results_list = [
                EligibilityService.evaluate_profile_for_scheme(
                    profile=profile,
                    scheme_id=scheme_id,
                    scheme=scheme,
                )
            ]
        else:
            results_list = EligibilityService.evaluate_profile_for_all_schemes(profile, schemes)

        eligible = sum(1 for result in results_list if result["overall_status"] == "ELIGIBLE")
        partial = sum(
            1 for result in results_list if result["overall_status"] == "PARTIALLY_ELIGIBLE"
        )
        ineligible = sum(
            1 for result in results_list if result["overall_status"] == "INELIGIBLE"
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
