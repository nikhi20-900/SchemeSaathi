"""
AI Assistant Query Routes backed by RAG and Gemini.
Owned by: Member 1 & Member 4

Orchestrates Natural Language Query -> RAG Hybrid Retrieval ->
Grounded Explanation Generation -> Citations Tracking.
Strictly enforces: The LLM does NOT determine eligibility.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.assistant import AssistantQueryRequest, AssistantQueryResponse
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
    """
    result = RAGService.query_assistant(
        query=request.query,
        language=request.language or "en",
        state=request.state,
        category=request.category,
        top_k=request.top_k or 4,
        db=db,
    )
    return result
