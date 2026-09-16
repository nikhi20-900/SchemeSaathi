import React from 'react';

/**
 * Navbar Component Placeholder.
 * Owned by: Member 4 (Frontend + Integration)
 * 
 * Future responsibility:
 * Navigation bar with SchemeSaathi logo, civic badge ("🔒 LLM does not determine eligibility"),
 * language switcher (English, Hindi, Kannada), and navigation links.
 */
export const Navbar: React.FC<{ activeTab?: string; onSelectTab?: (tab: string) => void }> = ({
  activeTab = 'home',
  onSelectTab
}) => {
  return (
    <header className="border-b bg-white p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg">Scheme<span className="text-orange-600">Saathi</span></span>
        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded border">
          Phase 1 Scaffold
        </span>
      </div>
      <div className="text-xs text-gray-500 font-mono">
        🔒 LLM does not determine eligibility
      </div>
    </header>
  );
};
