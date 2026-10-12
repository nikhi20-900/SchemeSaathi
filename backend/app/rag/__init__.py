"""
RAG Engine Package.
Owned by: Member 1 (AI + RAG + Data)
"""

from app.rag.chunking import chunk_document_text, chunk_scheme_document, clean_text
from app.rag.embeddings import cosine_similarity, generate_embedding, generate_embeddings_batch
from app.rag.ingestion import (
    extract_text_from_file,
    get_ingestion_stats,
    ingest_knowledge_base_json,
    ingest_scheme_documents,
)
from app.rag.language import (
    SUPPORTED_LANGUAGES,
    detect_language,
    get_disclaimer,
    get_language_config,
    get_llm_language_instruction,
    get_no_results_message,
    is_language_supported,
    list_supported_languages,
)
from app.rag.pdf_extractor import extract_pdf_metadata, extract_text_from_pdf
from app.rag.retrieval import retrieve_relevant_chunks, retrieve_relevant_schemes

__all__ = [
    # Chunking
    "chunk_document_text",
    "chunk_scheme_document",
    "clean_text",
    # Embeddings
    "generate_embedding",
    "generate_embeddings_batch",
    "cosine_similarity",
    # Ingestion
    "ingest_knowledge_base_json",
    "ingest_scheme_documents",
    "extract_text_from_file",
    "get_ingestion_stats",
    # PDF
    "extract_text_from_pdf",
    "extract_pdf_metadata",
    # Retrieval
    "retrieve_relevant_chunks",
    "retrieve_relevant_schemes",
    # Language / i18n
    "SUPPORTED_LANGUAGES",
    "detect_language",
    "get_language_config",
    "get_llm_language_instruction",
    "get_disclaimer",
    "get_no_results_message",
    "is_language_supported",
    "list_supported_languages",
]
