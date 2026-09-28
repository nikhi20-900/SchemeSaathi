import React from 'react';
import { Shield, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PageId } from '../types';

interface NavbarProps {
  activeTab: PageId;
  onSelectTab: (tab: PageId) => void;
}

const NAV_ITEMS: { id: PageId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'profile', label: 'Profile' },
  { id: 'schemes', label: 'Schemes' },
  { id: 'assistant', label: 'AI Assistant' },
  { id: 'results', label: 'Eligibility' },
  { id: 'documents', label: 'Documents' },
  { id: 'evidence', label: 'Evidence' },
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      {/* Top header bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-linen-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <button
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-charcoal-800 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SS</span>
              </div>
              <span className="font-bold text-lg text-charcoal-900">
                Scheme<span className="text-terracotta-500">Saathi</span>
              </span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                    ${activeTab === item.id
                      ? 'text-charcoal-900'
                      : 'text-charcoal-700/60 hover:text-charcoal-800 hover:bg-linen-100'
                    }`}
                >
                  {item.label}
                  {activeTab === item.id && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-terracotta-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>

            {/* Civic badge + mobile menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold text-sage-600 bg-sage-50 px-2.5 py-1 rounded-full border border-sage-200">
                <Shield className="w-3 h-3" />
                <span>Deterministic Engine</span>
              </div>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-linen-100 transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-linen-300 overflow-hidden z-40 relative"
          >
            <nav className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onSelectTab(item.id); setMobileOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${activeTab === item.id
                      ? 'bg-linen-200 text-charcoal-900'
                      : 'text-charcoal-700/60 hover:bg-linen-100'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
