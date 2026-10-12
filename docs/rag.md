# RAG Pipeline Documentation

## Overview

SchemeSaathi's RAG (Retrieval-Augmented Generation) subsystem powers the AI assistant by retrieving verified government scheme information and generating grounded, citation-backed responses using Google Gemini.

### Architecture

```
User Query → Language Detection → Semantic Retrieval → Context Assembly → Gemini LLM → Grounded Response
                                       ↕
                              Scheme Knowledge Base
                              (32 verified schemes)
                                       ↕
                              SchemeChunks + Embeddings
                                  (SQLite/pgvector)
```

## Components

### 1. Ingestion Pipeline (`backend/app/rag/ingestion.py`)

Responsible for loading verified government scheme data into the database.

**Supported file formats:**
- `.json` — Structured scheme knowledge base (primary)
- `.txt` / `.md` — Raw text guidelines
- `.pdf` — Government PDF documents (via `pdf_extractor.py`)

**Key functions:**
| Function | Description |
|---|---|
| `ingest_knowledge_base_json()` | Load master scheme JSON, create chunks + embeddings |
| `ingest_scheme_documents()` | Ingest arbitrary documents from a directory |
| `extract_text_from_file()` | Extract text from any supported file format |
| `get_ingestion_stats()` | Return ingestion statistics |

**Usage:**
```python
from app.rag.ingestion import ingest_knowledge_base_json

# Full ingestion (clears existing chunks)
total_chunks = ingest_knowledge_base_json()

# Append without clearing
total_chunks = ingest_knowledge_base_json(clear_existing=False)
```

### 2. Chunking (`backend/app/rag/chunking.py`)

Splits documents into semantic chunks with metadata headers for retrieval.

**Strategy:**
- Paragraph-based splitting with sentence boundary awareness
- Configurable chunk size (default: 600 chars) and overlap (default: 60 chars)
- Metadata header injection: `[Scheme: {name} | ID: {id} | State: {state}]`
- Section-aware chunking: Overview, Benefits, Eligibility, Documents, Application Process

### 3. Embeddings (`backend/app/rag/embeddings.py`)

Generates vector embeddings for semantic search.

**Primary model:** `gemini-embedding-001` (via Gemini API)
**Fallback:** Deterministic n-gram hash-based embeddings (256 dimensions)

The fallback ensures the system works without an API key for development/testing.

### 4. PDF Extraction (`backend/app/rag/pdf_extractor.py`)

Extracts text from government PDF documents.

**Libraries used:**
- `pdfplumber` (primary) — Better for multi-column government documents
- `PyPDF2` (fallback) — Simpler PDF text extraction

**Features:**
- Multi-column layout handling
- Table extraction
- PDF metadata extraction (title, author, page count)
- Artifact cleaning (page numbers, headers/footers)

### 5. Retrieval (`backend/app/rag/retrieval.py`)

Hybrid semantic + keyword retrieval.

**Scoring formula:**
```
hybrid_score = (0.7 × cosine_similarity + 0.3 × keyword_overlap) × category_penalty
```

**Filtering:**
- State filter: restricts to specific state + "All India" schemes
- Category filter: soft penalty for non-matching categories (0.9x multiplier)

### 6. LLM Service (`backend/app/services/llm_service.py`)

Generates grounded explanations using Google Gemini.

**Model:** `gemini-2.5-flash`
**Temperature:** 0.2 (low for factual grounding)
**Max tokens:** 1024

**Critical constraints enforced:**
1. Responses grounded strictly in retrieved context
2. No eligibility determination — deferred to Rules Engine
3. Source citations with official portal URLs
4. Honest uncertainty when context is insufficient
5. Multilingual support (English, Hindi, Kannada)
6. Conversation history awareness for follow-up questions

### 7. RAG Service (`backend/app/services/rag_service.py`)

Orchestrates the full pipeline:
1. Semantic + lexical retrieval
2. Citation extraction
3. Context assembly with conversation history
4. Gemini LLM generation
5. Response formatting with sources and disclaimer

### 8. Language Support (`backend/app/rag/language.py`)

Provides multilingual support:

| Language | Code | Script | Status |
|---|---|---|---|
| English | `en` | Latin | ✅ Active |
| Hindi | `hi` | Devanagari | ✅ Active |
| Kannada | `kn` | Kannada | ✅ Active |

**Adding a new language:**
1. Add language config to `SUPPORTED_LANGUAGES` dict in `language.py`
2. Include: name, native_name, script, instruction, disclaimer, no_results, greeting
3. Update Unicode detection ranges in `detect_language()`
4. No other changes required — LLM handles the translation

## API Endpoints

### Query the Assistant
```http
POST /api/assistant/query
Content-Type: application/json

{
    "query": "What scholarships are available for OBC students?",
    "language": "en",
    "state": "Karnataka",
    "category": "OBC",
    "top_k": 4,
    "conversation_history": [
        {"role": "user", "content": "Tell me about scholarships"},
        {"role": "assistant", "content": "There are several..."}
    ]
}
```

**Response:**
```json
{
    "query": "...",
    "language": "en",
    "response": "Based on the official guidelines...",
    "sources": [
        {
            "scheme_id": "KA-SCHOLARSHIP-001",
            "scheme_name": "Karnataka Post-Matric Scholarship for OBC Students",
            "department": "Department of Backward Classes Welfare",
            "state": "Karnataka",
            "source_url": "https://ssp.postmatric.karnataka.gov.in/",
            "relevance_score": 0.87
        }
    ],
    "matched_schemes_count": 3,
    "disclaimer": "🔒 The LLM does NOT determine eligibility..."
}
```

### Ingestion Status
```http
GET /api/assistant/ingestion/status
```

### Trigger Re-ingestion
```http
POST /api/assistant/ingestion/trigger?clear_existing=true
```

### Supported Languages
```http
GET /api/assistant/languages
```

## Scheme Knowledge Base

The knowledge base at `data/schemes/schemes_knowledge_base.json` contains **32 verified** government schemes covering:

- **Central Government**: PMKVY, PMAY-G, NSP-CSSS, INSPIRE-SHE, NMMS, PMRF, DDU-GKY
- **AICTE**: Pragati, Saksham, Swanath, PG Scholarship
- **UGC**: Ishan Uday, Swami Vivekananda SGC Fellowship, NFOBC, MANF
- **Ministry of Social Justice**: Post-Matric SC/ST, Top Class Education, National Overseas
- **CBSE**: Single Girl Child Merit Scholarship
- **Karnataka State**: SSP Post-Matric, Vidyasiri, Arivu, Dr. Ambedkar Fellowship
- **Ministry of Education**: PM-USHA, SHREYAS, Samagra Shiksha, PM SHRI

Each scheme includes:
- Official description, benefits, eligibility criteria
- Required documents and application process
- Source URL and title for verification
- Category and education level targeting

## Configuration

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key | Yes (for LLM; falls back to templates without it) |
| `DATABASE_URL` | Database connection string | Yes |

### Database Options

**SQLite (development):**
```
DATABASE_URL=sqlite:///./schemesaathi.db
```
Embeddings stored as JSON-serialized arrays.

**PostgreSQL + pgvector (production):**
```
DATABASE_URL=postgresql://postgres:postgres@db:5432/schemesaathi
```
Docker Compose uses `pgvector/pgvector:pg16` image with the `vector` extension auto-enabled.

## Testing

Run the full test suite:
```bash
cd backend
pytest tests/test_rag.py -v
```

Test categories:
1. Text cleaning & chunking
2. Embedding generation & vector math
3. Knowledge base validation (30+ schemes)
4. Language / i18n support
5. Semantic & hybrid retrieval
6. LLM grounded prompts with conversation history
7. RAG service orchestration
8. FastAPI API endpoint integration
9. Ingestion management API
10. PDF extractor edge cases

## Security

- ✅ Gemini API key read from environment variables only
- ✅ No API keys hardcoded in source code
- ✅ `.env` file excluded from version control via `.gitignore`
- ✅ LLM does NOT determine eligibility — deterministic Rules Engine enforces criteria
