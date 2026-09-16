import React from 'react';

/**
 * SchemeCard Component Placeholder.
 * Owned by: Member 4 (Frontend + Integration)
 * 
 * Future responsibility:
 * Renders individual scheme title, department, benefits, criteria breakdown, and official links.
 */
export const SchemeCard: React.FC<{ scheme?: any }> = ({ scheme }) => {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm mb-4">
      <h3 className="font-bold text-base">{scheme?.name || "Scheme Title Placeholder"}</h3>
      <p className="text-sm text-gray-600 mt-1">
        {scheme?.description || "Scheme description and benefits will appear here."}
      </p>
    </div>
  );
};
