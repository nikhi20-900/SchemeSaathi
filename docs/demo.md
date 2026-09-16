# SchemeSaathi — Demonstration Flow & Walkthrough

This document outlines the planned end-to-end demonstration flow for hackathon judges once all 4 members complete their respective modules.

---

## The Killer Demo Workflow

```text
USER
 ↓
PROFILE (Nikhil Kumar, 20, Karnataka, BCA, ₹2,40,000, Category 2A)
 ↓
NATURAL LANGUAGE QUESTION ("What scholarships can I apply for as a BCA student in Karnataka?")
 ↓
RAG RETRIEVAL (Karnataka SSP, Vidyasiri, Fee Concession, Free Laptop, CSSS)
 ↓
RULES ENGINE (Deterministic criteria evaluation - 🔒 NO LLM DECISION)
 ↓
CRITERION-BY-CRITERION RESULT (Income ≤ ₹2.5L PASS, Domicile PASS, Category PASS -> ELIGIBLE)
 ↓
DOCUMENT REQUIREMENTS CHECKLIST
 ↓
OCR FIELD EXTRACTION (Karnataka Nadakacheri Income Certificate)
 ↓
PROFILE CROSS-CHECK -> DOCUMENT VERIFIED
 ↓
DEMO TOGGLE: CHANGE INCOME TO ₹4,00,000
 ↓
IMMEDIATE RE-EVALUATION -> INELIGIBLE (Income limit exceeded)
 ↓
MULTILINGUAL SWITCH (English -> हिंदी -> ಕನ್ನಡ)
```

---

## Key Presentation Highlights

1. **🔒 Decoupled Intelligence**:
   Explain to judges: *"The LLM does not determine eligibility. A deterministic rules engine evaluates official government criteria, preventing AI hallucinations for welfare schemes."*
2. **Deterministic Responsiveness**:
   Toggling income from ₹2,40,000 to ₹4,00,000 immediately causes Karnataka SSP (≤ ₹2.5L limit) to transition to INELIGIBLE with an exact mathematical explanation.
3. **Multilingual Consistency**:
   Switching between English, Hindi, and Kannada preserves the exact same rule results and official government portal citations.
