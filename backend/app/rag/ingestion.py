"""
Official Government Scheme Document Ingestion & Indexing.
Owned by: Member 1 (AI + RAG + Data)

Ingests verified government scheme datasets (JSON and text/guidelines),
extracts content, generates chunks and vector embeddings, and stores
them in the scheme_chunks table.
"""

import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.chunk import SchemeChunk
from app.models.evidence import Evidence
from app.models.scheme import Scheme
from app.rag.chunking import chunk_document_text, chunk_scheme_document
from app.rag.embeddings import generate_embedding

logger = logging.getLogger(__name__)


def extract_text_from_file(file_path: str) -> str:
    """Extract and read plain text from document files (.txt, .md, .json)."""
    path = Path(file_path)
    if not path.exists():
        logger.warning(f"File not found: {file_path}")
        return ""

    if path.suffix.lower() in [".txt", ".md", ".csv"]:
        try:
            return path.read_text(encoding="utf-8", errors="ignore")
        except Exception as e:
            logger.error(f"Error reading {file_path}: {e}")
            return ""

    if path.suffix.lower() == ".json":
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(data, list):
                return "\n\n".join(
                    f"Scheme: {item.get('name', '')}\n{item.get('detailed_text', '')}"
                    for item in data if isinstance(item, dict)
                )
            elif isinstance(data, dict):
                return str(data.get("detailed_text", json.dumps(data)))
        except Exception as e:
            logger.error(f"Error reading JSON {file_path}: {e}")
            return ""

    return ""


def ingest_knowledge_base_json(
    json_path: Optional[str] = None,
    db: Optional[Session] = None,
    clear_existing: bool = True,
) -> int:
    """
    Ingest the master verified scheme knowledge base JSON into the database.
    Seeds schemes, creates scheme chunks with embeddings, and seeds evidence.
    """
    if json_path is None:
        # Resolve path relative to project root or workspace
        candidates = [
            Path("data/schemes/schemes_knowledge_base.json"),
            Path(__file__).resolve().parents[3] / "data" / "schemes" / "schemes_knowledge_base.json",
            Path(os.getcwd()) / "data" / "schemes" / "schemes_knowledge_base.json",
        ]
        target = next((p for p in candidates if p.exists()), None)
        if not target:
            raise FileNotFoundError("Could not locate schemes_knowledge_base.json")
        json_path = str(target)

    with open(json_path, "r", encoding="utf-8") as f:
        schemes_data: List[Dict[str, Any]] = json.load(f)

    should_close_db = False
    if db is None:
        db = SessionLocal()
        should_close_db = True

    total_chunks_created = 0

    try:
        if clear_existing:
            db.execute(delete(SchemeChunk))
            db.commit()

        existing_scheme_ids = {s.id for s in db.execute(select(Scheme)).scalars()}

        for sdata in schemes_data:
            sid = sdata.get("id")
            if not sid:
                continue

            # Ensure scheme exists in schemes table
            if sid not in existing_scheme_ids:
                new_scheme = Scheme(
                    id=sid,
                    name=sdata.get("name", "Unnamed Scheme"),
                    department=sdata.get("department"),
                    state=sdata.get("state", "All India"),
                    description=sdata.get("description"),
                    benefits=sdata.get("benefits"),
                )
                db.add(new_scheme)
                db.flush()
                existing_scheme_ids.add(sid)

            # Ensure evidence record exists for the scheme
            has_evidence = db.execute(
                select(Evidence.id).where(Evidence.scheme_id == sid).limit(1)
            ).first()
            if not has_evidence and sdata.get("source_url"):
                db.add(
                    Evidence(
                        scheme_id=sid,
                        source_title=sdata.get("source_title", f"{sdata.get('name')} Guidelines"),
                        source_url=sdata.get("source_url", "https://www.india.gov.in/"),
                        content=sdata.get("description", "")[:500],
                        page_or_section="Overview",
                    )
                )

            # Chunk the scheme document
            chunks = chunk_scheme_document(sdata)

            for c in chunks:
                emb = generate_embedding(c["content"])
                chunk_record = SchemeChunk(
                    scheme_id=sid,
                    chunk_index=c["chunk_index"],
                    section_title=c["section_title"],
                    content=c["content"],
                )
                chunk_record.metadata_dict = c["metadata"]
                chunk_record.embedding = emb
                db.add(chunk_record)
                total_chunks_created += 1

        db.commit()
        logger.info(
            f"Successfully ingested {len(schemes_data)} schemes with {total_chunks_created} chunks."
        )
    finally:
        if should_close_db:
            db.close()

    return total_chunks_created


def ingest_scheme_documents(directory_path: str = "data/schemes") -> List[Dict[str, Any]]:
    """
    Ingest arbitrary document text files from a directory, chunk them,
    and return index summary.
    """
    dir_path = Path(directory_path)
    if not dir_path.exists():
        logger.warning(f"Directory not found: {directory_path}")
        return []

    results = []
    db = SessionLocal()
    try:
        for file in dir_path.glob("*.*"):
            if file.suffix.lower() in [".txt", ".md"]:
                content = extract_text_from_file(str(file))
                if not content:
                    continue
                chunks = chunk_document_text(content, chunk_size=500, overlap=50)
                results.append({
                    "filename": file.name,
                    "num_chunks": len(chunks),
                    "character_count": len(content),
                })
        return results
    finally:
        db.close()
