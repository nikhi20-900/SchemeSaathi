"""
Document Upload and Verification API Routes.
Owned by: Member 3 (OCR + Documents)
"""

from fastapi import APIRouter, UploadFile, File

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload")
def upload_document(file: UploadFile = File(...)):
    """
    Placeholder: Upload document and trigger OCR extraction.
    """
    return {
        "message": f"Document upload placeholder for {file.filename}. OCR extraction will be implemented in Phase 2.",
        "filename": file.filename
    }

@router.post("/{document_id}/verify")
def verify_document(document_id: str):
    """
    Placeholder: Verify extracted document fields against profile.
    """
    return {
        "message": f"Document verification placeholder for {document_id}."
    }

@router.get("/samples")
def get_sample_documents():
    """
    Placeholder: List sample documents for hackathon demonstration.
    """
    return {
        "samples": []
    }
