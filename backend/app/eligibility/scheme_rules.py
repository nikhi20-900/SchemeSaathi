"""
Example Government Scheme Eligibility Rules.
Owned by: Member 2 (Eligibility Engine)

This module provides sample scheme definitions with structured eligibility
rules. In production these would be stored in a database; for Phase 2 we
keep them in-memory as a reference data set.

Each scheme is a dict with:
  - id, name, department, state, description, benefits
  - eligibility_rules: list of rule dicts (field, operator, value, description)
"""

from typing import Any, Dict, List


EXAMPLE_SCHEMES: List[Dict[str, Any]] = [
    {
        "id": "KA-SCHOLARSHIP-001",
        "name": "Karnataka Post-Matric Scholarship for OBC Students",
        "department": "Department of Backward Classes and Minorities",
        "state": "Karnataka",
        "description": (
            "Scholarship for OBC students pursuing post-matric education "
            "in Karnataka with family income below ₹2,50,000 per annum."
        ),
        "benefits": "Full tuition fees + maintenance allowance",
        "eligibility_rules": [
            {
                "field": "age",
                "operator": ">=",
                "value": 17,
                "description": "Minimum Age",
            },
            {
                "field": "age",
                "operator": "<=",
                "value": 35,
                "description": "Maximum Age",
            },
            {
                "field": "state",
                "operator": "in",
                "value": ["Karnataka"],
                "description": "State",
            },
            {
                "field": "education",
                "operator": "in",
                "value": [
                    "Undergraduate",
                    "Postgraduate",
                    "Diploma",
                    "Professional",
                ],
                "description": "Education Level",
            },
            {
                "field": "annual_income",
                "operator": "<=",
                "value": 250000,
                "description": "Annual Family Income",
            },
            {
                "field": "category",
                "operator": "in",
                "value": ["OBC", "2A", "2B", "3A", "3B"],
                "description": "Category",
            },
            {
                "field": "student_status",
                "operator": "equals",
                "value": True,
                "description": "Currently Enrolled Student",
            },
            {
                "field": "domicile_certificate",
                "operator": "equals",
                "value": True,
                "description": "Domicile Certificate",
            },
        ],
    },
    {
        "id": "IN-PMKVY-001",
        "name": "Pradhan Mantri Kaushal Vikas Yojana (PMKVY)",
        "department": "Ministry of Skill Development and Entrepreneurship",
        "state": "All India",
        "description": (
            "Skill certification and training scheme for Indian youth "
            "aged 15–45 to improve employability."
        ),
        "benefits": "Free skill training + certification + monetary reward",
        "eligibility_rules": [
            {
                "field": "age",
                "operator": ">=",
                "value": 15,
                "description": "Minimum Age",
            },
            {
                "field": "age",
                "operator": "<=",
                "value": 45,
                "description": "Maximum Age",
            },
            {
                "field": "nationality",
                "operator": "equals",
                "value": "Indian",
                "description": "Nationality",
            },
            {
                "field": "aadhaar_linked",
                "operator": "equals",
                "value": True,
                "description": "Aadhaar Linked",
            },
        ],
    },
    {
        "id": "IN-PMAY-001",
        "name": "Pradhan Mantri Awas Yojana – Gramin (PMAY-G)",
        "department": "Ministry of Rural Development",
        "state": "All India",
        "description": (
            "Housing subsidy for economically weaker sections in rural "
            "areas with household income up to ₹3,00,000."
        ),
        "benefits": "₹1,20,000 (plain areas) / ₹1,30,000 (hilly areas) subsidy",
        "eligibility_rules": [
            {
                "field": "annual_income",
                "operator": "<=",
                "value": 300000,
                "description": "Annual Household Income",
            },
            {
                "field": "area_type",
                "operator": "equals",
                "value": "Rural",
                "description": "Area Type",
            },
            {
                "field": "owns_pucca_house",
                "operator": "equals",
                "value": False,
                "description": "Does Not Own Pucca House",
            },
            {
                "field": "category",
                "operator": "in",
                "value": ["SC", "ST", "OBC", "EWS", "2A", "2B", "3A", "3B"],
                "description": "Category",
            },
        ],
    },
    {
        "id": "KA-FARM-001",
        "name": "Karnataka Raitha Siri Scheme",
        "department": "Department of Agriculture, Karnataka",
        "state": "Karnataka",
        "description": (
            "Crop loan interest subvention for small and marginal farmers "
            "in Karnataka holding up to 5 acres of land."
        ),
        "benefits": "0% interest on crop loans up to ₹3,00,000",
        "eligibility_rules": [
            {
                "field": "state",
                "operator": "equals",
                "value": "Karnataka",
                "description": "State",
            },
            {
                "field": "occupation",
                "operator": "equals",
                "value": "Farmer",
                "description": "Occupation",
            },
            {
                "field": "land_holding_acres",
                "operator": "<=",
                "value": 5,
                "description": "Land Holding (acres)",
            },
            {
                "field": "has_bank_account",
                "operator": "equals",
                "value": True,
                "description": "Has Bank Account",
            },
        ],
    },
]


def get_all_schemes() -> List[Dict[str, Any]]:
    """Return all example schemes with eligibility rules."""
    return EXAMPLE_SCHEMES


def get_scheme_by_id(scheme_id: str) -> Dict[str, Any] | None:
    """Look up a scheme by its ID (case-insensitive)."""
    target = scheme_id.strip().upper()
    for scheme in EXAMPLE_SCHEMES:
        if scheme["id"].upper() == target:
            return scheme
    return None
