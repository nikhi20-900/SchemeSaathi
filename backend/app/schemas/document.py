"""
Document and OCR Verification Pydantic Schemas.
Managed by: Member 3 / OCR & Documents

Future responsibility:
Pydantic schemas for uploaded documents, OCR extracted fields, and profile consistency results.
"""

from typing import Dict, Any, List
from pydantic import BaseModel

class DocumentFieldComparison(BaseModel):
    field_name: str
    extracted_value: Any
    profile_value: Any
    match: bool
    status: str  # "MATCH", "MISMATCH", "NOT_FOUND"

class DocumentVerificationResult(BaseModel):
    document_id: str
    document_type: str
    verification_status: str  # "VERIFIED", "MISMATCH", "NEEDS_REVIEW"
    extracted_data: Dict[str, Any] = {}
    profile_comparison: List[DocumentFieldComparison] = []
    summary: str
