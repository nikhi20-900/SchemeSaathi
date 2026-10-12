import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Schemes from './pages/Schemes';
import SchemeDetails from './pages/SchemeDetails';
import Assistant from './pages/Assistant';
import Documents from './pages/Documents';
import Results from './pages/Results';
import Evidence from './pages/Evidence';
import {
  checkEligibility,
  fetchProfile,
  saveProfile,
  MOCK_PROFILE,
} from './services/api';
import type { PageId, UserProfile, SchemeEligibilityResult } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PageId>('home');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('KA-SCHOLARSHIP-001');
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_PROFILE);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResults, setEvaluationResults] = useState<SchemeEligibilityResult[]>([]);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const profile = await fetchProfile();
        if (!active) return;
        setUserProfile(profile);
        runEvaluation(profile);
      } catch (error) {
        console.error('Failed to fetch profile from backend:', error);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  // Re-run evaluation whenever userProfile changes
  const runEvaluation = async (profileToEvaluate: UserProfile = userProfile) => {
    setIsEvaluating(true);
    try {
      const response = await checkEligibility(profileToEvaluate);
      setEvaluationResults(response.results || []);
    } catch (error) {
      console.error('Eligibility check failed:', error);
      setEvaluationResults([]);
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    runEvaluation(MOCK_PROFILE);
  }, []);

  const handleNavigate = (page: PageId, data?: any) => {
    if (page === 'scheme-details') {
      const schemeId = typeof data === 'string' ? data : data?.schemeId;
      if (typeof schemeId === 'string') {
        setSelectedSchemeId(schemeId);
      }
    }
    setActiveTab(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProfile = async (newProfile: UserProfile) => {
    const savedProfile = await saveProfile(newProfile);
    setUserProfile(savedProfile);
    runEvaluation(savedProfile);
  };

  const handleUpdateProfile = (updatedFields: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...updatedFields };
      runEvaluation(updated);
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-950">
      <Navbar activeTab={activeTab} onSelectTab={handleNavigate} />

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
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-sm text-slate-600">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            <span className="font-semibold text-slate-900">SchemeSaathi</span>
            <span className="mx-2" aria-hidden="true">·</span>
            Explore schemes and understand possible eligibility.
          </p>
          <p className="text-xs sm:text-right">Confirm current requirements with the official scheme authority before applying.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
