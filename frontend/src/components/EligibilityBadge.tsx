import React from 'react';

/**
 * EligibilityBadge Component Placeholder.
 * Owned by: Member 4 (Frontend + Integration)
 * 
 * Future responsibility:
 * Renders status badges: ELIGIBLE (green), NEEDS_VERIFICATION (yellow), INELIGIBLE (red).
 */
export const EligibilityBadge: React.FC<{ status?: string }> = ({ status = 'NEEDS_VERIFICATION' }) => {
  return (
    <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800 border">
      {status}
    </span>
  );
};
