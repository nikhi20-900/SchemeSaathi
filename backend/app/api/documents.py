"""Document upload and verification API routes backed by SQLAlchemy."""

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models import Document

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload")
def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    document = Document(
        document_type=file.content_type or "application/octet-stream",
        file_path=file.filename,
        verification_status="UPLOADED",
        required=False,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "message": f"Document {file.filename} uploaded successfully.",
        "document_id": str(document.id),
        "filename": file.filename,
        "verification_status": document.verification_status,
    }


@router.post("/{document_id}/verify")
def verify_document(document_id: str, db: Session = Depends(get_db)):
    document = db.get(Document, int(document_id)) if document_id.isdigit() else None
    if document is None:
        raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")

    document.verification_status = "NEEDS_REVIEW"
    db.commit()
    db.refresh(document)

    return {
        "message": f"Document {document_id} moved to verification review queue.",
        "document_id": str(document.id),
        "verification_status": document.verification_status,
    }


@router.get("/samples")
def get_sample_documents(db: Session = Depends(get_db)):
    samples = db.execute(
        select(Document)
        .where(Document.required.is_(True))
        .order_by(Document.scheme_id.asc(), Document.document_type.asc())
    ).scalars()

    return {
        "samples": [
            {
                "id": sample.id,
                "scheme_id": sample.scheme_id,
                "document_type": sample.document_type,
                "description": sample.description,
            }
            for sample in samples
        ]
    }
