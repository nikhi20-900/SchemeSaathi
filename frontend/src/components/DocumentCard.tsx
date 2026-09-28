import React from 'react';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import type { DocumentVerification } from '../types';

interface DocumentCardProps {
  document?: DocumentVerification;
  fileName?: string;
  onUpload?: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, fileName, onUpload }) => {
  if (!document && !fileName) {
    return (
      <button
        onClick={onUpload}
        className="civic-card rounded-xl p-6 w-full border-dashed border-2 hover:border-terracotta-500/40 
          flex flex-col items-center gap-3 text-charcoal-700/50 hover:text-terracotta-500 transition-all group"
      >
        <div className="w-12 h-12 rounded-xl bg-linen-200 group-hover:bg-terracotta-100 flex items-center justify-center transition-colors">
          <Upload className="w-5 h-5" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Upload Document</p>
          <p className="text-xs mt-0.5">PDF, JPG, or PNG up to 10MB</p>
        </div>
      </button>
    );
  }

  const statusConfig = {
    VERIFIED: { icon: <CheckCircle className="w-4 h-4 text-sage-600" />, bg: 'bg-sage-50', border: 'border-sage-200', label: 'Verified' },
    MISMATCH: { icon: <AlertCircle className="w-4 h-4 text-red-500" />, bg: 'bg-red-50', border: 'border-red-200', label: 'Mismatch' },
    NEEDS_REVIEW: { icon: <AlertCircle className="w-4 h-4 text-saffron-500" />, bg: 'bg-saffron-50', border: 'border-saffron-100', label: 'Needs Review' },
  };

  const cfg = document ? statusConfig[document.status] : null;

  return (
    <div className="civic-card rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-linen-200 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-charcoal-700/60" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-charcoal-900 truncate">
            {document?.document_type || fileName || 'Document'}
          </h4>
          {cfg && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium mt-1 px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.border} border`}>
              {cfg.icon}
              {cfg.label}
            </span>
          )}
          {document?.summary && (
            <p className="text-xs text-charcoal-700/60 mt-2">{document.summary}</p>
          )}
        </div>
      </div>
    </div>
  );
};
