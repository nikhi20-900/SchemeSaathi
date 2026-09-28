import React from 'react';
import { ExternalLink, FileCheck, Quote } from 'lucide-react';
import type { EvidenceSource } from '../types';

interface EvidenceCardProps {
  evidence: EvidenceSource;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence }) => {
  return (
    <div className="rounded-xl border border-saffron-100 bg-saffron-50/50 p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-saffron-100 flex items-center justify-center flex-shrink-0">
          <FileCheck className="w-4 h-4 text-saffron-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="section-label mb-1">Official Government Source</p>
          <h5 className="text-sm font-semibold text-charcoal-900">{evidence.title}</h5>

          {evidence.quote && (
            <div className="mt-2 flex gap-2">
              <Quote className="w-3.5 h-3.5 text-saffron-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs italic text-charcoal-700/70 leading-relaxed">
                "{evidence.quote}"
              </p>
            </div>
          )}

          {evidence.url && (
            <a
              href={evidence.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-terracotta-500 hover:text-terracotta-600 mt-2 transition-colors"
            >
              View on official portal
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
