import React from 'react';

/**
 * EvidenceCard Component Placeholder.
 * Owned by: Member 4 (Frontend + Integration)
 * 
 * Future responsibility:
 * Displays official gazetted clause quote, source title, and direct link to government portal.
 */
export const EvidenceCard: React.FC<{ evidence?: any }> = ({ evidence }) => {
  return (
    <div className="border rounded-lg p-4 bg-amber-50/60 border-amber-200 mb-4">
      <h5 className="font-bold text-xs text-amber-900">Official Government Evidence</h5>
      <p className="text-xs italic text-gray-700 mt-1">
        "{evidence?.quote || "Official gazetted clause citation will appear here."}"
      </p>
    </div>
  );
};
