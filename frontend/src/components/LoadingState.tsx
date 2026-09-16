import React from 'react';

/**
 * LoadingState Component Placeholder.
 * Owned by: Member 4 (Frontend + Integration)
 * 
 * Future responsibility:
 * Renders loading spinner and step-by-step pipeline status messages during AI processing.
 */
export const LoadingState: React.FC<{ message?: string }> = ({
  message = "Processing official guidelines..."
}) => {
  return (
    <div className="p-8 text-center text-sm text-gray-500">
      <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2" />
      <p>{message}</p>
    </div>
  );
};
