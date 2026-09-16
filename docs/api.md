# SchemeSaathi — Planned REST API Specification

This document details the planned API contracts to be implemented by Member 4 in collaboration with Members 1, 2, and 3.

---

## 1. Profile Module (`/api/profile`) — Member 4 & 2
- **`POST /api/profile`**
  - Create or update the citizen profile.
  - Body:
    ```json
    {
      "name": "Nikhil Kumar",
      "age": 20,
      "state": "Karnataka",
      "district": "Bengaluru Urban",
      "education": "Undergraduate",
      "course": "BCA",
      "annual_income": 240000.0,
      "category": "2A",
      "student_status": true
    }
    ```
- **`GET /api/profile`** or **`GET /api/profile/{id}`**
  - Returns the active citizen profile.

---

## 2. Schemes Module (`/api/schemes`) — Member 1 & 4
- **`GET /api/schemes`**
  - Query parameters: `state`, `category`, `level`.
  - Returns list of verified government schemes with published criteria.
- **`GET /api/schemes/{id}`**
  - Returns details, requirements, and benefits for a single scheme.
- **`GET /api/schemes/{id}/evidence`**
  - Returns gazetted clauses, official portal URLs, and verification dates.

---

## 3. Assistant Module (`/api/assistant`) — Member 1 & 4
- **`POST /api/assistant/query`**
  - Accepts natural language query (English, Hindi, Kannada) and user profile.
  - Orchestrates RAG retrieval, Rules Engine evaluation, and grounded multilingual explanation.
  - Response:
    ```json
    {
      "query": "What scholarships can I apply for as a BCA student in Karnataka?",
      "language": "en",
      "pipeline_steps": [
        {"id": "1", "name": "Understanding query intent", "status": "completed"},
        {"id": "2", "name": "Finding verified schemes", "status": "completed"},
        {"id": "3", "name": "Retrieving official evidence", "status": "completed"},
        {"id": "4", "name": "Checking deterministic rules", "status": "completed"},
        {"id": "5", "name": "Generating grounded explanation", "status": "completed"}
      ],
      "matched_schemes": [],
      "explanation": "...",
      "evidence_sources": []
    }
    ```

---

## 4. Eligibility Module (`/api/eligibility`) — Member 2
- **`POST /api/eligibility/check`**
  - Direct deterministic evaluation of profile attributes against scheme criteria.
  - Returns criterion-by-criterion `PASS`, `FAIL`, or `NEEDS_VERIFICATION`.

---

## 5. Documents Module (`/api/documents`) — Member 3
- **`POST /api/documents/upload`**
  - Accepts multipart file upload (PDF, JPG, PNG).
  - Triggers OCR, document classification, field extraction, and profile cross-checking.
- **`POST /api/documents/{id}/verify`**
  - Re-evaluates document fields against updated citizen profile.
- **`GET /api/documents/samples`**
  - Returns sample certificates for hackathon demonstration.

---

## 6. Demo Module (`/api/demo`) — Member 4
- **`POST /api/demo/toggle-income`**
  - Switches declared income between ₹2,40,000 and ₹4,00,000 for instant live eligibility transition demo.
- **`POST /api/demo/reset`**
  - Resets state to the default demo citizen (20yo BCA student in Karnataka).
