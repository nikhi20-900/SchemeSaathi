"""
RAG Knowledge Retrieval & Synthesis Orchestrator Service.
Owned by: Member 1 (AI + RAG + Data)

Coordinates semantic retrieval of scheme chunks, context assembly,
Gemini grounded response synthesis, and official citation tracking.
"""

import logging
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.rag.retrieval import retrieve_relevant_chunks, retrieve_relevant_schemes
from app.services.llm_service import LLMService

logger = logging.getLogger(__name__)

DISCLAIMER_TEXT = (
    "🔒 The LLM does NOT determine eligibility. Deterministic Rules Engine "
    "enforces official government criteria."
)


class RAGService:
    """Orchestrator for SchemeSaathi's AI & RAG Subsystem."""

    @classmethod
    def query_assistant(
        cls,
        query: str,
        language: str = "en",
        state: Optional[str] = None,
        category: Optional[str] = None,
        top_k: int = 4,
        db: Optional[Session] = None,
    ) -> Dict[str, Any]:
        """
        Full RAG pipeline invocation:
        1. Retrieve top-k relevant scheme chunks based on semantic & keyword similarity.
        2. Format source citations.
        3. Pass grounded context to Gemini LLMService.
        4. Return synthesized explanation with sources and official disclaimers.
        """
        should_close_db = False
        if db is None:
            db = SessionLocal()
            should_close_db = True

        try:
            # 1. Semantic + Lexical Retrieval
            chunks = retrieve_relevant_chunks(
                query=query,
                top_k=top_k,
                state_filter=state,
                category_filter=category,
                db=db,
            )

            # 2. Extract Citations & Evidence
            sources: List[Dict[str, Any]] = []
            seen_schemes = set()

            for ch in chunks:
                meta = ch.get("metadata", {})
                sid = ch.get("scheme_id") or meta.get("scheme_id", "UNKNOWN")
                scheme_name = meta.get("scheme_name", sid)
                section = ch.get("section_title", "Guidelines")
                url = meta.get("source_url", "https://www.india.gov.in/")
                title = meta.get("source_title", f"{scheme_name} Official Portal")

                sources.append({
                    "scheme_id": sid,
                    "scheme_name": scheme_name,
                    "department": meta.get("department", "Government of India"),
                    "state": meta.get("state", "All India"),
                    "section_title": section,
                    "source_title": title,
                    "source_url": url,
                    "relevance_score": ch.get("score", 0.0),
                    "matched_snippet": ch.get("raw_text", ch.get("content", ""))[:300],
                })
                seen_schemes.add(sid)

            # 3. Grounded Explanation Generation
            explanation = LLMService.generate_explanation(
                query=query,
                context_chunks=chunks,
                language=language,
            )

            return {
                "query": query,
                "language": language,
                "response": explanation,
                "sources": sources,
                "matched_schemes_count": len(seen_schemes),
                "disclaimer": DISCLAIMER_TEXT,
            }

        finally:
            if should_close_db:
                db.close()

    @staticmethod
    def retrieve_schemes_and_evidence(
        query: str,
        top_k: int = 5,
        state_filter: Optional[str] = None,
        db: Optional[Session] = None,
    ) -> List[Dict[str, Any]]:
        """Direct scheme and evidence retrieval for other subsystems."""
        return retrieve_relevant_schemes(
            query=query, top_k=top_k, state_filter=state_filter, db=db
        )
