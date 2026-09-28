/**
 * Frontend API Service Client.
 * Owned by: Member 4 (Frontend + Integration)
 *
 * Interfaces with FastAPI backend endpoints.
 * Uses mock data as fallback when backend is unavailable.
 */

import type {
  UserProfile,
  Scheme,
  EligibilityCheckResponse,
  SchemeEligibilityResult,
} from '../types';

const API_BASE = '/api';

// ─── Generic fetch wrapper ──────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

// ─── Health ─────────────────────────────────────────────

export async function fetchHealth() {
  return apiFetch<{ status: string; service: string }>('/health');
}

// ─── Profile ────────────────────────────────────────────

export async function fetchProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>(`${API_BASE}/profile`);
}

export async function saveProfile(profile: UserProfile): Promise<UserProfile> {
  return apiFetch<UserProfile>(`${API_BASE}/profile`, {
    method: 'POST',
    body: JSON.stringify(profile),
  });
}

// ─── Schemes ────────────────────────────────────────────

export async function fetchSchemes(): Promise<{ schemes: Scheme[]; total: number }> {
  return apiFetch<{ schemes: Scheme[]; total: number }>(`${API_BASE}/eligibility/schemes`);
}

export async function fetchSchemeById(schemeId: string): Promise<Scheme> {
  return apiFetch<Scheme>(`${API_BASE}/eligibility/schemes/${schemeId}`);
}

// ─── Eligibility ────────────────────────────────────────

export async function checkEligibility(
  userProfile: Record<string, any>,
  schemeId?: string,
): Promise<EligibilityCheckResponse> {
  return apiFetch<EligibilityCheckResponse>(`${API_BASE}/eligibility/check`, {
    method: 'POST',
    body: JSON.stringify({
      user_profile: userProfile,
      scheme_id: schemeId || null,
    }),
  });
}

// ─── Assistant ──────────────────────────────────────────

export async function queryAssistant(query: string) {
  return apiFetch<{ response: string; sources?: any[] }>(`${API_BASE}/assistant/query`, {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

// ─── Documents ──────────────────────────────────────────

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}

// ─── Mock Data (fallback when backend is unavailable) ───

export const MOCK_PROFILE: UserProfile = {
  name: 'Nikhil Kumar',
  age: 20,
  state: 'Karnataka',
  district: 'Bengaluru Urban',
  education: 'Undergraduate',
  course: 'BCA',
  annual_income: 240000,
  student_status: true,
  category: '2A',
};

export const MOCK_SCHEMES: Scheme[] = [
  {
    id: 'KA-SCHOLARSHIP-001',
    name: 'Karnataka Post-Matric Scholarship for OBC Students',
    department: 'Department of Backward Classes and Minorities',
    state: 'Karnataka',
    description: 'Scholarship for OBC students pursuing post-matric education in Karnataka with family income below ₹2,50,000 per annum.',
    benefits: 'Full tuition fees + maintenance allowance',
    eligibility_rules: [
      { field: 'age', operator: '>=', value: 17, description: 'Minimum Age' },
      { field: 'age', operator: '<=', value: 35, description: 'Maximum Age' },
      { field: 'state', operator: 'in', value: ['Karnataka'], description: 'State' },
      { field: 'education', operator: 'in', value: ['Undergraduate', 'Postgraduate', 'Diploma', 'Professional'], description: 'Education Level' },
      { field: 'annual_income', operator: '<=', value: 250000, description: 'Annual Family Income' },
      { field: 'category', operator: 'in', value: ['OBC', '2A', '2B', '3A', '3B'], description: 'Category' },
      { field: 'student_status', operator: 'equals', value: true, description: 'Currently Enrolled Student' },
      { field: 'domicile_certificate', operator: 'equals', value: true, description: 'Domicile Certificate' },
    ],
  },
  {
    id: 'IN-PMKVY-001',
    name: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
    department: 'Ministry of Skill Development and Entrepreneurship',
    state: 'All India',
    description: 'Skill certification and training scheme for Indian youth aged 15–45 to improve employability.',
    benefits: 'Free skill training + certification + monetary reward',
    eligibility_rules: [
      { field: 'age', operator: '>=', value: 15, description: 'Minimum Age' },
      { field: 'age', operator: '<=', value: 45, description: 'Maximum Age' },
      { field: 'nationality', operator: 'equals', value: 'Indian', description: 'Nationality' },
      { field: 'aadhaar_linked', operator: 'equals', value: true, description: 'Aadhaar Linked' },
    ],
  },
  {
    id: 'IN-PMAY-001',
    name: 'Pradhan Mantri Awas Yojana – Gramin (PMAY-G)',
    department: 'Ministry of Rural Development',
    state: 'All India',
    description: 'Housing subsidy for economically weaker sections in rural areas with household income up to ₹3,00,000.',
    benefits: '₹1,20,000 (plain areas) / ₹1,30,000 (hilly areas) subsidy',
    eligibility_rules: [
      { field: 'annual_income', operator: '<=', value: 300000, description: 'Annual Household Income' },
      { field: 'area_type', operator: 'equals', value: 'Rural', description: 'Area Type' },
      { field: 'owns_pucca_house', operator: 'equals', value: false, description: 'Does Not Own Pucca House' },
      { field: 'category', operator: 'in', value: ['SC', 'ST', 'OBC', 'EWS', '2A', '2B', '3A', '3B'], description: 'Category' },
    ],
  },
  {
    id: 'KA-FARM-001',
    name: 'Karnataka Raitha Siri Scheme',
    department: 'Department of Agriculture, Karnataka',
    state: 'Karnataka',
    description: 'Crop loan interest subvention for small and marginal farmers in Karnataka holding up to 5 acres of land.',
    benefits: '0% interest on crop loans up to ₹3,00,000',
    eligibility_rules: [
      { field: 'state', operator: 'equals', value: 'Karnataka', description: 'State' },
      { field: 'occupation', operator: 'equals', value: 'Farmer', description: 'Occupation' },
      { field: 'land_holding_acres', operator: '<=', value: 5, description: 'Land Holding (acres)' },
      { field: 'has_bank_account', operator: 'equals', value: true, description: 'Has Bank Account' },
    ],
  },
];

export const MOCK_ELIGIBILITY_RESULTS: SchemeEligibilityResult[] = [
  {
    scheme_id: 'KA-SCHOLARSHIP-001',
    scheme_name: 'Karnataka Post-Matric Scholarship for OBC Students',
    overall_status: 'PARTIALLY_ELIGIBLE',
    criteria_results: [
      { criterion: 'Minimum Age', result: 'PASS', user_value: 20, required_value: 17, explanation: 'Minimum Age: 20 satisfies >= 17.' },
      { criterion: 'Maximum Age', result: 'PASS', user_value: 20, required_value: 35, explanation: 'Maximum Age: 20 satisfies <= 35.' },
      { criterion: 'State', result: 'PASS', user_value: 'Karnataka', required_value: ['Karnataka'], explanation: 'State: Karnataka satisfies in [Karnataka].' },
      { criterion: 'Education Level', result: 'PASS', user_value: 'Undergraduate', required_value: ['Undergraduate', 'Postgraduate'], explanation: 'Education Level: Undergraduate satisfies in [Undergraduate, Postgraduate].' },
      { criterion: 'Annual Family Income', result: 'PASS', user_value: 240000, required_value: 250000, explanation: 'Annual Family Income: 240000 satisfies <= 250000.' },
      { criterion: 'Category', result: 'PASS', user_value: '2A', required_value: ['OBC', '2A', '2B'], explanation: 'Category: 2A satisfies in [OBC, 2A, 2B].' },
      { criterion: 'Currently Enrolled Student', result: 'PASS', user_value: true, required_value: true, explanation: 'Student Status: true satisfies equals true.' },
      { criterion: 'Domicile Certificate', result: 'NEEDS_VERIFICATION', user_value: null, required_value: true, explanation: "Profile field 'domicile_certificate' is missing. Please provide this information for verification." },
    ],
  },
  {
    scheme_id: 'IN-PMKVY-001',
    scheme_name: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
    overall_status: 'PARTIALLY_ELIGIBLE',
    criteria_results: [
      { criterion: 'Minimum Age', result: 'PASS', user_value: 20, required_value: 15, explanation: 'Minimum Age: 20 satisfies >= 15.' },
      { criterion: 'Maximum Age', result: 'PASS', user_value: 20, required_value: 45, explanation: 'Maximum Age: 20 satisfies <= 45.' },
      { criterion: 'Nationality', result: 'NEEDS_VERIFICATION', user_value: null, required_value: 'Indian', explanation: "Profile field 'nationality' is missing." },
      { criterion: 'Aadhaar Linked', result: 'NEEDS_VERIFICATION', user_value: null, required_value: true, explanation: "Profile field 'aadhaar_linked' is missing." },
    ],
  },
  {
    scheme_id: 'IN-PMAY-001',
    scheme_name: 'Pradhan Mantri Awas Yojana – Gramin (PMAY-G)',
    overall_status: 'PARTIALLY_ELIGIBLE',
    criteria_results: [
      { criterion: 'Annual Household Income', result: 'PASS', user_value: 240000, required_value: 300000, explanation: 'Income satisfies <= 300000.' },
      { criterion: 'Area Type', result: 'NEEDS_VERIFICATION', user_value: null, required_value: 'Rural', explanation: "Profile field 'area_type' is missing." },
      { criterion: 'Does Not Own Pucca House', result: 'NEEDS_VERIFICATION', user_value: null, required_value: false, explanation: "Profile field 'owns_pucca_house' is missing." },
      { criterion: 'Category', result: 'PASS', user_value: '2A', required_value: ['SC', 'ST', 'OBC', 'EWS', '2A'], explanation: 'Category: 2A satisfies in list.' },
    ],
  },
  {
    scheme_id: 'KA-FARM-001',
    scheme_name: 'Karnataka Raitha Siri Scheme',
    overall_status: 'INELIGIBLE',
    criteria_results: [
      { criterion: 'State', result: 'PASS', user_value: 'Karnataka', required_value: 'Karnataka', explanation: 'State matches.' },
      { criterion: 'Occupation', result: 'FAIL', user_value: null, required_value: 'Farmer', explanation: "Profile field 'occupation' is missing." },
      { criterion: 'Land Holding (acres)', result: 'NEEDS_VERIFICATION', user_value: null, required_value: 5, explanation: "Profile field 'land_holding_acres' is missing." },
      { criterion: 'Has Bank Account', result: 'NEEDS_VERIFICATION', user_value: null, required_value: true, explanation: "Profile field 'has_bank_account' is missing." },
    ],
  },
];
