import React from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, ChevronRight } from 'lucide-react';
import { EligibilityBadge } from './EligibilityBadge';
import type { Scheme, OverallStatus } from '../types';

interface SchemeCardProps {
  scheme: Scheme;
  overallStatus?: OverallStatus;
  passCount?: number;
  totalCount?: number;
  onClick?: () => void;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  overallStatus,
  passCount,
  totalCount,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      className="civic-card rounded-xl p-5 cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {overallStatus && <EligibilityBadge status={overallStatus} />}
          </div>
          <h3 className="font-semibold text-charcoal-900 text-base mb-1 group-hover:text-terracotta-600 transition-colors">
            {scheme.name}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="flex items-center gap-1 text-xs text-charcoal-700/60">
              <Building2 className="w-3 h-3" />
              {scheme.department}
            </span>
            <span className="flex items-center gap-1 text-xs text-charcoal-700/60">
              <MapPin className="w-3 h-3" />
              {scheme.state}
            </span>
          </div>
          <p className="text-sm text-charcoal-700/70 line-clamp-2">{scheme.description}</p>

          {passCount !== undefined && totalCount !== undefined && totalCount > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-charcoal-700/60 mb-1">
                <span>Criteria matched</span>
                <span className="font-semibold text-charcoal-800">{passCount}/{totalCount}</span>
              </div>
              <div className="h-1.5 bg-linen-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(passCount / totalCount) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    overallStatus === 'ELIGIBLE' ? 'bg-sage-500' :
                    overallStatus === 'INELIGIBLE' ? 'bg-red-400' : 'bg-saffron-500'
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-charcoal-700/30 group-hover:text-terracotta-500 transition-colors flex-shrink-0 mt-1" />
      </div>
    </motion.div>
  );
};
