# SchemeSaathi 🇮🇳
## AI-Powered Government Scheme Navigator (Phase 1: Scaffolding)

SchemeSaathi is an AI-powered Government Scheme Navigator for Indian citizens, initially focusing on scholarships and education schemes across Karnataka and the Central Government.

> **CURRENT STATUS: PHASE 1 — REPOSITORY SCAFFOLDING ONLY**  
> All modules, directories, and placeholder interfaces are established so that all 4 team members can work independently on their feature branches.

---

## 👥 4-Member Team Structure & Ownership

```text
                    MEMBER 1
                 AI + RAG + DATA
                       │
              ┌────────┴────────┐
              ▼                 ▼
          MEMBER 2          MEMBER 3
        ELIGIBILITY             OCR
          ENGINE             DOCUMENTS
              │                 │
              └────────┬────────┘
                       ▼
                    MEMBER 4
             FRONTEND + INTEGRATION
```

### Module Ownership Matrix

| Member | Focus Area | Branch | Owned Directories & Files |
|---|---|---|---|
| **Member 1** | AI + RAG + Data | `feature/ai-rag` | `backend/app/rag/`<br>`backend/app/services/llm_service.py`<br>`backend/app/services/rag_service.py`<br>`data/schemes/` |
| **Member 2** | Eligibility Engine | `feature/eligibility-engine` | `backend/app/eligibility/`<br>`backend/app/services/eligibility_service.py`<br>`backend/app/api/eligibility.py` |
| **Member 3** | OCR + Documents | `feature/ocr-documents` | `backend/app/ocr/`<br>`backend/app/services/ocr_service.py`<br>`backend/app/services/document_service.py`<br>`backend/app/api/documents.py`<br>`data/sample/` |
| **Member 4** | Frontend + Integration | `feature/frontend` | `frontend/`<br>`backend/app/api/`<br>`frontend/src/services/api.ts` |

---

## 🔒 Core Architectural Principle

```text
┌────────────────────────────────────────────────────────────────────────┐
│  🔒 THE LLM DOES NOT INDEPENDENTLY DETERMINE CITIZEN ELIGIBILITY.       │
│                                                                        │
│  Eligibility criteria (income limits, age, state domicile, categories) │
│  are evaluated deterministically by the Rules Engine against published │
│  official government rules. The LLM only handles natural language      │
│  understanding, multilingual communication, and evidence explanation.  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```text
schemesaathi/
│
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   │
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       │
│       ├── components/
│       │   ├── ui/
│       │   ├── Navbar.tsx
│       │   ├── SchemeCard.tsx
│       │   ├── EligibilityBadge.tsx
│       │   ├── DocumentCard.tsx
│       │   ├── EvidenceCard.tsx
│       │   └── LoadingState.tsx
│       │
│       ├── pages/
│       │   ├── Home.tsx
│       │   ├── Profile.tsx
│       │   ├── Schemes.tsx
│       │   ├── SchemeDetails.tsx
│       │   ├── Assistant.tsx
│       │   ├── Documents.tsx
│       │   └── Results.tsx
│       │
│       ├── hooks/
│       ├── services/
│       │   └── api.ts
│       ├── types/
│       └── utils/
│
├── backend/
│   ├── requirements.txt
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── profile.py
│   │   │   ├── schemes.py
│   │   │   ├── assistant.py
│   │   │   ├── eligibility.py
│   │   │   ├── documents.py
│   │   │   └── demo.py
│   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── scheme.py
│   │   │   ├── eligibility.py
│   │   │   ├── document.py
│   │   │   └── evidence.py
│   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── scheme.py
│   │   │   ├── eligibility.py
│   │   │   └── document.py
│   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── llm_service.py
│   │   │   ├── rag_service.py
│   │   │   ├── eligibility_service.py
│   │   │   ├── ocr_service.py
│   │   │   └── document_service.py
│   │
│   │   ├── rag/
│   │   │   ├── __init__.py
│   │   │   ├── ingestion.py
│   │   │   ├── chunking.py
│   │   │   ├── embeddings.py
│   │   │   └── retrieval.py
│   │
│   │   ├── eligibility/
│   │   │   ├── __init__.py
│   │   │   ├── engine.py
│   │   │   ├── operators.py
│   │   │   └── validators.py
│   │
│   │   ├── ocr/
│   │   │   ├── __init__.py
│   │   │   ├── extractor.py
│   │   │   ├── classifier.py
│   │   │   └── parser.py
│   │
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   ├── connection.py
│   │   │   └── seed.py
│   │
│   │   └── core/
│   │       ├── __init__.py
│   │       ├── config.py
│   │       └── security.py
│   │
│   └── tests/
│       ├── __init__.py
│       ├── test_eligibility.py
│       ├── test_rag.py
│       └── test_documents.py
│
├── data/
│   ├── schemes/
│   └── sample/
│
└── docs/
    ├── architecture.md
    ├── api.md
    └── demo.md
```

---

## 🌿 Git Branches

```text
main
│
├── feature/ai-rag             (Member 1)
├── feature/eligibility-engine (Member 2)
├── feature/ocr-documents      (Member 3)
└── feature/frontend           (Member 4)
```

Rules:
- Never commit directly to `main`.
- Each member works exclusively in their feature branch.
- Merge via pull requests after review.

---

## 🚦 Phase Checklist

- [x] Repository structure created
- [x] Frontend structure and placeholder pages/components created
- [x] Backend structure and placeholder modules created
- [x] API routes created with placeholder contracts
- [x] RAG module scaffolding created
- [x] Eligibility module scaffolding created
- [x] OCR module scaffolding created
- [x] Database module scaffolding created
- [x] Test directories created
- [x] Data directories created
- [x] Documentation created (`docs/architecture.md`, `docs/api.md`, `docs/demo.md`)
- [x] `.env.example` created
- [x] `.gitignore` created
- [x] `docker-compose.yml` created
