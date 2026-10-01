"""
RAG Engine Package.
Owned by: Member 1 (AI + RAG + Data)
"""

from app.rag.chunking import chunk_document_text, chunk_scheme_document, clean_text
from app.rag.embeddings import cosine_similarity, generate_embedding, generate_embeddings_batch
from app.rag.ingestion import extract_text_from_file, ingest_knowledge_base_json, ingest_scheme_documents
from app.rag.retrieval import retrieve_relevant_chunks, retrieve_relevant_schemes

__all__ = [
    "chunk_document_text",
    "chunk_scheme_document",
    "clean_text",
    "generate_embedding",
    "generate_embeddings_batch",
    "cosine_similarity",
    "ingest_knowledge_base_json",
    "ingest_scheme_documents",
    "extract_text_from_file",
    "retrieve_relevant_chunks",
    "retrieve_relevant_schemes",
]
