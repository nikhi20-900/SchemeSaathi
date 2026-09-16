"""
Demo Utility API Routes.
Owned by: Member 4 / Integration

Provides quick switching for hackathon presentations (e.g. toggling income to show eligibility change).
"""

from fastapi import APIRouter

router = APIRouter(prefix="/demo", tags=["demo"])

@router.post("/toggle-income")
def toggle_income(income: float):
    """
    Placeholder: Demo toggle between ₹2,40,000 and ₹4,00,000.
    """
    return {
        "message": f"Demo income toggled to ₹{income:,.0f}."
    }

@router.post("/reset")
def reset_demo():
    """
    Placeholder: Reset demo state to default profile.
    """
    return {
        "message": "Demo reset to defaults."
    }
