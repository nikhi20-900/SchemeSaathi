/**
 * TypeScript Type Definitions for SchemeSaathi.
 * Managed by: Member 4 (Frontend + Integration)
 */

// ─── User Profile ───────────────────────────────────────

export interface UserProfile {
  id?: string;
  name: string;
  age: number;
  state: string;
  district?: string;
  education: string;
  course: string;
  annual_income: number;
  student_status: boolean;
  category: string;
  [key: string]: any; // Allow extra fields for eligibility
}

// ─── Schemes ────────────────────────────────────────────

export interface EligibilityRule {
  field: string;
  operator: string;
  value: any;
  description?: string;
}

export interface Scheme {
  id: string;
  name: string;
  department: string;
  state: string;
  description: string;
  benefits: string;
  source_url?: string;
  source_title?: string;
  last_verified?: string;
  required_documents?: string[];
  eligibility_rules?: EligibilityRule[];
}

// ─── Eligibility ────────────────────────────────────────

export type CriterionVerdict = 'PASS' | 'FAIL' | 'NEEDS_VERIFICATION';
export type OverallStatus = 'ELIGIBLE' | 'INELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'ERROR';

export interface CriterionResult {
  criterion: string;
  result: CriterionVerdict;
  user_value: any;
  required_value: any;
  explanation: string;
}

export interface SchemeEligibilityResult {
  scheme_id: string;
  scheme_name: string;
  overall_status: OverallStatus;
  criteria_results: CriterionResult[];
  message?: string;
}

export interface EligibilityCheckResponse {
  results: SchemeEligibilityResult[];
  total_schemes_evaluated: number;
  summary: string;
}

// ─── Documents ──────────────────────────────────────────

export interface DocumentVerification {
  document_id: string;
  document_type: string;
  status: 'VERIFIED' | 'MISMATCH' | 'NEEDS_REVIEW';
  summary: string;
  extracted_fields?: Record<string, string>;
  confidence?: number;
}

// ─── Assistant ──────────────────────────────────────────

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: EvidenceSource[];
}

export interface EvidenceSource {
  title: string;
  url: string;
  quote?: string;
  scheme_id?: string;
}

// ─── UI State ───────────────────────────────────────────

export type PageId =
  | 'home'
  | 'profile'
  | 'schemes'
  | 'scheme-details'
  | 'assistant'
  | 'results'
  | 'documents'
  | 'document-verify'
  | 'evidence';

export interface NavigationState {
  currentPage: PageId;
  selectedSchemeId?: string;
  selectedDocumentId?: string;
}
