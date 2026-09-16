"""
Government Schemes API Routes.
Owned by: Member 1 & Member 4
"""

from fastapi import APIRouter

router = APIRouter(prefix="/schemes", tags=["schemes"])

@router.get("/")
def list_schemes():
    """
    Placeholder: List verified government schemes.
    """
    return {
        "message": "Schemes endpoint placeholder. Full scheme dataset in Phase 2.",
        "schemes": []
    }

@router.get("/{scheme_id}")
def get_scheme(scheme_id: str):
    """
    Placeholder: Get details of a specific scheme.
    """
    return {
        "message": f"Scheme details placeholder for {scheme_id}.",
        "scheme_id": scheme_id
    }

@router.get("/{scheme_id}/evidence")
def get_scheme_evidence(scheme_id: str):
    """
    Placeholder: Get official gazetted evidence for a scheme.
    """
    return {
        "message": f"Official evidence placeholder for {scheme_id}."
    }
