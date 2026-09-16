/**
 * Frontend API Service Client.
 * Owned by: Member 4 (Frontend + Integration)
 * 
 * Future responsibility:
 * Interface with FastAPI endpoints:
 * - /api/profile
 * - /api/schemes
 * - /api/assistant
 * - /api/eligibility
 * - /api/documents
 * - /api/demo
 */

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch('/health');
  return res.json();
}

export async function fetchProfile() {
  const res = await fetch(`${API_BASE}/profile`);
  return res.json();
}

export async function fetchSchemes() {
  const res = await fetch(`${API_BASE}/schemes`);
  return res.json();
}

export async function queryAssistant(query: string) {
  const res = await fetch(`${API_BASE}/assistant/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return res.json();
}
