import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, MapPin, Gift, FileText, ExternalLink } from 'lucide-react';
import { EligibilityBadge } from '../components/EligibilityBadge';
import type { Scheme, PageId } from '../types';
import { MOCK_SCHEMES } from '../services/api';

interface SchemeDetailsProps {
  schemeId: string;
  onNavigate: (page: PageId, data?: any) => void;
}

export default function SchemeDetails({ schemeId, onNavigate }: SchemeDetailsProps) {
  const scheme = MOCK_SCHEMES.find(s => s.id === schemeId) || MOCK_SCHEMES[0];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {/* Back */}
        <button
          onClick={() => onNavigate('schemes')}
          className="flex items-center gap-1.5 text-sm text-charcoal-700/60 hover:text-charcoal-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Schemes
        </button>

        {/* Header */}
        <div className="civic-card rounded-xl p-6 mb-6">
          <h1 className="text-xl font-bold text-charcoal-900 mb-3">{scheme.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="flex items-center gap-1.5 text-xs text-charcoal-700/60 bg-linen-100 px-2.5 py-1 rounded-full">
              <Building2 className="w-3 h-3" />
              {scheme.department}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-charcoal-700/60 bg-linen-100 px-2.5 py-1 rounded-full">
              <MapPin className="w-3 h-3" />
              {scheme.state}
            </span>
          </div>
          <p className="text-sm text-charcoal-700/70 leading-relaxed">{scheme.description}</p>
        </div>

        {/* Benefits */}
        <div className="civic-card rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4 text-sage-600" />
            <h2 className="text-sm font-bold text-charcoal-900">Benefits</h2>
          </div>
          <p className="text-sm text-charcoal-700/70">{scheme.benefits}</p>
        </div>

        {/* Eligibility Rules */}
        {scheme.eligibility_rules && scheme.eligibility_rules.length > 0 && (
          <div className="civic-card rounded-xl p-5 mb-6">
            <h2 className="text-sm font-bold text-charcoal-900 mb-4">Eligibility Criteria</h2>
            <div className="space-y-3">
              {scheme.eligibility_rules.map((rule, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-linen-200 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-charcoal-800">
                      {rule.description || rule.field}
                    </p>
                    <p className="text-xs text-charcoal-700/50 mt-0.5">
                      {rule.field} {rule.operator} {JSON.stringify(rule.value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Required Documents */}
        {scheme.required_documents && scheme.required_documents.length > 0 && (
          <div className="civic-card rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-saffron-500" />
              <h2 className="text-sm font-bold text-charcoal-900">Required Documents</h2>
            </div>
            <ul className="space-y-2">
              {scheme.required_documents.map((doc, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-charcoal-700/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta-400" />
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('results')}
            className="btn-primary"
          >
            Check My Eligibility
          </button>
          {scheme.source_url && (
            <a
              href={scheme.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Official Portal
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </motion.div>
    </div>
  );
}
