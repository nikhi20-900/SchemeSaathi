import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { CriterionVerdict, OverallStatus } from '../types';

const VERDICT_CONFIG: Record<CriterionVerdict, { icon: React.ReactNode; classes: string; label: string }> = {
  PASS: {
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    classes: 'bg-sage-50 text-sage-700 border-sage-200',
    label: 'Pass',
  },
  FAIL: {
    icon: <XCircle className="w-3.5 h-3.5" />,
    classes: 'bg-red-50 text-red-700 border-red-200',
    label: 'Fail',
  },
  NEEDS_VERIFICATION: {
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    classes: 'bg-saffron-50 text-saffron-600 border-saffron-100',
    label: 'Verify',
  },
};

const STATUS_CONFIG: Record<OverallStatus | 'ERROR', { classes: string; label: string; dot: string }> = {
  ELIGIBLE: {
    classes: 'bg-sage-50 text-sage-700 border-sage-200',
    label: 'Eligible',
    dot: 'bg-sage-500',
  },
  INELIGIBLE: {
    classes: 'bg-red-50 text-red-700 border-red-200',
    label: 'Ineligible',
    dot: 'bg-red-500',
  },
  PARTIALLY_ELIGIBLE: {
    classes: 'bg-saffron-50 text-saffron-600 border-saffron-100',
    label: 'Partially Eligible',
    dot: 'bg-saffron-500',
  },
  ERROR: {
    classes: 'bg-gray-100 text-gray-600 border-gray-200',
    label: 'Error',
    dot: 'bg-gray-400',
  },
};

interface EligibilityBadgeProps {
  status: CriterionVerdict | OverallStatus | 'ERROR';
  size?: 'sm' | 'md';
}

export const EligibilityBadge: React.FC<EligibilityBadgeProps> = ({ status, size = 'sm' }) => {
  const verdictCfg = VERDICT_CONFIG[status as CriterionVerdict];
  const statusCfg = STATUS_CONFIG[status as OverallStatus | 'ERROR'];

  if (verdictCfg) {
    return (
      <span className={`civic-badge ${verdictCfg.classes} ${size === 'md' ? 'px-3 py-1.5 text-sm' : ''}`}>
        {verdictCfg.icon}
        {verdictCfg.label}
      </span>
    );
  }

  if (statusCfg) {
    return (
      <span className={`civic-badge ${statusCfg.classes} ${size === 'md' ? 'px-3 py-1.5 text-sm' : ''}`}>
        <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
        {statusCfg.label}
      </span>
    );
  }

  return <span className="civic-badge bg-gray-100 text-gray-600 border-gray-200">{status}</span>;
};
