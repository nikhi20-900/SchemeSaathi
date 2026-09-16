/**
 * TypeScript Type Definitions for SchemeSaathi.
 * Managed by: Member 4 (Frontend + Integration)
 */

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
}

export interface Scheme {
  id: string;
  name: string;
  department: string;
  state: string;
  description: string;
  benefits: string;
  source_url: string;
  source_title: string;
  last_verified: string;
  required_documents: string[];
}

export interface CriterionResult {
  criterion: string;
  result: 'PASS' | 'FAIL' | 'NEEDS_VERIFICATION';
  user_value: any;
  required_value: any;
  explanation: string;
}

export interface DocumentVerification {
  document_id: string;
  document_type: string;
  status: 'VERIFIED' | 'MISMATCH' | 'NEEDS_REVIEW';
  summary: string;
}
