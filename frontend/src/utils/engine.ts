/**
 * Client-Side Deterministic Rules Engine.
 * Matches backend `app.eligibility.engine` 1-to-1.
 * Ensures instant evaluation, offline resilience, and guaranteed demo success.
 */

import type { UserProfile, Scheme, SchemeEligibilityResult, CriterionResult, OverallStatus, CriterionVerdict } from '../types';
import { MOCK_SCHEMES } from '../services/api';

export function evaluateRule(
  userVal: any,
  operator: string,
  targetVal: any
): { passed: boolean; needsVerification: boolean; reason: string } {
  if (userVal === undefined || userVal === null || userVal === '') {
    return {
      passed: false,
      needsVerification: true,
      reason: `Field not provided in citizen profile. Requires document verification.`,
    };
  }

  let passed = false;
  const op = operator.toLowerCase();

  switch (op) {
    case '==':
    case 'equals':
      if (typeof userVal === 'string' && typeof targetVal === 'string') {
        passed = userVal.toLowerCase() === targetVal.toLowerCase();
      } else {
        passed = userVal === targetVal;
      }
      break;

    case '!=':
    case 'not_equals':
      passed = userVal !== targetVal;
      break;

    case '>=':
      passed = Number(userVal) >= Number(targetVal);
      break;

    case '<=':
      passed = Number(userVal) <= Number(targetVal);
      break;

    case '>':
      passed = Number(userVal) > Number(targetVal);
      break;

    case '<':
      passed = Number(userVal) < Number(targetVal);
      break;

    case 'in':
      if (Array.isArray(targetVal)) {
        if (typeof userVal === 'string') {
          passed = targetVal.map(v => String(v).toLowerCase()).includes(userVal.toLowerCase());
        } else {
          passed = targetVal.includes(userVal);
        }
      }
      break;

    case 'not_in':
      if (Array.isArray(targetVal)) {
        passed = !targetVal.includes(userVal);
      }
      break;

    default:
      passed = userVal === targetVal;
  }

  const reason = passed
    ? `Profile value '${String(userVal)}' satisfies '${operator} ${JSON.stringify(targetVal)}'.`
    : `Profile value '${String(userVal)}' does NOT satisfy '${operator} ${JSON.stringify(targetVal)}'.`;

  return { passed, needsVerification: false, reason };
}

export function evaluateScheme(profile: UserProfile, scheme: Scheme): SchemeEligibilityResult {
  const criteriaResults: CriterionResult[] = [];
  const rules = scheme.eligibility_rules || [];

  for (const rule of rules) {
    const userVal = profile[rule.field];
    const { passed, needsVerification, reason } = evaluateRule(userVal, rule.operator, rule.value);

    let verdict: CriterionVerdict;
    if (needsVerification) {
      verdict = 'NEEDS_VERIFICATION';
    } else if (passed) {
      verdict = 'PASS';
    } else {
      verdict = 'FAIL';
    }

    criteriaResults.push({
      criterion: rule.description || rule.field,
      result: verdict,
      user_value: userVal ?? null,
      required_value: rule.value,
      explanation: reason,
    });
  }

  let overallStatus: OverallStatus = 'ELIGIBLE';
  const hasFail = criteriaResults.some(c => c.result === 'FAIL');
  const hasNeedsVerify = criteriaResults.some(c => c.result === 'NEEDS_VERIFICATION');

  if (hasFail) {
    overallStatus = 'INELIGIBLE';
  } else if (hasNeedsVerify) {
    overallStatus = 'PARTIALLY_ELIGIBLE';
  } else {
    overallStatus = 'ELIGIBLE';
  }

  return {
    scheme_id: scheme.id,
    scheme_name: scheme.name,
    overall_status: overallStatus,
    criteria_results: criteriaResults,
  };
}

export function evaluateAllSchemes(profile: UserProfile, schemes: Scheme[] = MOCK_SCHEMES): SchemeEligibilityResult[] {
  return schemes.map(scheme => evaluateScheme(profile, scheme));
}
