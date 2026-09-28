# SchemeSaathi 🇮🇳
## AI-Powered Government Scheme Navigator & Deterministic Eligibility Engine

SchemeSaathi is an AI-powered Government Scheme Navigator for Indian citizens, combining natural language comprehension, OCR-driven document intelligence, and a **deterministic rules engine** to evaluate welfare eligibility against published government criteria with zero AI hallucinations.

> **PROJECT STATUS: PHASE 2 (CORE MODULE IMPLEMENTATION)**  
> - ✅ **Member 2 (Eligibility Engine)**: Fully implemented, tested (48 tests), merged to `main` via [PR #6](https://github.com/nikhi20-900/SchemeSaathi/pull/6).
> - ✅ **Member 4 (Frontend & Integration)**: Complete 9-page civic-tech UI, interactive demo walkthrough, merged to `main` via [PR #7](https://github.com/nikhi20-900/SchemeSaathi/pull/7).
> - 🔄 **Member 1 (AI / RAG Pipeline)**: In Progress ([Issue #1](https://github.com/nikhi20-900/SchemeSaathi/issues/1)).
> - 🔄 **Member 3 (OCR / Document Intelligence)**: In Progress ([Issue #3](https://github.com/nikhi20-900/SchemeSaathi/issues/3)).

---

## 🔒 Core Architectural Principle

```text
┌────────────────────────────────────────────────────────────────────────┐
│  🔒 THE LLM DOES NOT INDEPENDENTLY DETERMINE CITIZEN ELIGIBILITY.       │
│                                                                        │
│  Eligibility criteria (income limits, age, state domicile, categories) │
│  are evaluated deterministically by the Rules Engine against published │
│  official government rules. The LLM only handles natural language      │
│  understanding, semantic search, and grounded multilingual explanation.│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 4-Member Team Ownership & Status

```text
                    MEMBER 1 🔄
                 AI + RAG + DATA
                        │
               ┌────────┴────────┐
               ▼                 ▼
          MEMBER 2 ✅        MEMBER 3 🔄
        ELIGIBILITY              OCR
          ENGINE              DOCUMENTS
               │                 │
               └────────┬────────┘
                        ▼
                    MEMBER 4 ✅
             FRONTEND + INTEGRATION
```

| Member | Focus Area | Branch | Status | Key Deliverables |
|---|---|---|---|---|
| **Member 1** | AI + RAG + Data | `feature/ai-rag` | 🔄 In Progress | Vector embeddings, hybrid retrieval, grounding in official gazettes ([Issue #1](https://github.com/nikhi20-900/SchemeSaathi/issues/1)) |
| **Member 2** | Eligibility Engine | `feature/eligibility-engine` | ✅ **Completed & Merged** | Deterministic rules engine, Pydantic schemas, 8 operators, 48 tests ([PR #6](https://github.com/nikhi20-900/SchemeSaathi/pull/6)) |
| **Member 3** | OCR + Documents | `feature/ocr-documents` | 🔄 In Progress | Document parsing, certificate field extraction, fraud detection ([Issue #3](https://github.com/nikhi20-900/SchemeSaathi/issues/3)) |
| **Member 4** | Frontend + Integration | `feature/frontend` | ✅ **Completed & Merged** | 9 core pages, interactive demo workflow, client-side fallback engine ([PR #7](https://github.com/nikhi20-900/SchemeSaathi/pull/7)) |

---

## ✨ Features Implemented Till Now

### 1. Deterministic Eligibility Engine (Member 2)
- **Engine Core** (`backend/app/eligibility/engine.py`):
  - Strictly evaluates profile fields against rules without AI ambiguity.
  - Multi-tier verdicts:
    - `PASS`: Profile value satisfies the threshold.
    - `FAIL`: Profile value violates the threshold.
    - `NEEDS_VERIFICATION`: Required profile attribute or document certificate is unverified or missing.
  - Overall scheme evaluation: `ELIGIBLE`, `PARTIALLY_ELIGIBLE`, `INELIGIBLE`.
- **Operator Library** (`backend/app/eligibility/operators.py`):
  - Numeric comparisons: `>=`, `<=`, `>`, `<`
  - Equality checks: `equals`, `==`, `not_equals`, `!=`
  - Set memberships: `in`, `not_in`, `contains`
- **FastAPI Endpoints** (`backend/app/api/eligibility.py`):
  - `POST /api/eligibility/check`: Evaluate profile against a single scheme or all registered schemes.
  - `GET /api/eligibility/schemes`: Return catalog of schemes with structured rules.
  - `GET /api/eligibility/schemes/{scheme_id}`: Retrieve rules for a specific scheme.
- **Reference Scheme Registry** (`backend/app/eligibility/scheme_rules.py`):
  - Karnataka Post-Matric Scholarship for OBC Students (`KA-SCHOLARSHIP-001`)
  - Pradhan Mantri Kaushal Vikas Yojana (`IN-PMKVY-001`)
  - Pradhan Mantri Awas Yojana – Gramin (`IN-PMAY-001`)
  - Karnataka Raitha Siri Scheme (`KA-FARM-001`)
- **Comprehensive Test Suite** (`backend/tests/test_eligibility.py`):
  - 48 test cases verifying all operators, edge cases, partial matches, and schema validations.

### 2. Frontend Application & Civic Design System (Member 4)
- **Aesthetic**: Clean, accessible civic-tech design system built with Tailwind CSS, Framer Motion, and Lucide React.
  - Curated palette: Charcoal (`#151B18`), Linen (`#FAF9F6`), Terracotta (`#C85A32`), Sage (`#3F6152`), and Saffron (`#D97706`).
- **9 Core Application Views**:
  1. **Landing / Home** (`pages/Home.tsx`): Value proposition, 4-step workflow, and instant demo entrypoint.
  2. **Citizen Profile** (`pages/Profile.tsx`): Form capturing age, state (28 states dropdown), district, education, category, student enrollment, and annual income.
  3. **Schemes Directory** (`pages/Schemes.tsx`): Filterable directory with live search and state-level filters.
  4. **Scheme Details** (`pages/SchemeDetails.tsx`): Benefits summary, structured eligibility criteria table, required documents checklist, and official portal links.
  5. **AI Scheme Navigator** (`pages/Assistant.tsx`): Natural language chat interface with suggested inquiries, grounded gazette citations, and action triggers.
  6. **Eligibility Results Dashboard** (`pages/Results.tsx`): Summary cards, filter tabs, and expandable criteria tables with distinct `PASS`, `FAIL`, and `NEEDS_VERIFICATION` badges.
  7. **Document Intelligence & OCR** (`pages/Documents.tsx`): File upload dropzone, 4 pre-loaded 1-click test certificates, multi-stage OCR animation, extracted key-value comparison table with confidence scores, and profile update mechanism.
  8. **Official Evidence Registry** (`pages/Evidence.tsx`): Auditable gazette notification orders (G.O.), verbatim excerpts, and SHA-256 cryptographic hashes.
  9. **Root Navigation & Demo Stepper** (`App.tsx`): Persistent top bar guiding evaluators through the 6-stage verification flow with a 1-click reset button.
- **Client-Side Engine Fallback** (`frontend/src/utils/engine.ts`):
  - Pure TypeScript implementation of the rules engine ensuring 100% demo reliability even if the backend is offline.

---

## 🔄 End-to-End Demo Workflow

```text
Landing (Home)
  ↓
Citizen Profile Setup (Nikhil Kumar, Age 20, Karnataka, Category 2A, ₹2,40,000/yr)
  ↓
AI Scheme Navigator (Ask questions & receive grounded citations)
  ↓
Browse Schemes (Karnataka Post-Matric OBC Scholarship)
  ↓
Eligibility Results (Initial evaluation: Partially Eligible — Domicile Certificate missing)
  ↓
Document Intelligence (Select Karnataka Domicile Certificate demo sample)
  ↓
OCR Verification (Extracts name, state, and >7 yrs residence with 98% confidence)
  ↓
Apply to Profile & Re-evaluate
  ↓
Eligibility Results (100% Eligible — PASS with all 8 criteria satisfied)
  ↓
Official Gazette Evidence View (Auditable legal proof & notification orders)
```

---

## 📁 Repository Structure

```text
schemesaathi/
│
├── README.md                           # Project documentation & team progress
├── .gitignore                          # Git ignore rules
├── .env.example                        # Environment variables template
├── docker-compose.yml                  # Multi-container orchestration (FastAPI + Vite + Postgres)
├── .vscode/
│   └── settings.json                   # IDE CSS linter rules for Tailwind directives
│
├── frontend/                           # React + TypeScript + Vite + Tailwind CSS
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── README.md                       # Frontend architecture & design guide
│   │
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                     # Main layout & Hackathon demo walkthrough stepper
│       ├── index.css                   # Civic design system tokens & utilities
│       │
│       ├── components/
│       │   ├── Navbar.tsx              # Top sticky navigation bar
│       │   ├── SchemeCard.tsx          # Card displaying scheme overview & criteria count
│       │   ├── EligibilityBadge.tsx    # PASS / FAIL / NEEDS_VERIFICATION badges
│       │   ├── DocumentCard.tsx        # Document preview & upload cards
│       │   ├── EvidenceCard.tsx        # Gazette evidence citation card
│       │   └── LoadingState.tsx        # Animated loading spinners & pipeline steppers
│       │
│       ├── pages/
│       │   ├── Home.tsx                # 1. Landing page
│       │   ├── Profile.tsx             # 2. Citizen profile form
│       │   ├── Schemes.tsx             # 3. Searchable schemes directory
│       │   ├── SchemeDetails.tsx       # 4. Detailed scheme breakdown
│       │   ├── Assistant.tsx           # 5. Grounded AI scheme navigator
│       │   ├── Results.tsx             # 6. Deterministic eligibility results dashboard
│       │   ├── Documents.tsx           # 7 & 8. Document upload & OCR verification
│       │   └── Evidence.tsx            # 9. Gazette orders & audit registry
│       │
│       ├── services/
│       │   └── api.ts                  # Typed API client with mock fallback data
│       ├── types/
│       │   └── index.ts                # TypeScript domain models & interfaces
│       └── utils/
│           └── engine.ts               # Client-side deterministic evaluation engine
│
├── backend/                            # FastAPI + Python 3.11 + Pydantic v2
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .dockerignore
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI application entrypoint & CORS
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── eligibility.py          # Eligibility check & scheme endpoints (Active)
│   │   │   ├── profile.py              # Profile endpoints
│   │   │   ├── schemes.py              # Schemes endpoints
│   │   │   ├── assistant.py            # AI assistant endpoints
│   │   │   ├── documents.py            # Document upload & verify endpoints
│   │   │   └── demo.py                 # Demo endpoints
│   │   │
│   │   ├── eligibility/                # Deterministic rules engine (Member 2 - Complete)
│   │   │   ├── __init__.py
│   │   │   ├── engine.py               # Core evaluation algorithm
│   │   │   ├── operators.py            # Comparison operators (>=, <=, in, equals)
│   │   │   ├── validators.py           # Input schema validation
│   │   │   └── scheme_rules.py         # Sample government scheme definitions
│   │   │
│   │   ├── schemas/
│   │   │   ├── eligibility.py          # Pydantic v2 validation models
│   │   │   └── ...
│   │   │
│   │   ├── services/
│   │   │   ├── eligibility_service.py  # Orchestrates profile evaluation against rules
│   │   │   └── ...
│   │   │
│   │   └── core/
│   │       └── config.py               # Pydantic BaseSettings
│   │
│   └── tests/
│       ├── test_eligibility.py         # 48 eligibility engine unit tests (All passing)
│       ├── test_rag.py                 # RAG pipeline tests
│       └── test_documents.py           # Document tests
│
├── data/
│   ├── schemes/                        # Raw gazette documents & policy PDFs
│   └── sample/                         # Sample citizen certificates
│
└── docs/
    ├── architecture.md                 # System architecture specification
    ├── api.md                          # API contract documentation
    └── demo.md                         # Hackathon demonstration script
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (3.11+)
- **Docker & Docker Compose** (optional)

### 1. Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

To run the TypeScript build check:
```bash
npm run build
```

### 2. Running the Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Open API Docs at [http://localhost:8000/docs](http://localhost:8000/docs).

### 3. Running Backend Tests
```bash
cd backend
pytest
```
*(All 53 unit and integration tests execute in <0.3s)*

### 4. Running with Docker Compose
```bash
docker-compose up --build
```

---

## 🚦 Roadmap & Progress Checklist

- [x] **Phase 1: Project Scaffolding**
  - [x] Repository structure, branch strategy, and CI standards established
  - [x] Initial FastAPI routing and React UI scaffolding configured
  - [x] PR #5 merged to `main`

- [ ] **Phase 2: Core Engineering Modules**
  - [x] **Member 2: Deterministic Eligibility Engine** (Merged in PR #6)
    - [x] Rule evaluation engine (`engine.py`)
    - [x] Operator library (`operators.py`)
    - [x] Pydantic validation schemas (`schemas/eligibility.py`)
    - [x] API endpoints (`/api/eligibility/check`, `/api/eligibility/schemes`)
    - [x] 48 unit tests passing
  - [x] **Member 4: Frontend UI & Guided Demo Flow** (Merged in PR #7)
    - [x] 9 core pages and civic-tech design system
    - [x] Interactive 6-step demo walkthrough stepper
    - [x] Document OCR upload & verification preview
    - [x] Grounded AI Scheme Navigator with gazette citations
    - [x] Client-side deterministic evaluation fallback
    - [x] Clean TypeScript build (`npm run build`)
  - [ ] **Member 1: AI / RAG Pipeline** (Issue #1)
    - [ ] Gazette text extraction and chunking
    - [ ] Vector database indexing and hybrid retrieval
    - [ ] Grounded multilingual synthesis
  - [ ] **Member 3: Document Intelligence & OCR Pipeline** (Issue #3)
    - [ ] Tesseract / PaddleOCR image preprocessing
    - [ ] Certificate field extraction & entity parsing
    - [ ] Mismatch detection & fraud prevention logic

- [ ] **Phase 3: Final Integration & Hackathon Polish**
  - [ ] Connect live RAG pipeline to Frontend AI Navigator
  - [ ] Connect live OCR service to Document Upload view
  - [ ] End-to-end multi-container demo deployment
