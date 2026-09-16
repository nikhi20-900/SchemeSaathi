import React from 'react';

/**
 * DocumentCard Component Placeholder.
 * Owned by: Member 4 (Frontend + Integration)
 * 
 * Future responsibility:
 * Displays uploaded document metadata, extraction confidence, and profile matching checklist.
 */
export const DocumentCard: React.FC<{ document?: any }> = ({ document }) => {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm mb-4">
      <h4 className="font-semibold text-sm">{document?.name || "Document Name Placeholder"}</h4>
      <p className="text-xs text-gray-500 mt-1">Status: Pending Verification</p>
    </div>
  );
};
