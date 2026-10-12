"""
AI Assistant Query Routes backed by RAG and Gemini.
Owned by: Member 1 & Member 4

Orchestrates Natural Language Query -> RAG Hybrid Retrieval ->
Grounded Explanation Generation -> Citations Tracking.
Strictly enforces: The LLM does NOT determine eligibility.

Also provides:
- Ingestion management endpoints
- Language support info
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.rag.ingestion import get_ingestion_stats, ingest_knowledge_base_json
from app.rag.language import list_supported_languages
from app.schemas.assistant import (
    AssistantQueryRequest,
    AssistantQueryResponse,
    IngestionStatusResponse,
    IngestionTriggerResponse,
    SupportedLanguagesResponse,
)
from app.services.rag_service import RAGService

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.post("/query", response_model=AssistantQueryResponse)
def assistant_query(
    request: AssistantQueryRequest,
    db: Session = Depends(get_db),
):
    """
    Query the AI Assistant with natural language.
    Retrieves grounded evidence from official scheme guidelines and
    generates an answer with verified source citations.

    Supports optional conversation_history for follow-up questions.
    """
    # Convert conversation history from Pydantic models to dicts
    history = None
    if request.conversation_history:
        history = [{"role": m.role, "content": m.content} for m in request.conversation_history]

    result = RAGService.query_assistant(
        query=request.query,
        language=request.language or "en",
        state=request.state,
        category=request.category,
        top_k=request.top_k or 4,
        conversation_history=history,
        db=db,
    )
    return result


@router.get("/ingestion/status", response_model=IngestionStatusResponse)
def get_ingestion_status(db: Session = Depends(get_db)):
    """
    Get current ingestion statistics:
    total schemes, chunks, evidence records, and breakdown by state.
    """
    stats = get_ingestion_stats(db=db)
    return stats


@router.post("/ingestion/trigger", response_model=IngestionTriggerResponse)
def trigger_ingestion(
    clear_existing: bool = True,
    db: Session = Depends(get_db),
):
    """
    Trigger re-ingestion of the scheme knowledge base.
    Use clear_existing=True (default) to rebuild from scratch,
    or False to append without removing old chunks.
    """
    try:
        total_chunks = ingest_knowledge_base_json(
            db=db,
            clear_existing=clear_existing,
        )
        return IngestionTriggerResponse(
            status="success",
            total_chunks_created=total_chunks,
            message=f"Successfully ingested knowledge base. Created {total_chunks} chunks.",
        )
    except FileNotFoundError as e:
        return IngestionTriggerResponse(
            status="error",
            total_chunks_created=0,
            message=f"Knowledge base file not found: {e}",
        )
    except Exception as e:
        return IngestionTriggerResponse(
            status="error",
            total_chunks_created=0,
            message=f"Ingestion failed: {e}",
        )


@router.get("/languages")
def get_supported_languages():
    """Return list of supported response languages."""
    return SupportedLanguagesResponse(
        languages=list_supported_languages()
    )
