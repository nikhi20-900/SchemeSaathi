import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Schemes from './pages/Schemes';
import Assistant from './pages/Assistant';
import Documents from './pages/Documents';
import Results from './pages/Results';

/**
 * Main Application Root.
 * Owned by: Member 4 (Frontend + Integration)
 * 
 * Phase 1: Clean scaffolding displaying navigation tabs and placeholder views.
 */
export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />
      
      {/* Navigation Tab Bar for Scaffolding */}
      <div className="bg-white border-b px-6 py-2 flex gap-4 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('home')}
          className={`pb-1 border-b-2 ${activeTab === 'home' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500'}`}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab('assistant')}
          className={`pb-1 border-b-2 ${activeTab === 'assistant' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500'}`}
        >
          Assistant
        </button>
        <button
          onClick={() => setActiveTab('schemes')}
          className={`pb-1 border-b-2 ${activeTab === 'schemes' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500'}`}
        >
          Schemes
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-1 border-b-2 ${activeTab === 'profile' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500'}`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-1 border-b-2 ${activeTab === 'documents' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500'}`}
        >
          Documents
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`pb-1 border-b-2 ${activeTab === 'results' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500'}`}
        >
          Results
        </button>
      </div>

      <main className="max-w-6xl mx-auto py-6">
        {activeTab === 'home' && <Home />}
        {activeTab === 'assistant' && <Assistant />}
        {activeTab === 'schemes' && <Schemes />}
        {activeTab === 'profile' && <Profile />}
        {activeTab === 'documents' && <Documents />}
        {activeTab === 'results' && <Results />}
      </main>

      <footer className="border-t bg-white py-4 text-center text-xs text-gray-500 mt-12">
        SchemeSaathi · Phase 1 Scaffolding · All 4 Member Modules Initialized
      </footer>
    </div>
  );
};

export default App;
