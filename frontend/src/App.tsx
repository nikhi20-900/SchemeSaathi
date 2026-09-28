import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, 
  ShieldCheck
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Schemes from './pages/Schemes';
import SchemeDetails from './pages/SchemeDetails';
import Assistant from './pages/Assistant';
import Documents from './pages/Documents';
import Results from './pages/Results';
import Evidence from './pages/Evidence';
import { MOCK_PROFILE } from './services/api';
import { evaluateAllSchemes } from './utils/engine';
import type { PageId, UserProfile, SchemeEligibilityResult } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PageId>('home');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('KA-SCHOLARSHIP-001');
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_PROFILE);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResults, setEvaluationResults] = useState<SchemeEligibilityResult[]>(() => {
    return evaluateAllSchemes(MOCK_PROFILE);
  });
  const [showDemoBar, setShowDemoBar] = useState<boolean>(true);

  // Re-run evaluation whenever userProfile changes
  const runEvaluation = (profileToEvaluate: UserProfile = userProfile) => {
    setIsEvaluating(true);
    setTimeout(() => {
      const results = evaluateAllSchemes(profileToEvaluate);
      setEvaluationResults(results);
      setIsEvaluating(false);
    }, 400);
  };

  const handleNavigate = (page: PageId, data?: any) => {
    if (page === 'scheme-details' && typeof data === 'string') {
      setSelectedSchemeId(data);
    }
    setActiveTab(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    runEvaluation(newProfile);
  };

  const handleUpdateProfile = (updatedFields: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...updatedFields };
      runEvaluation(updated);
      return updated;
    });
  };

  const handleResetDemo = () => {
    setUserProfile(MOCK_PROFILE);
    runEvaluation(MOCK_PROFILE);
    setActiveTab('home');
  };

  // Demo Workflow Steps
  const DEMO_STEPS: { id: PageId; label: string; desc: string }[] = [
    { id: 'profile', label: '1. Citizen Profile', desc: 'Age 20, Karnataka, 2A, ₹2.4L' },
    { id: 'assistant', label: '2. Ask AI', desc: 'Natural language search' },
    { id: 'schemes', label: '3. Browse Schemes', desc: 'Karnataka & Central portals' },
    { id: 'results', label: '4. Rules Engine', desc: 'Partially Eligible (Needs Domicile)' },
    { id: 'documents', label: '5. OCR Verification', desc: 'Upload Domicile Certificate' },
    { id: 'evidence', label: '6. Gazette Evidence', desc: 'Auditable legal citations' },
  ];

  return (
    <div className="min-h-screen bg-linen-100 text-charcoal-900 font-sans flex flex-col selection:bg-terracotta-100 selection:text-terracotta-700">
      {/* Top Main Navbar */}
      <Navbar activeTab={activeTab} onSelectTab={handleNavigate} />

      {/* Interactive Hackathon Guided Demo Workflow Bar */}
      {showDemoBar && (
        <div className="bg-charcoal-900 text-white border-b border-charcoal-800 text-xs py-2.5 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-terracotta-500"></span>
              </span>
              <span className="font-bold text-white tracking-wide">Demo Walkthrough:</span>
              <span className="text-white/60 hidden lg:inline">Follow the end-to-end verification pipeline</span>
            </div>

            {/* Stepper buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
              {DEMO_STEPS.map((step, idx) => {
                const isActive = activeTab === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => handleNavigate(step.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-terracotta-500 text-white font-bold shadow-sm'
                        : 'text-white/70 hover:text-white hover:bg-charcoal-800'
                    }`}
                  >
                    {step.label}
                  </button>
                );
              })}
            </div>

            {/* Reset Demo button */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleResetDemo}
                className="text-[11px] text-white/50 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-charcoal-800 transition-colors"
                title="Reset profile and evaluation to initial mock state"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto py-4 sm:py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Home onNavigate={handleNavigate} />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Profile
                profile={userProfile}
                onSave={handleSaveProfile}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {activeTab === 'schemes' && (
            <motion.div
              key="schemes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Schemes onNavigate={handleNavigate} />
            </motion.div>
          )}

          {activeTab === 'scheme-details' && (
            <motion.div
              key="scheme-details"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SchemeDetails
                schemeId={selectedSchemeId}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {activeTab === 'assistant' && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Assistant
                onNavigate={handleNavigate}
                userProfile={userProfile}
              />
            </motion.div>
          )}

          {activeTab === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Results
                userProfile={userProfile}
                results={evaluationResults}
                isLoading={isEvaluating}
                onReEvaluate={() => runEvaluation()}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Documents
                userProfile={userProfile}
                onUpdateProfile={handleUpdateProfile}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {activeTab === 'evidence' && (
            <motion.div
              key="evidence"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Evidence onNavigate={handleNavigate} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-linen-300 bg-white py-6 text-center text-xs text-charcoal-700/60 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-charcoal-900">SchemeSaathi</span>
            <span>·</span>
            <span>AI Government Scheme Navigator & Deterministic Eligibility Engine</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-sage-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Gazette Grounded
            </span>
            <span>·</span>
            <span>All 4 Member Systems Integrated</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
