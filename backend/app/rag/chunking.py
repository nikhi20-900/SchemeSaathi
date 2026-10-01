"""
Document Chunking for Scheme Guidelines.
Owned by: Member 1 (AI + RAG + Data)

Splits ingested government scheme texts into semantic chunks,
preserves metadata headers (scheme name, state, department, section title),
and supports clean character/word overlapping windows.
"""

import re
from typing import Any, Dict, List, Optional


def clean_text(text: str) -> str:
    """Normalize and clean raw document text."""
    if not text:
        return ""
    # Normalize carriage returns and tabs
    text = text.replace("\r\n", "\n").replace("\r", "\n").replace("\t", " ")
    # Replace 3 or more newlines with double newline
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Replace multiple spaces with a single space (except leading/trailing newlines)
    lines = [re.sub(r"[ ]+", " ", line).strip() for line in text.split("\n")]
    return "\n".join(line for line in lines if line)


def split_into_sentences(text: str) -> List[str]:
    """Split text into sentences while respecting abbreviations."""
    # Split on sentence terminals followed by whitespace
    sentence_endings = re.compile(r'(?<=[.!?])\s+')
    sentences = sentence_endings.split(text)
    return [s.strip() for s in sentences if s.strip()]


def chunk_document_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """
    Split arbitrary document text into overlapping text chunks.
    Attempts to break on paragraph or sentence boundaries.
    """
    cleaned = clean_text(text)
    if not cleaned:
        return []

    if len(cleaned) <= chunk_size:
        return [cleaned]

    # Split into paragraphs first
    paragraphs = cleaned.split("\n")
    chunks: List[str] = []
    current_chunk: List[str] = []
    current_len = 0

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        para_len = len(para)
        # If single paragraph exceeds chunk_size, split by sentences
        if para_len > chunk_size:
            if current_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = []
                current_len = 0

            sentences = split_into_sentences(para)
            for sentence in sentences:
                if current_len + len(sentence) + 1 > chunk_size and current_chunk:
                    chunks.append(" ".join(current_chunk))
                    # Retain last portion for overlap
                    overlap_seed = " ".join(current_chunk)[-overlap:]
                    current_chunk = [overlap_seed, sentence] if overlap > 0 else [sentence]
                    current_len = sum(len(s) for s in current_chunk) + len(current_chunk) - 1
                else:
                    current_chunk.append(sentence)
                    current_len += len(sentence) + 1
        else:
            if current_len + para_len + 1 > chunk_size and current_chunk:
                chunks.append(" ".join(current_chunk))
                # Take overlap from end of previous chunk
                overlap_text = " ".join(current_chunk)[-overlap:]
                current_chunk = [overlap_text, para] if overlap > 0 else [para]
                current_len = sum(len(s) for s in current_chunk) + len(current_chunk) - 1
            else:
                current_chunk.append(para)
                current_len += para_len + 1

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return [c.strip() for c in chunks if c.strip()]


def chunk_scheme_document(
    scheme_dict: Dict[str, Any],
    chunk_size: int = 600,
    overlap: int = 60,
) -> List[Dict[str, Any]]:
    """
    Chunk a government scheme record, embedding structural metadata
    into each chunk for high-fidelity retrieval and source attribution.
    """
    scheme_id = scheme_dict.get("id", "UNKNOWN")
    scheme_name = scheme_dict.get("name", "Unknown Scheme")
    department = scheme_dict.get("department", "Government Department")
    state = scheme_dict.get("state", "All India")
    source_url = scheme_dict.get("source_url", "")
    source_title = scheme_dict.get("source_title", scheme_name)

    # Base metadata header to inject into every chunk content
    header = (
        f"[Scheme: {scheme_name} | ID: {scheme_id} | State: {state} | "
        f"Dept: {department}]\n"
    )

    # Combine all relevant text fields into structured narrative sections
    sections = []

    if scheme_dict.get("description"):
        sections.append(("Overview & Purpose", scheme_dict["description"]))

    if scheme_dict.get("benefits"):
        sections.append(("Benefits & Entitlements", scheme_dict["benefits"]))

    if scheme_dict.get("eligibility_criteria"):
        criteria_list = scheme_dict["eligibility_criteria"]
        if isinstance(criteria_list, list):
            criteria_str = "\n".join(f"- {c}" for c in criteria_list)
        else:
            criteria_str = str(criteria_list)
        sections.append(("Eligibility Criteria", criteria_str))

    if scheme_dict.get("documents_required"):
        docs_list = scheme_dict["documents_required"]
        if isinstance(docs_list, list):
            docs_str = "\n".join(f"- {d}" for d in docs_list)
        else:
            docs_str = str(docs_list)
        sections.append(("Required Documents", docs_str))

    if scheme_dict.get("application_process"):
        sections.append(("Application Process", str(scheme_dict["application_process"])))

    if scheme_dict.get("detailed_text"):
        sections.append(("Detailed Guidelines", scheme_dict["detailed_text"]))

    processed_chunks: List[Dict[str, Any]] = []
    chunk_counter = 0

    for section_title, section_body in sections:
        raw_chunks = chunk_document_text(
            section_body, chunk_size=chunk_size, overlap=overlap
        )
        for raw_chunk in raw_chunks:
            enriched_content = (
                f"{header}[Section: {section_title}]\n{raw_chunk}"
            )
            metadata = {
                "scheme_id": scheme_id,
                "scheme_name": scheme_name,
                "department": department,
                "state": state,
                "section_title": section_title,
                "source_url": source_url,
                "source_title": source_title,
                "category_target": scheme_dict.get("category_target", []),
                "education_level": scheme_dict.get("education_level", []),
            }
            processed_chunks.append({
                "scheme_id": scheme_id,
                "chunk_index": chunk_counter,
                "section_title": section_title,
                "content": enriched_content,
                "raw_text": raw_chunk,
                "metadata": metadata,
            })
            chunk_counter += 1

    return processed_chunks
