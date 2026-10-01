"""
Scheme Vector & Keyword Hybrid Retrieval.
Owned by: Member 1 (AI + RAG + Data)

Performs semantic vector search and hybrid keyword matching over
stored scheme document chunks, with optional state and category filtering.
"""

import logging
import re
from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.chunk import SchemeChunk
from app.models.evidence import Evidence
from app.models.scheme import Scheme
from app.rag.embeddings import cosine_similarity, generate_embedding

logger = logging.getLogger(__name__)


def compute_keyword_overlap(query: str, text: str) -> float:
    """Calculate token overlap score between query and chunk text."""
    query_tokens = set(re.findall(r"\w+", query.lower()))
    if not query_tokens:
        return 0.0
    text_tokens = set(re.findall(r"\w+", text.lower()))
    intersection = query_tokens.intersection(text_tokens)
    return len(intersection) / len(query_tokens)


def retrieve_relevant_chunks(
    query: str,
    top_k: int = 5,
    state_filter: Optional[str] = None,
    category_filter: Optional[str] = None,
    db: Optional[Session] = None,
) -> List[Dict[str, Any]]:
    """
    Retrieve the top-K most semantically and lexically relevant chunks for a user query.
    Applies hybrid ranking (cosine similarity + keyword boost).
    """
    if not query or not query.strip():
        return []

    should_close_db = False
    if db is None:
        db = SessionLocal()
        should_close_db = True

    try:
        # Load all chunks from the database
        chunks: List[SchemeChunk] = list(db.execute(select(SchemeChunk)).scalars())

        if not chunks:
            logger.warning("No scheme chunks found in database. Retrying after ingestion.")
            from app.rag.ingestion import ingest_knowledge_base_json
            try:
                ingest_knowledge_base_json(db=db)
                chunks = list(db.execute(select(SchemeChunk)).scalars())
            except Exception as e:
                logger.error(f"Failed to auto-ingest knowledge base: {e}")
                return []

        # Generate query embedding
        query_embedding = generate_embedding(query)

        scored_chunks = []
        for chunk in chunks:
            chunk_meta = chunk.metadata_dict

            # State filtering: match if All India or matches target state
            if state_filter and state_filter.lower() != "all india":
                chunk_state = chunk_meta.get("state", "All India").lower()
                if chunk_state != "all india" and state_filter.lower() not in chunk_state:
                    continue

            # Category filtering
            if category_filter:
                cat_targets = [c.lower() for c in chunk_meta.get("category_target", [])]
                if cat_targets and "all" not in cat_targets and category_filter.lower() not in cat_targets:
                    # Soft filter: reduce priority slightly instead of strict elimination
                    category_penalty = 0.9
                else:
                    category_penalty = 1.0
            else:
                category_penalty = 1.0

            chunk_emb = chunk.embedding
            if chunk_emb:
                vector_sim = cosine_similarity(query_embedding, chunk_emb)
            else:
                vector_sim = 0.0

            keyword_score = compute_keyword_overlap(query, chunk.content)

            # Combined hybrid score (70% vector + 30% keyword) * category penalty
            hybrid_score = (0.7 * vector_sim + 0.3 * keyword_score) * category_penalty

            scored_chunks.append({
                "chunk_id": chunk.id,
                "scheme_id": chunk.scheme_id,
                "score": round(hybrid_score, 4),
                "similarity": round(vector_sim, 4),
                "keyword_score": round(keyword_score, 4),
                "section_title": chunk.section_title,
                "content": chunk.content,
                "metadata": chunk_meta,
            })

        # Sort by descending hybrid score
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        return scored_chunks[:top_k]

    finally:
        if should_close_db:
            db.close()


def retrieve_relevant_schemes(
    query: str,
    top_k: int = 5,
    state_filter: Optional[str] = None,
    db: Optional[Session] = None,
) -> List[Dict[str, Any]]:
    """
    Retrieve top schemes matching query, aggregated by scheme ID with evidence.
    """
    chunks = retrieve_relevant_chunks(
        query=query,
        top_k=top_k * 3,  # retrieve more chunks to get diverse schemes
        state_filter=state_filter,
        db=db,
    )

    should_close_db = False
    if db is None:
        db = SessionLocal()
        should_close_db = True

    try:
        schemes_by_id: Dict[str, Dict[str, Any]] = {}

        for ch in chunks:
            sid = ch.get("scheme_id")
            if not sid:
                continue

            if sid not in schemes_by_id:
                meta = ch.get("metadata", {})
                scheme_obj = db.get(Scheme, sid)
                scheme_name = scheme_obj.name if scheme_obj else meta.get("scheme_name", sid)
                department = scheme_obj.department if scheme_obj else meta.get("department", "")
                state = scheme_obj.state if scheme_obj else meta.get("state", "All India")
                benefits = scheme_obj.benefits if scheme_obj else ""

                # Look up evidence URL
                evidence_rec = db.execute(
                    select(Evidence).where(Evidence.scheme_id == sid).limit(1)
                ).scalar_one_or_none()

                schemes_by_id[sid] = {
                    "scheme_id": sid,
                    "scheme_name": scheme_name,
                    "department": department,
                    "state": state,
                    "benefits": benefits,
                    "top_score": ch["score"],
                    "matched_sections": [ch["section_title"]],
                    "snippets": [ch["content"]],
                    "source_url": evidence_rec.source_url if evidence_rec else meta.get("source_url", "https://www.india.gov.in/"),
                    "source_title": evidence_rec.source_title if evidence_rec else meta.get("source_title", f"{scheme_name} Official Portal"),
                }
            else:
                entry = schemes_by_id[sid]
                if ch["section_title"] not in entry["matched_sections"]:
                    entry["matched_sections"].append(ch["section_title"])
                if len(entry["snippets"]) < 3:
                    entry["snippets"].append(ch["content"])

        ranked_schemes = sorted(schemes_by_id.values(), key=lambda s: s["top_score"], reverse=True)
        return ranked_schemes[:top_k]

    finally:
        if should_close_db:
            db.close()
