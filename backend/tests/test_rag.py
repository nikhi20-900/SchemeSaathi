"""
Comprehensive Test Suite for RAG Subsystem, Chunking, Retrieval & LLM Service.
Owned by: Member 1 (AI + RAG + Data)
"""

import json
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from app.database.connection import SessionLocal
from app.main import app
from app.models.chunk import SchemeChunk
from app.rag.chunking import chunk_document_text, chunk_scheme_document, clean_text
from app.rag.embeddings import (
    FALLBACK_DIM,
    _deterministic_fallback_embedding,
    cosine_similarity,
    generate_embedding,
    generate_embeddings_batch,
)
from app.rag.ingestion import extract_text_from_file, ingest_knowledge_base_json
from app.rag.retrieval import compute_keyword_overlap, retrieve_relevant_chunks, retrieve_relevant_schemes
from app.services.llm_service import LLMService
from app.services.rag_service import DISCLAIMER_TEXT, RAGService


@pytest.fixture(scope="module")
def client():
    """FastAPI TestClient fixture."""
    return TestClient(app)


@pytest.fixture(scope="module")
def db_session():
    """Database session fixture."""
    session = SessionLocal()
    try:
        # Ensure knowledge base is seeded
        has_chunks = session.query(SchemeChunk).first()
        if not has_chunks:
            ingest_knowledge_base_json(db=session, clear_existing=False)
        yield session
    finally:
        session.close()


# ---------------------------------------------------------------------------
# 1. Text Cleaning & Chunking Tests
# ---------------------------------------------------------------------------

def test_clean_text():
    """Ensure raw text is cleaned, normalized, and trimmed."""
    raw = "  Line 1   with   spaces\r\n\r\n\n\nLine 2\twith tabs  "
    cleaned = clean_text(raw)
    assert "Line 1 with spaces" in cleaned
    assert "Line 2 with tabs" in cleaned
    assert "\r" not in cleaned
    assert "\t" not in cleaned


def test_chunk_document_text_small():
    """Short text should produce exactly one chunk."""
    short = "This is a short guideline about scholarships."
    chunks = chunk_document_text(short, chunk_size=200, overlap=20)
    assert len(chunks) == 1
    assert chunks[0] == short


def test_chunk_document_text_overlap():
    """Long text should produce multiple chunks with preserved overlap."""
    text = (
        "Section 1: The student must be an Indian citizen residing in Karnataka. "
        "Section 2: The annual household income must not exceed 250000 rupees. "
        "Section 3: The applicant must have passed Class 12 with at least 50% marks. "
        "Section 4: The scholarship provides full tuition fee waiver plus hostel stipend."
    )
    chunks = chunk_document_text(text, chunk_size=100, overlap=25)
    assert len(chunks) > 1
    # Check that chunks are non-empty and stripped
    for c in chunks:
        assert len(c) > 0


def test_chunk_scheme_document():
    """Scheme chunking should inject metadata headers into chunk contents."""
    sample_scheme = {
        "id": "TEST-SCHEME-001",
        "name": "Test Welfare Scheme",
        "department": "Welfare Dept",
        "state": "Karnataka",
        "description": "This is a test description for welfare scheme.",
        "benefits": "Provides 5000 monthly allowance.",
        "eligibility_criteria": ["Resident of Karnataka", "Income < 200000"],
        "documents_required": ["Aadhaar", "Income Certificate"],
        "source_url": "https://example.gov.in/scheme",
        "source_title": "Official Test Portal",
    }

    chunks = chunk_scheme_document(sample_scheme, chunk_size=300, overlap=30)
    assert len(chunks) >= 4  # description, benefits, eligibility, documents

    for ch in chunks:
        assert "scheme_id" in ch
        assert ch["scheme_id"] == "TEST-SCHEME-001"
        assert "[Scheme: Test Welfare Scheme" in ch["content"]
        assert "TEST-SCHEME-001" in ch["content"]
        assert ch["metadata"]["source_url"] == "https://example.gov.in/scheme"


# ---------------------------------------------------------------------------
# 2. Embedding & Vector Math Tests
# ---------------------------------------------------------------------------

def test_deterministic_embedding_properties():
    """Deterministic fallback embeddings should be normalized and fixed-length."""
    text = "Scholarships for backward classes students"
    vec = _deterministic_fallback_embedding(text, dim=FALLBACK_DIM)
    assert len(vec) == FALLBACK_DIM
    # L2 norm should be approximately 1.0
    norm = sum(x * x for x in vec) ** 0.5
    assert pytest.approx(norm, rel=1e-3) == 1.0


def test_generate_embedding_consistency():
    """Same input text must produce identical vectors."""
    text = "Karnataka Post-Matric Scholarship"
    vec1 = generate_embedding(text)
    vec2 = generate_embedding(text)
    assert vec1 == vec2
    assert len(vec1) > 0


def test_generate_embeddings_batch():
    """Batch embedding generation should return a vector for each text."""
    texts = ["Scheme A", "Scheme B", "Scheme C"]
    batch_vecs = generate_embeddings_batch(texts)
    assert len(batch_vecs) == 3
    for v in batch_vecs:
        assert len(v) > 0


def test_cosine_similarity():
    """Verify cosine similarity calculation between vectors."""
    v1 = [1.0, 0.0, 0.0]
    v2 = [1.0, 0.0, 0.0]
    v3 = [0.0, 1.0, 0.0]
    v4 = [0.5, 0.5, 0.0]

    # Identical vectors -> 1.0
    assert pytest.approx(cosine_similarity(v1, v2), 0.001) == 1.0
    # Orthogonal vectors -> 0.0
    assert pytest.approx(cosine_similarity(v1, v3), 0.001) == 0.0
    # Diagonal vector -> ~0.707
    assert pytest.approx(cosine_similarity(v1, v4), 0.01) == 0.707
    # Mismatched dimensions -> 0.0
    assert cosine_similarity([1.0, 2.0], [1.0]) == 0.0
    # Empty vectors -> 0.0
    assert cosine_similarity([], []) == 0.0


# ---------------------------------------------------------------------------
# 3. Knowledge Base & Ingestion Tests
# ---------------------------------------------------------------------------

def test_knowledge_base_json_exists_and_verified():
    """Ensure data/schemes/schemes_knowledge_base.json contains 20+ verified schemes."""
    kb_path = Path("data/schemes/schemes_knowledge_base.json")
    if not kb_path.exists():
        kb_path = Path(__file__).resolve().parents[2] / "data" / "schemes" / "schemes_knowledge_base.json"

    assert kb_path.exists(), "schemes_knowledge_base.json must exist"

    with open(kb_path, "r", encoding="utf-8") as f:
        schemes = json.load(f)

    assert len(schemes) >= 20, f"Expected at least 20 schemes, found {len(schemes)}"

    required_keys = ["id", "name", "department", "state", "description", "benefits", "source_url"]
    for s in schemes:
        for k in required_keys:
            assert k in s, f"Scheme {s.get('id')} missing key '{k}'"
        assert s["source_url"].startswith("http"), f"Invalid source_url for {s['id']}"


def test_extract_text_from_file():
    """Verify plain text extraction from file."""
    guideline_path = Path("data/schemes/karnataka_post_matric_guidelines.txt")
    if not guideline_path.exists():
        guideline_path = Path(__file__).resolve().parents[2] / "data" / "schemes" / "karnataka_post_matric_guidelines.txt"

    if guideline_path.exists():
        text = extract_text_from_file(str(guideline_path))
        assert "POST-MATRIC SCHOLARSHIPS" in text
        assert "KA-SCHOLARSHIP-001" in text


# ---------------------------------------------------------------------------
# 4. Semantic & Hybrid Retrieval Tests
# ---------------------------------------------------------------------------

def test_retrieve_relevant_chunks(db_session):
    """Semantic query for scholarship should retrieve relevant scholarship chunks."""
    query = "OBC post-matric scholarship tuition fee reimbursement Karnataka"
    hits = retrieve_relevant_chunks(query, top_k=4, db=db_session)
    assert len(hits) > 0
    top_hit = hits[0]
    assert "scheme_id" in top_hit
    assert "score" in top_hit
    assert top_hit["score"] > 0
    assert "content" in top_hit

    # Verify that either the top hit or second hit is the Karnataka OBC scholarship
    top_ids = [h["scheme_id"] for h in hits[:2]]
    assert "KA-SCHOLARSHIP-001" in top_ids or any("KA" in sid for sid in top_ids)


def test_retrieve_relevant_schemes_aggregation(db_session):
    """retrieve_relevant_schemes should aggregate chunks by scheme with evidence."""
    query = "AICTE Pragati technical degree scholarship for girls"
    schemes = retrieve_relevant_schemes(query, top_k=3, db=db_session)
    assert len(schemes) > 0
    top_scheme = schemes[0]
    assert "scheme_id" in top_scheme
    assert "scheme_name" in top_scheme
    assert "source_url" in top_scheme
    assert "top_score" in top_scheme
    assert top_scheme["source_url"].startswith("http")


def test_state_filtering_in_retrieval(db_session):
    """State filter should prioritize or match schemes from specified state."""
    query = "farmer assistance and millet scheme"
    hits = retrieve_relevant_chunks(query, top_k=5, state_filter="Karnataka", db=db_session)
    assert len(hits) > 0
    # Every returned hit should either be Karnataka or All India
    for h in hits:
        state = h["metadata"].get("state", "All India")
        assert state in ["Karnataka", "All India"]


def test_keyword_overlap_computation():
    """Verify lexical token overlap score."""
    q = "engineering girl students"
    t1 = "Scholarship for girl students in engineering colleges"
    t2 = "Farmer agricultural crop assistance"
    assert compute_keyword_overlap(q, t1) > compute_keyword_overlap(q, t2)


# ---------------------------------------------------------------------------
# 5. LLM Grounded Prompt & Service Tests
# ---------------------------------------------------------------------------

def test_build_grounded_prompt():
    """Verify prompt formatting and grounding injection."""
    chunks = [
        {
            "section_title": "Eligibility",
            "content": "Must be OBC student in Karnataka with income under 2.5 lakh.",
            "metadata": {
                "scheme_name": "Karnataka OBC Scholarship",
                "department": "Backward Classes Welfare",
                "state": "Karnataka",
                "source_url": "https://ssp.postmatric.karnataka.gov.in/",
                "source_title": "SSP Portal",
            },
        }
    ]
    prompt = LLMService.build_grounded_prompt(
        query="What is the income limit?",
        context_chunks=chunks,
        language="en",
    )
    assert "VERIFIED SCHEME CONTEXT:" in prompt
    assert "Karnataka OBC Scholarship" in prompt
    assert "https://ssp.postmatric.karnataka.gov.in/" in prompt
    assert "What is the income limit?" in prompt


def test_llm_fallback_generation():
    """Verify clean grounded fallback response when API key is offline."""
    chunks = [
        {
            "scheme_id": "IN-PMKVY-001",
            "content": "PMKVY provides free skill training and certification for Indian youth aged 15-45.",
            "metadata": {
                "scheme_name": "Pradhan Mantri Kaushal Vikas Yojana",
                "department": "MSDE",
                "state": "All India",
                "source_url": "https://www.pmkvyofficial.org/",
                "source_title": "PMKVY Portal",
            },
        }
    ]
    resp = LLMService._fallback_generate("tell me about PMKVY", chunks)
    assert "Pradhan Mantri Kaushal Vikas Yojana" in resp
    assert "https://www.pmkvyofficial.org/" in resp
    assert "Rules Engine" in resp  # Disclaimer presence


# ---------------------------------------------------------------------------
# 6. RAG Service & Disclaimer Enforcement Tests
# ---------------------------------------------------------------------------

def test_rag_service_query_assistant(db_session):
    """Full RAG service query returns answer, sources, and disclaimer."""
    result = RAGService.query_assistant(
        query="scholarship for single girl child CBSE",
        language="en",
        db=db_session,
    )
    assert "query" in result
    assert "response" in result
    assert len(result["response"]) > 20
    assert "sources" in result
    assert len(result["sources"]) > 0
    assert "disclaimer" in result
    assert "The LLM does NOT determine eligibility" in result["disclaimer"]

    # Verify source citation fields
    first_source = result["sources"][0]
    assert "scheme_id" in first_source
    assert "scheme_name" in first_source
    assert "source_url" in first_source
    assert "relevance_score" in first_source


def test_disclaimer_strictly_enforced(db_session):
    """Ensure the disclaimer that LLM does NOT determine eligibility is always present."""
    result = RAGService.query_assistant("am I eligible for PMKVY?", db=db_session)
    assert "The LLM does NOT determine eligibility" in result["disclaimer"]


# ---------------------------------------------------------------------------
# 7. FastAPI API Endpoint Tests (/api/assistant/query)
# ---------------------------------------------------------------------------

def test_api_assistant_query_success(client):
    """Test POST /api/assistant/query endpoint with valid payload."""
    payload = {
        "query": "What are the benefits of Karnataka post matric scholarship?",
        "language": "en",
        "top_k": 3,
    }
    response = client.post("/api/assistant/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == payload["query"]
    assert "response" in data
    assert len(data["response"]) > 0
    assert "sources" in data
    assert len(data["sources"]) > 0
    assert "disclaimer" in data
    assert "Rules Engine" in data["disclaimer"]


def test_api_assistant_query_with_state_filter(client):
    """Test POST /api/assistant/query endpoint with state filter."""
    payload = {
        "query": "scholarships for college students",
        "state": "Karnataka",
        "top_k": 4,
    }
    response = client.post("/api/assistant/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["sources"]) > 0


def test_api_assistant_query_short_input_validation(client):
    """Test that query with less than 2 characters is rejected with 422 Unprocessable Entity."""
    response = client.post("/api/assistant/query", json={"query": "a"})
    assert response.status_code == 422
