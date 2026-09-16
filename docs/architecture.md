# SchemeSaathi — Architecture Documentation

## 1. System Overview

SchemeSaathi is an AI-powered Government Scheme Navigator for Indian citizens, focusing on scholarships and education schemes across Karnataka and Central Government.

```text
                  SCHEMESAATHI
                       │
                       ▼
              ┌─────────────────┐
              │  React Frontend │ (MEMBER 4)
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   FastAPI API   │ (MEMBER 4)
              └────────┬────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     ┌─────────┐  ┌──────────┐  ┌─────────┐
     │   RAG   │  │  Rules   │  │   OCR   │
     │ Engine  │  │  Engine  │  │ Engine  │
     └────┬────┘  └────┬─────┘  └────┬────┘
     (MEMBER 1)   (MEMBER 2)    (MEMBER 3)
          │            │             │
          ▼            ▼             ▼
     Government    Eligibility    Documents
      Evidence       Rules        / Profile
          │            │             │
          └────────────┼─────────────┘
                       ▼
                 ┌───────────┐
                 │    LLM    │
                 │Explanation│ (MEMBER 1)
                 └─────┬─────┘
                       ▼
              Grounded Response
              + Evidence + Actions
```

---

## 2. Core Architectural Principle

> 🔒 **The LLM does NOT independently determine citizen eligibility.**
> 
> Eligibility criteria (income ceilings, age limits, state domicile, caste categories) are evaluated deterministically by the Rules Engine against published official government criteria. The LLM handles natural language query intent, evidence summarization, and multilingual translation.

---

## 3. Team Ownership Breakdown

| Team Member | Domain | Module Paths | Future Responsibility |
|---|---|---|---|
| **Member 1** | AI + RAG + Data | `backend/app/rag/`<br>`backend/app/services/llm_service.py`<br>`backend/app/services/rag_service.py`<br>`data/schemes/` | Scheme dataset ingestion, chunking, embeddings, vector retrieval, and Gemini-based multilingual explanation. |
| **Member 2** | Eligibility Engine | `backend/app/eligibility/`<br>`backend/app/services/eligibility_service.py`<br>`backend/app/api/eligibility.py` | Deterministic rules engine supporting operators (`<=`, `>=`, `==`, `in`), generating criterion-by-criterion verdicts (`PASS`, `FAIL`, `NEEDS_VERIFICATION`). |
| **Member 3** | OCR + Documents | `backend/app/ocr/`<br>`backend/app/services/ocr_service.py`<br>`backend/app/services/document_service.py`<br>`backend/app/api/documents.py`<br>`data/sample/` | Document upload, OCR extraction (Income Certificate, Caste Certificate, Marks Card), field parsing, and profile cross-checking. |
| **Member 4** | Frontend + Integration | `frontend/`<br>`backend/app/api/`<br>`frontend/src/services/api.ts` | Civic-tech React/Vite UI, pipeline visualization, API endpoints integration, and end-to-end demo flow. |

---

## 4. Layer Communication

1. **User Query**: Citizen asks a natural language question in English, Hindi, or Kannada via the React frontend.
2. **Intent & Retrieval (Member 1)**: RAG service extracts query parameters and retrieves matching government schemes and official clauses.
3. **Deterministic Evaluation (Member 2)**: Rules engine checks the citizen's profile against published scheme criteria and returns structured PASS / FAIL results.
4. **Document Verification (Member 3)**: OCR extracts fields from uploaded/sample certificates and cross-checks them against the declared profile.
5. **Grounded Synthesis (Member 1 & 4)**: Multilingual LLM service explains the deterministic findings with citations to official government portals.
