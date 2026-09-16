"""
AI Assistant Query Routes.
Owned by: Member 1 & Member 4

Future responsibility:
Orchestrate User Question -> Query Understanding -> RAG Retrieval ->
Rules Engine Evaluation -> Grounded Multilingual Explanation.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/assistant", tags=["assistant"])

@router.post("/query")
def assistant_query(request: dict):
    """
    Placeholder: Natural language query handler.
    The LLM will NOT determine eligibility.
    """
    return {
        "message": "Assistant query endpoint placeholder. RAG and multilingual synthesis will be implemented in Phase 2.",
        "query": request.get("query", ""),
        "disclaimer": "🔒 The LLM does NOT determine eligibility. Deterministic Rules Engine enforces official government criteria."
    }
