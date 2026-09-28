import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  FileCheck, 
  ArrowRight, 
  RotateCw, 
  User, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  Building2,
  MapPin,
  Filter
} from 'lucide-react';
import { EligibilityBadge } from '../components/EligibilityBadge';
import { EvidenceCard } from '../components/EvidenceCard';
import { LoadingState } from '../components/LoadingState';
import type { 
  SchemeEligibilityResult, 
  UserProfile, 
  PageId, 
  OverallStatus, 
  CriterionResult 
} from '../types';

interface ResultsProps {
  userProfile: UserProfile;
  results: SchemeEligibilityResult[];
  isLoading?: boolean;
  onReEvaluate: () => void;
  onNavigate: (page: PageId, data?: any) => void;
}

export default function Results({
  userProfile,
  results,
  isLoading = false,
  onReEvaluate,
  onNavigate,
}: ResultsProps) {
  const [filter, setFilter] = useState<'ALL' | OverallStatus>('ALL');
  const [expandedSchemes, setExpandedSchemes] = useState<Record<string, boolean>>({
    'KA-SCHOLARSHIP-001': true, // Auto-expand primary demo scheme
  });

  const toggleExpand = (schemeId: string) => {
    setExpandedSchemes(prev => ({
      ...prev,
      [schemeId]: !prev[schemeId],
    }));
  };

  const eligibleCount = results.filter(r => r.overall_status === 'ELIGIBLE').length;
  const partialCount = results.filter(r => r.overall_status === 'PARTIALLY_ELIGIBLE').length;
  const ineligibleCount = results.filter(r => r.overall_status === 'INELIGIBLE').length;

  const filteredResults = results.filter(r => {
    if (filter === 'ALL') return true;
    return r.overall_status === filter;
  });

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState
          message="Evaluating Citizen Profile against Government Rules…"
          steps={[
            'Fetching active state and central welfare criteria',
            'Applying deterministic mathematical rules',
            'Cross-checking document dependencies',
            'Compiling verifiability evidence',
          ]}
          currentStep={2}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Banner / Citizen Profile Summary */}
      <div className="civic-card rounded-2xl p-5 mb-6 bg-white border border-linen-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-charcoal-800 text-white flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-charcoal-900 text-base">{userProfile.name || 'Citizen'}</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-linen-200 text-charcoal-700">
                  {userProfile.category || 'General'}
                </span>
                {userProfile.domicile_certificate && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage-50 text-sage-700 border border-sage-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-sage-600" />
                    Domicile Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal-700/60 mt-0.5">
                Age: {userProfile.age} yrs · {userProfile.education} ({userProfile.course || 'General'}) · {userProfile.state} · Income: ₹{userProfile.annual_income?.toLocaleString('en-IN') || 0}/yr
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('profile')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-linen-300 text-charcoal-700 hover:bg-linen-100 transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={onReEvaluate}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-charcoal-800 text-white hover:bg-charcoal-700 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Re-evaluate
            </button>
          </div>
        </div>
      </div>

      {/* Evaluation Statistics Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div
          onClick={() => setFilter('ALL')}
          className={`cursor-pointer civic-card rounded-xl p-3.5 text-center transition-all ${
            filter === 'ALL' ? 'ring-2 ring-charcoal-800' : 'opacity-80 hover:opacity-100'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700/60">Total Evaluated</p>
          <p className="text-2xl font-black text-charcoal-900 mt-1">{results.length}</p>
        </div>

        <div
          onClick={() => setFilter('ELIGIBLE')}
          className={`cursor-pointer civic-card rounded-xl p-3.5 text-center transition-all bg-sage-50/50 border-sage-200 ${
            filter === 'ELIGIBLE' ? 'ring-2 ring-sage-600' : 'opacity-80 hover:opacity-100'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-sage-700">Eligible</p>
          <p className="text-2xl font-black text-sage-600 mt-1">{eligibleCount}</p>
        </div>

        <div
          onClick={() => setFilter('PARTIALLY_ELIGIBLE')}
          className={`cursor-pointer civic-card rounded-xl p-3.5 text-center transition-all bg-saffron-50/50 border-saffron-100 ${
            filter === 'PARTIALLY_ELIGIBLE' ? 'ring-2 ring-saffron-500' : 'opacity-80 hover:opacity-100'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-saffron-600">Needs Verification</p>
          <p className="text-2xl font-black text-saffron-500 mt-1">{partialCount}</p>
        </div>

        <div
          onClick={() => setFilter('INELIGIBLE')}
          className={`cursor-pointer civic-card rounded-xl p-3.5 text-center transition-all bg-red-50/40 border-red-200 ${
            filter === 'INELIGIBLE' ? 'ring-2 ring-red-500' : 'opacity-80 hover:opacity-100'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">Ineligible</p>
          <p className="text-2xl font-black text-red-600 mt-1">{ineligibleCount}</p>
        </div>
      </div>

      {/* Scheme Evaluation Cards List */}
      <div className="space-y-4">
        {filteredResults.length === 0 ? (
          <div className="civic-card rounded-2xl p-10 text-center">
            <Filter className="w-8 h-8 text-charcoal-700/40 mx-auto mb-2" />
            <h4 className="text-base font-bold text-charcoal-900">No schemes match this filter</h4>
            <p className="text-xs text-charcoal-700/60 mt-1">Try switching to "All Schemes" tab to view all evaluations.</p>
            <button
              onClick={() => setFilter('ALL')}
              className="mt-4 text-xs font-semibold px-4 py-2 bg-charcoal-800 text-white rounded-lg"
            >
              Show All Schemes
            </button>
          </div>
        ) : (
          filteredResults.map((schemeResult) => {
            const isExpanded = !!expandedSchemes[schemeResult.scheme_id];
            const passCount = schemeResult.criteria_results.filter(c => c.result === 'PASS').length;
            const needsVerifyCount = schemeResult.criteria_results.filter(c => c.result === 'NEEDS_VERIFICATION').length;
            const failCount = schemeResult.criteria_results.filter(c => c.result === 'FAIL').length;

            return (
              <motion.div
                key={schemeResult.scheme_id}
                layout
                className="civic-card rounded-2xl overflow-hidden border border-linen-300 transition-all hover:border-linen-400"
              >
                {/* Scheme Header Row */}
                <div
                  onClick={() => toggleExpand(schemeResult.scheme_id)}
                  className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-linen-200 text-charcoal-700">
                        {schemeResult.scheme_id}
                      </span>
                      <EligibilityBadge status={schemeResult.overall_status} size="sm" />
                    </div>

                    <h3 className="text-base font-bold text-charcoal-900 leading-snug">
                      {schemeResult.scheme_name}
                    </h3>

                    {/* Criteria status pills */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-charcoal-700/60 font-medium">
                      <span className="text-sage-600 font-semibold">{passCount} Pass</span>
                      <span>·</span>
                      <span className={needsVerifyCount > 0 ? 'text-saffron-600 font-semibold' : ''}>
                        {needsVerifyCount} Needs Verification
                      </span>
                      <span>·</span>
                      <span className={failCount > 0 ? 'text-red-500 font-semibold' : ''}>
                        {failCount} Fail
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs text-charcoal-700/50 block">Click to view criteria</span>
                    </div>
                    <button
                      className="p-2 rounded-lg bg-linen-100 hover:bg-linen-200 text-charcoal-700 transition-colors"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Criteria Breakdown Accordion */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-linen-200 bg-linen-100/50 px-5 py-4"
                    >
                      {/* Needs Verification Callout Alert if applicable */}
                      {needsVerifyCount > 0 && (
                        <div className="mb-4 p-3.5 rounded-xl bg-saffron-50 border border-saffron-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-saffron-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-saffron-600">
                                Document Verification Required
                              </p>
                              <p className="text-xs text-charcoal-700/70 mt-0.5">
                                You meet all demographic qualifications, but {needsVerifyCount} required certificate(s) must be verified to unlock 100% eligibility.
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => onNavigate('documents')}
                            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 bg-saffron-500 text-white rounded-lg hover:bg-saffron-600 transition-colors flex-shrink-0"
                          >
                            <span>Verify Documents</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-700/60 mb-3">
                        Deterministic Criterion Breakdown
                      </h4>

                      {/* Criteria Table */}
                      <div className="space-y-2">
                        {schemeResult.criteria_results.map((crit, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-white border border-linen-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <EligibilityBadge status={crit.result} size="sm" />
                                <span className="text-sm font-semibold text-charcoal-900">
                                  {crit.criterion}
                                </span>
                              </div>
                              <p className="text-xs text-charcoal-700/70 leading-relaxed">
                                {crit.explanation}
                              </p>
                            </div>

                            <div className="text-right sm:min-w-[140px] text-xs">
                              <div className="text-charcoal-700/50">Your Profile:</div>
                              <div className="font-mono font-semibold text-charcoal-900">
                                {crit.user_value !== null && crit.user_value !== undefined
                                  ? String(crit.user_value)
                                  : 'Not Provided'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="mt-4 pt-3 border-t border-linen-200 flex flex-wrap items-center justify-between gap-3">
                        <button
                          onClick={() => onNavigate('scheme-details', schemeResult.scheme_id)}
                          className="text-xs font-semibold text-terracotta-500 hover:text-terracotta-600 flex items-center gap-1"
                        >
                          <span>View Official Scheme Details & Guidelines</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-2">
                          {needsVerifyCount > 0 && (
                            <button
                              onClick={() => onNavigate('documents')}
                              className="btn-primary text-xs py-2 px-3.5"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              Upload & Verify Documents
                            </button>
                          )}
                          <button
                            onClick={() => onNavigate('evidence')}
                            className="btn-secondary text-xs py-2 px-3.5"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            View Gazette Sources
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
