# SchemeSaathi Frontend

A civic-tech React application built with TypeScript, Vite, Tailwind CSS, and Framer Motion for navigating Indian government schemes with deterministic rules and OCR document verification.

## 🏛️ Design System & Principles

- **Aesthetic:** Editorial civic-tech, accessible, clean typography (Plus Jakarta Sans, Inter).
- **Color Palette:**
  - Charcoal (`#151B18`, `#1F2723`): Text, deep primary accents
  - Linen / Off-white (`#FAF9F6`, `#F4F1EC`): Backgrounds and paper cards
  - Terracotta (`#C85A32`, `#B04C27`): Interactive highlights and primary CTAs
  - Sage (`#3F6152`, `#F1F5F3`): Success, verified status, government trust badges
  - Saffron (`#D97706`, `#FFFBEB`): Attention, pending verification, gazette citations

## 📱 Pages & Views

1. **Home / Landing (`Home.tsx`):**
   - Hero introducing deterministic eligibility (no AI guesswork)
   - How it works 4-step diagram
   - 1-click demo entrypoint

2. **Citizen Profile (`Profile.tsx`):**
   - Personal information (Name, Age, Category, Student enrollment)
   - Location (28 States & UTs dropdown, District)
   - Education level & course
   - Annual family income (₹)

3. **Schemes Directory (`Schemes.tsx`):**
   - Live backend API integration with mock fallback
   - Search across schemes, departments, and descriptions
   - State-level filtering (Karnataka & All India)
   - Staggered animated cards with rule counts and benefits

4. **Scheme Details (`SchemeDetails.tsx`):**
   - Department, state, and benefits breakdown
   - Structured eligibility rules table
   - Required documents checklist
   - Official portal link

5. **AI Scheme Navigator (`Assistant.tsx`):**
   - Natural language query interface
   - Suggested inquiry pills
   - Grounded responses citing official gazette orders
   - Action triggers to evaluate eligibility and browse schemes
   - Architectural transparency disclaimer

6. **Eligibility Results Dashboard (`Results.tsx`):**
   - Active profile summary banner with quick edit/re-evaluate
   - Summary statistics (Total, Eligible, Needs Verification, Ineligible)
   - Filter tabs
   - Per-criterion breakdown accordion:
     - Criterion name
     - `PASS` / `FAIL` / `NEEDS_VERIFICATION` visual badges
     - Profile value vs Required value
     - Plain-English explanation
   - Action button to upload & verify documents

7. **Document Intelligence & OCR (`Documents.tsx`):**
   - Drag & drop / file picker (PDF, JPG, PNG)
   - 1-Click test samples:
     - Karnataka Domicile Certificate (Form 3) -> resolves domicile requirement to PASS
     - Annual Income Certificate -> verifies income ceiling
     - Caste & Category Certificate (Category 2A) -> verifies OBC status
     - Discrepancy sample -> demonstrates fraud detection
   - Multi-stage OCR loading animation
   - Extracted fields table with confidence scores & profile comparison
   - "Apply to Profile & Re-evaluate" action to complete demo flow

8. **Official Evidence Registry (`Evidence.tsx`):**
   - Gazette notification numbers (G.O.), publication dates
   - Verbatim extracts from official orders
   - Enforced deterministic rules mappings
   - Cryptographic tamper-evident SHA-256 hashes

## 🔄 End-to-End Demo Flow

```text
Landing (Home)
  ↓
Profile Setup
  ↓
Ask AI Navigator
  ↓
Browse Schemes
  ↓
Eligibility Results (Partially Eligible — Domicile Missing)
  ↓
Upload / Select Domicile Certificate
  ↓
OCR Verification (Confidence > 95%, Match Confirmed)
  ↓
Apply to Profile
  ↓
Eligibility Results (100% Eligible — PASS)
  ↓
View Auditable Gazette Evidence
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Run production TypeScript & Vite build
npm run build
```
