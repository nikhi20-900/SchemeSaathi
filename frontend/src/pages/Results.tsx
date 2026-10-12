import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  FileCheck, 
  ArrowRight, 
  RotateCw, 
  User, 
  ShieldCheck,
  Filter
} from 'lucide-react';
import { EligibilityBadge } from '../components/EligibilityBadge';
import { LoadingState } from '../components/LoadingState';
import type { 
  SchemeEligibilityResult, 
  UserProfile, 
  PageId, 
  OverallStatus 
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
          message="Checking schemes against the details you provided…"
          steps={[
            'Loading current scheme requirements',
            'Comparing your details with those requirements',
            'Preparing your possible matches',
          ]}
          currentStep={2}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-charcoal-900">Your possible matches</h1>
        <p className="mt-1 text-sm text-charcoal-700/70">These results are a guide based on the details provided. The scheme authority makes the final decision.</p>
      </div>

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
              Edit my details
            </button>
            <button
              onClick={onReEvaluate}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-charcoal-800 text-white hover:bg-charcoal-700 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Check again
            </button>
          </div>
        </div>
      </div>

      {/* Evaluation Statistics Header */}
      <p className="mb-2 text-xs text-charcoal-700/60">Select a status to filter the results.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          aria-pressed={filter === 'ALL'}
          className={`w-full civic-card rounded-xl p-3.5 text-center transition-all ${
            filter === 'ALL' ? 'ring-2 ring-charcoal-800' : 'opacity-80 hover:opacity-100'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700/60">All matches</p>
          <p className="text-2xl font-black text-charcoal-900 mt-1">{results.length}</p>
        </button>

        <button
          type="button"
          onClick={() => setFilter('ELIGIBLE')}
          aria-pressed={filter === 'ELIGIBLE'}
          className={`w-full civic-card rounded-xl p-3.5 text-center transition-all bg-sage-50/50 border-sage-200 ${
            filter === 'ELIGIBLE' ? 'ring-2 ring-sage-600' : 'opacity-80 hover:opacity-100'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-sage-700">Likely eligible</p>
          <p className="text-2xl font-black text-sage-600 mt-1">{eligibleCount}</p>
        </button>

        <button
          type="button"
          onClick={() => setFilter('PARTIALLY_ELIGIBLE')}
          aria-pressed={filter === 'PARTIALLY_ELIGIBLE'}
          className={`w-full civic-card rounded-xl p-3.5 text-center transition-all bg-saffron-50/50 border-saffron-100 ${
            filter === 'PARTIALLY_ELIGIBLE' ? 'ring-2 ring-saffron-500' : 'opacity-80 hover:opacity-100'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-saffron-600">Need more details</p>
          <p className="text-2xl font-black text-saffron-500 mt-1">{partialCount}</p>
        </button>

        <button
          type="button"
          onClick={() => setFilter('INELIGIBLE')}
          aria-pressed={filter === 'INELIGIBLE'}
          className={`w-full civic-card rounded-xl p-3.5 text-center transition-all bg-red-50/40 border-red-200 ${
            filter === 'INELIGIBLE' ? 'ring-2 ring-red-500' : 'opacity-80 hover:opacity-100'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">Unlikely to match</p>
          <p className="text-2xl font-black text-red-600 mt-1">{ineligibleCount}</p>
        </button>
      </div>

      {/* Scheme Evaluation Cards List */}
      <div className="space-y-4">
        {filteredResults.length === 0 ? (
          <div className="civic-card rounded-2xl p-10 text-center">
            <Filter className="w-8 h-8 text-charcoal-700/40 mx-auto mb-2" />
            <h4 className="text-base font-bold text-charcoal-900">No schemes match this filter</h4>
            <p className="text-xs text-charcoal-700/60 mt-1">Choose “All matches” to see every result again.</p>
            <button
              onClick={() => setFilter('ALL')}
              className="mt-4 text-xs font-semibold px-4 py-2 bg-charcoal-800 text-white rounded-lg"
            >
              Show all matches
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
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  aria-controls={`criteria-${schemeResult.scheme_id}`}
                  onClick={() => toggleExpand(schemeResult.scheme_id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleExpand(schemeResult.scheme_id);
                    }
                  }}
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
                      <span className="text-sage-600 font-semibold">{passCount} requirements met</span>
                      <span>·</span>
                      <span className={needsVerifyCount > 0 ? 'text-saffron-600 font-semibold' : ''}>
                        {needsVerifyCount} to check
                      </span>
                      <span>·</span>
                      <span className={failCount > 0 ? 'text-red-500 font-semibold' : ''}>
                        {failCount} don't match
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs text-charcoal-700/60 block">{isExpanded ? 'Hide requirements' : 'View requirements'}</span>
                    </div>
                    <span aria-hidden="true" className="p-2 rounded-lg bg-linen-100 text-charcoal-700">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

                {/* Expanded Criteria Breakdown Accordion */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      id={`criteria-${schemeResult.scheme_id}`}
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
                                Check these documents
                              </p>
                              <p className="text-xs text-charcoal-700/70 mt-0.5">
                                {needsVerifyCount} document or detail{needsVerifyCount === 1 ? '' : 's'} still need{needsVerifyCount === 1 ? 's' : ''} to be checked before you can confirm this match.
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => onNavigate('documents')}
                            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 bg-saffron-500 text-white rounded-lg hover:bg-saffron-600 transition-colors flex-shrink-0"
                          >
                            <span>Review documents</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-700/60 mb-3">
                        Requirements and your details
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
                          <span>View scheme details and requirements</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-2">
                          {needsVerifyCount > 0 && (
                            <button
                              onClick={() => onNavigate('documents')}
                              className="btn-primary text-xs py-2 px-3.5"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              Review documents
                            </button>
                          )}
                          <button
                            onClick={() => onNavigate('evidence')}
                            className="btn-secondary text-xs py-2 px-3.5"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            View information sources
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
