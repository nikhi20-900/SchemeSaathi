"""Government schemes API routes backed by SQLAlchemy."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.services.scheme_service import SchemeService

router = APIRouter(prefix="/schemes", tags=["schemes"])


@router.get("/")
def list_schemes(db: Session = Depends(get_db)):
    schemes = SchemeService.list_schemes(db)
    return {"schemes": schemes, "total": len(schemes)}


@router.get("/{scheme_id}")
def get_scheme(scheme_id: str, db: Session = Depends(get_db)):
    scheme = SchemeService.get_scheme_by_id(db, scheme_id)
    if scheme is None:
        raise HTTPException(status_code=404, detail=f"Scheme '{scheme_id}' not found.")
    return scheme


@router.get("/{scheme_id}/evidence")
def get_scheme_evidence(scheme_id: str, db: Session = Depends(get_db)):
    scheme = SchemeService.get_scheme_by_id(db, scheme_id)
    if scheme is None:
        raise HTTPException(status_code=404, detail=f"Scheme '{scheme_id}' not found.")

    evidence = SchemeService.list_evidence_for_scheme(db, scheme_id)
    return {
        "scheme_id": scheme_id,
        "evidence": evidence,
        "total": len(evidence),
    }
