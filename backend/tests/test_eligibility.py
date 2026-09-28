"""
Test Suite for Eligibility Engine.
Owned by: Member 2 (Eligibility Engine)

Tests:
- Operator evaluation (all 8+ operators)
- Validator / normalizer functions
- Full engine evaluation (eligible, ineligible, partial, boundary, missing data)
- API endpoint integration tests
"""

import pytest
from fastapi.testclient import TestClient

from app.eligibility.operators import evaluate_operator
from app.eligibility.validators import (
    normalize_income,
    normalize_age,
    validate_profile_field,
    extract_profile_value,
    validate_rule_schema,
)
from app.eligibility.engine import (
    CriterionVerdict,
    EligibilityEngine,
    OverallStatus,
)
from app.main import app


client = TestClient(app)


# ════════════════════════════════════════════════════════
#  1. Operator Tests
# ════════════════════════════════════════════════════════

class TestOperators:
    """Test each comparison operator."""

    def test_equals_numeric(self):
        assert evaluate_operator("equals", 20, 20) is True
        assert evaluate_operator("==", 20, 20) is True
        assert evaluate_operator("eq", 20, 21) is False

    def test_equals_string(self):
        assert evaluate_operator("equals", "Karnataka", "karnataka") is True
        assert evaluate_operator("equals", "Karnataka", "Tamil Nadu") is False

    def test_not_equals(self):
        assert evaluate_operator("not_equals", 20, 21) is True
        assert evaluate_operator("!=", "A", "a") is False  # case-insensitive

    def test_greater_than(self):
        assert evaluate_operator("greater_than", 25, 18) is True
        assert evaluate_operator(">", 18, 18) is False
        assert evaluate_operator("gt", 10, 20) is False

    def test_greater_than_or_equal(self):
        assert evaluate_operator(">=", 18, 18) is True
        assert evaluate_operator("gte", 25, 18) is True
        assert evaluate_operator("greater_than_or_equal", 17, 18) is False

    def test_less_than(self):
        assert evaluate_operator("<", 10, 20) is True
        assert evaluate_operator("lt", 20, 20) is False
        assert evaluate_operator("less_than", 30, 20) is False

    def test_less_than_or_equal(self):
        assert evaluate_operator("<=", 20, 20) is True
        assert evaluate_operator("lte", 10, 20) is True
        assert evaluate_operator("less_than_or_equal", 21, 20) is False

    def test_in_operator(self):
        assert evaluate_operator("in", "Karnataka", ["Karnataka", "Tamil Nadu"]) is True
        assert evaluate_operator("in", "Goa", ["Karnataka", "Tamil Nadu"]) is False
        # Case-insensitive
        assert evaluate_operator("in", "karnataka", ["Karnataka"]) is True

    def test_not_in_operator(self):
        assert evaluate_operator("not_in", "Goa", ["Karnataka", "Tamil Nadu"]) is True
        assert evaluate_operator("not_in", "Karnataka", ["Karnataka"]) is False

    def test_contains_operator(self):
        assert evaluate_operator("contains", "Undergraduate", "Under") is True
        assert evaluate_operator("contains", "BCA", "MBA") is False

    def test_unknown_operator_raises(self):
        with pytest.raises(ValueError, match="Unknown operator"):
            evaluate_operator("xor", 1, 2)

    def test_numeric_comparison_on_strings_raises(self):
        with pytest.raises(ValueError):
            evaluate_operator(">", "hello", "world")

    def test_currency_string_numeric(self):
        """Ensure ₹-prefixed strings are coerced correctly."""
        assert evaluate_operator("<=", "₹2,40,000", 250000) is True
        assert evaluate_operator("<=", "₹3,00,000", 250000) is False


# ════════════════════════════════════════════════════════
#  2. Validator / Normalizer Tests
# ════════════════════════════════════════════════════════

class TestValidators:

    def test_normalize_income_int(self):
        assert normalize_income(240000) == 240000.0

    def test_normalize_income_string_with_currency(self):
        assert normalize_income("₹2,40,000") == 240000.0

    def test_normalize_income_lakh_suffix(self):
        assert normalize_income("2.5 lakh") == 250000.0

    def test_normalize_income_crore_suffix(self):
        assert normalize_income("1 crore") == 10000000.0

    def test_normalize_income_invalid(self):
        assert normalize_income("not a number") is None

    def test_normalize_age(self):
        assert normalize_age(20) == 20
        assert normalize_age("25") == 25
        assert normalize_age(20.5) == 20
        assert normalize_age("abc") is None

    def test_validate_profile_field_income(self):
        assert validate_profile_field("annual_income", "₹2,40,000") == 240000.0

    def test_validate_profile_field_generic(self):
        assert validate_profile_field("state", "  Karnataka  ") == "Karnataka"

    def test_validate_profile_field_none(self):
        assert validate_profile_field("age", None) is None

    def test_extract_profile_value_exists(self):
        profile = {"age": 20, "state": "Karnataka"}
        assert extract_profile_value(profile, "age") == 20

    def test_extract_profile_value_case_insensitive(self):
        profile = {"Age": 20}
        assert extract_profile_value(profile, "age") == 20

    def test_extract_profile_value_missing(self):
        profile = {"age": 20}
        assert extract_profile_value(profile, "height") is None

    def test_validate_rule_schema_valid(self):
        rule = {"field": "age", "operator": ">=", "value": 18}
        assert validate_rule_schema(rule) == []

    def test_validate_rule_schema_missing_field(self):
        rule = {"operator": ">=", "value": 18}
        errors = validate_rule_schema(rule)
        assert len(errors) == 1
        assert "field" in errors[0]

    def test_validate_rule_schema_all_missing(self):
        errors = validate_rule_schema({})
        assert len(errors) == 3


# ════════════════════════════════════════════════════════
#  3. Engine Tests
# ════════════════════════════════════════════════════════

class TestEligibilityEngine:
    """Test the core eligibility engine."""

    SAMPLE_SCHEME = {
        "id": "TEST-001",
        "name": "Test Scholarship",
        "eligibility_rules": [
            {"field": "age", "operator": ">=", "value": 17, "description": "Minimum Age"},
            {"field": "age", "operator": "<=", "value": 35, "description": "Maximum Age"},
            {"field": "state", "operator": "in", "value": ["Karnataka"], "description": "State"},
            {"field": "annual_income", "operator": "<=", "value": 250000, "description": "Annual Income"},
            {"field": "category", "operator": "in", "value": ["OBC", "2A", "2B"], "description": "Category"},
        ],
    }

    def test_fully_eligible(self):
        """Profile that satisfies all criteria → ELIGIBLE."""
        profile = {
            "age": 20,
            "state": "Karnataka",
            "annual_income": 240000,
            "category": "2A",
        }
        result = EligibilityEngine.evaluate_scheme(self.SAMPLE_SCHEME, profile)
        assert result.overall_status == OverallStatus.ELIGIBLE
        for cr in result.criteria_results:
            assert cr.result == CriterionVerdict.PASS

    def test_ineligible_age_too_old(self):
        """Age over 35 → at least one FAIL → INELIGIBLE."""
        profile = {
            "age": 40,
            "state": "Karnataka",
            "annual_income": 240000,
            "category": "2A",
        }
        result = EligibilityEngine.evaluate_scheme(self.SAMPLE_SCHEME, profile)
        assert result.overall_status == OverallStatus.INELIGIBLE
        max_age_result = next(
            cr for cr in result.criteria_results if cr.criterion == "Maximum Age"
        )
        assert max_age_result.result == CriterionVerdict.FAIL

    def test_ineligible_wrong_state(self):
        """Wrong state → FAIL → INELIGIBLE."""
        profile = {
            "age": 20,
            "state": "Tamil Nadu",
            "annual_income": 240000,
            "category": "2A",
        }
        result = EligibilityEngine.evaluate_scheme(self.SAMPLE_SCHEME, profile)
        assert result.overall_status == OverallStatus.INELIGIBLE

    def test_ineligible_income_too_high(self):
        """Income above threshold → FAIL → INELIGIBLE."""
        profile = {
            "age": 20,
            "state": "Karnataka",
            "annual_income": 500000,
            "category": "2A",
        }
        result = EligibilityEngine.evaluate_scheme(self.SAMPLE_SCHEME, profile)
        assert result.overall_status == OverallStatus.INELIGIBLE

    def test_boundary_income_exact(self):
        """Boundary: income exactly equals the threshold → PASS (<=)."""
        profile = {
            "age": 20,
            "state": "Karnataka",
            "annual_income": 250000,
            "category": "2A",
        }
        result = EligibilityEngine.evaluate_scheme(self.SAMPLE_SCHEME, profile)
        income_result = next(
            cr for cr in result.criteria_results if cr.criterion == "Annual Income"
        )
        assert income_result.result == CriterionVerdict.PASS

    def test_boundary_income_one_above(self):
        """Boundary: income one rupee above threshold → FAIL."""
        profile = {
            "age": 20,
            "state": "Karnataka",
            "annual_income": 250001,
            "category": "2A",
        }
        result = EligibilityEngine.evaluate_scheme(self.SAMPLE_SCHEME, profile)
        income_result = next(
            cr for cr in result.criteria_results if cr.criterion == "Annual Income"
        )
        assert income_result.result == CriterionVerdict.FAIL

    def test_boundary_age_min(self):
        """Boundary: age exactly at minimum → PASS."""
        profile = {
            "age": 17,
            "state": "Karnataka",
            "annual_income": 240000,
            "category": "2A",
        }
        result = EligibilityEngine.evaluate_scheme(self.SAMPLE_SCHEME, profile)
        min_age_result = next(
            cr for cr in result.criteria_results if cr.criterion == "Minimum Age"
        )
        assert min_age_result.result == CriterionVerdict.PASS

    def test_boundary_age_below_min(self):
        """Boundary: age one below minimum → FAIL."""
        profile = {
            "age": 16,
            "state": "Karnataka",
            "annual_income": 240000,
            "category": "2A",
        }
        result = EligibilityEngine.evaluate_scheme(self.SAMPLE_SCHEME, profile)
        min_age_result = next(
            cr for cr in result.criteria_results if cr.criterion == "Minimum Age"
        )
        assert min_age_result.result == CriterionVerdict.FAIL

    def test_missing_field_needs_verification(self):
        """Missing profile field → NEEDS_VERIFICATION (never silent PASS)."""
        profile = {
            "age": 20,
            "state": "Karnataka",
            # annual_income missing
            "category": "2A",
        }
        result = EligibilityEngine.evaluate_scheme(self.SAMPLE_SCHEME, profile)
        income_result = next(
            cr for cr in result.criteria_results if cr.criterion == "Annual Income"
        )
        assert income_result.result == CriterionVerdict.NEEDS_VERIFICATION

    def test_missing_field_produces_partially_eligible(self):
        """Missing data → no FAIL but has NEEDS_VERIFICATION → PARTIALLY_ELIGIBLE."""
        profile = {
            "age": 20,
            "state": "Karnataka",
            # annual_income missing
            "category": "2A",
        }
        result = EligibilityEngine.evaluate_scheme(self.SAMPLE_SCHEME, profile)
        assert result.overall_status == OverallStatus.PARTIALLY_ELIGIBLE

    def test_empty_profile_all_needs_verification(self):
        """Completely empty profile → all NEEDS_VERIFICATION."""
        result = EligibilityEngine.evaluate_scheme(self.SAMPLE_SCHEME, {})
        for cr in result.criteria_results:
            assert cr.result == CriterionVerdict.NEEDS_VERIFICATION
        assert result.overall_status == OverallStatus.PARTIALLY_ELIGIBLE

    def test_no_rules_scheme(self):
        """Scheme with no rules → PARTIALLY_ELIGIBLE."""
        scheme = {"id": "EMPTY", "name": "Empty Scheme", "eligibility_rules": []}
        result = EligibilityEngine.evaluate_scheme(scheme, {"age": 20})
        assert result.overall_status == OverallStatus.PARTIALLY_ELIGIBLE

    def test_criterion_explanation_present(self):
        """Every criterion result should have a non-empty explanation."""
        profile = {"age": 20, "state": "Karnataka", "annual_income": 240000, "category": "2A"}
        result = EligibilityEngine.evaluate_scheme(self.SAMPLE_SCHEME, profile)
        for cr in result.criteria_results:
            assert cr.explanation and len(cr.explanation) > 0

    def test_evaluate_multiple_schemes(self):
        """evaluate_multiple_schemes returns one result per scheme."""
        schemes = [self.SAMPLE_SCHEME, {"id": "EMPTY", "name": "Empty", "eligibility_rules": []}]
        profile = {"age": 20, "state": "Karnataka", "annual_income": 240000, "category": "2A"}
        results = EligibilityEngine.evaluate_multiple_schemes(schemes, profile)
        assert len(results) == 2

    def test_to_dict_serialization(self):
        """Result.to_dict() produces a clean JSON-serializable dict."""
        profile = {"age": 20, "state": "Karnataka", "annual_income": 240000, "category": "2A"}
        result = EligibilityEngine.evaluate_scheme(self.SAMPLE_SCHEME, profile)
        d = result.to_dict()
        assert isinstance(d, dict)
        assert "scheme_id" in d
        assert "overall_status" in d
        assert isinstance(d["criteria_results"], list)


# ════════════════════════════════════════════════════════
#  4. API Integration Tests
# ════════════════════════════════════════════════════════

class TestEligibilityAPI:
    """Test the FastAPI endpoints."""

    def test_check_all_schemes(self):
        """POST /api/eligibility/check without scheme_id evaluates all."""
        response = client.post(
            "/api/eligibility/check",
            json={
                "user_profile": {
                    "age": 20,
                    "state": "Karnataka",
                    "education": "Undergraduate",
                    "annual_income": 240000,
                    "student_status": True,
                    "category": "2A",
                },
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert data["total_schemes_evaluated"] > 0

    def test_check_specific_scheme(self):
        """POST /api/eligibility/check with scheme_id evaluates just one."""
        response = client.post(
            "/api/eligibility/check",
            json={
                "user_profile": {
                    "age": 20,
                    "state": "Karnataka",
                    "education": "Undergraduate",
                    "annual_income": 240000,
                    "student_status": True,
                    "category": "2A",
                },
                "scheme_id": "KA-SCHOLARSHIP-001",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_schemes_evaluated"] == 1
        assert data["results"][0]["scheme_id"] == "KA-SCHOLARSHIP-001"

    def test_check_unknown_scheme(self):
        """POST /api/eligibility/check with unknown scheme_id returns error result."""
        response = client.post(
            "/api/eligibility/check",
            json={
                "user_profile": {"age": 20},
                "scheme_id": "DOES-NOT-EXIST",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["results"][0]["overall_status"] == "ERROR"

    def test_list_schemes(self):
        """GET /api/eligibility/schemes returns all schemes."""
        response = client.get("/api/eligibility/schemes")
        assert response.status_code == 200
        data = response.json()
        assert "schemes" in data
        assert data["total"] > 0
        # Each scheme should have eligibility_rules
        for scheme in data["schemes"]:
            assert "eligibility_rules" in scheme

    def test_get_scheme_by_id(self):
        """GET /api/eligibility/schemes/{id} returns the scheme."""
        response = client.get("/api/eligibility/schemes/KA-SCHOLARSHIP-001")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "KA-SCHOLARSHIP-001"

    def test_get_scheme_not_found(self):
        """GET /api/eligibility/schemes/{id} returns 404 for unknown."""
        response = client.get("/api/eligibility/schemes/DOES-NOT-EXIST")
        assert response.status_code == 404

    def test_structured_json_response(self):
        """API returns structured JSON that the frontend can consume."""
        response = client.post(
            "/api/eligibility/check",
            json={
                "user_profile": {
                    "age": 20,
                    "state": "Karnataka",
                    "education": "Undergraduate",
                    "annual_income": 240000,
                    "student_status": True,
                    "category": "2A",
                },
            },
        )
        data = response.json()
        # Verify structure
        assert "results" in data
        assert "total_schemes_evaluated" in data
        assert "summary" in data
        for result in data["results"]:
            assert "scheme_id" in result
            assert "overall_status" in result
            assert "criteria_results" in result
            for cr in result["criteria_results"]:
                assert "criterion" in cr
                assert "result" in cr
                assert cr["result"] in ("PASS", "FAIL", "NEEDS_VERIFICATION")
                assert "explanation" in cr

    def test_example_from_issue(self):
        """
        Reproduce the exact example from the GitHub issue:
        Age: 20, State: Karnataka, Education: BCA, Income: ₹2,40,000.
        """
        response = client.post(
            "/api/eligibility/check",
            json={
                "user_profile": {
                    "age": 20,
                    "state": "Karnataka",
                    "education": "Undergraduate",
                    "course": "BCA",
                    "annual_income": 240000,
                    "student_status": True,
                    "category": "2A",
                },
                "scheme_id": "KA-SCHOLARSHIP-001",
            },
        )
        assert response.status_code == 200
        data = response.json()
        result = data["results"][0]

        # Age, State, Education, Income, Category, Student Status → PASS
        # Domicile → NEEDS_VERIFICATION (missing)
        pass_criteria = {
            cr["criterion"] for cr in result["criteria_results"] if cr["result"] == "PASS"
        }
        needs_criteria = {
            cr["criterion"] for cr in result["criteria_results"]
            if cr["result"] == "NEEDS_VERIFICATION"
        }
        assert "Minimum Age" in pass_criteria
        assert "Maximum Age" in pass_criteria
        assert "State" in pass_criteria
        assert "Annual Income" in pass_criteria or "Annual Family Income" in pass_criteria
        assert "Domicile Certificate" in needs_criteria
