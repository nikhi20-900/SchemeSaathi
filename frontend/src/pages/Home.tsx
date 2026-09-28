import React from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, FileCheck, Brain, ArrowRight, Sparkles } from 'lucide-react';
import type { PageId } from '../types';

interface HomeProps {
  onNavigate: (page: PageId) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-16 sm:py-24"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-50 border border-sage-200 text-sage-700 text-xs font-semibold mb-6">
          <Shield className="w-3.5 h-3.5" />
          Deterministic Eligibility · No AI Guesswork
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal-900 tracking-tight leading-[1.1]">
          Navigate Government
          <br />
          Schemes with{' '}
          <span className="text-terracotta-500">Confidence</span>
        </h1>

        <p className="mt-5 text-lg text-charcoal-700/70 max-w-2xl mx-auto leading-relaxed">
          SchemeSaathi evaluates your eligibility against official government criteria using
          a deterministic rules engine — not AI predictions. Every result is backed by
          evidence from gazetted sources.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={() => onNavigate('profile')} className="btn-primary text-base px-8 py-3">
            Set Up Your Profile
            <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => onNavigate('schemes')} className="btn-secondary text-base px-8 py-3">
            Browse Schemes
          </button>
        </div>
      </motion.section>

      {/* How it works */}
      <section className="py-12">
        <h2 className="section-label text-center mb-8">How SchemeSaathi Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              icon: <Search className="w-5 h-5" />,
              title: 'Set Your Profile',
              desc: 'Enter your age, state, education, income, and category.',
              color: 'bg-sage-50 text-sage-600',
            },
            {
              icon: <Brain className="w-5 h-5" />,
              title: 'Ask the AI',
              desc: 'Ask questions in natural language. AI retrieves from official sources.',
              color: 'bg-terracotta-100 text-terracotta-600',
            },
            {
              icon: <Shield className="w-5 h-5" />,
              title: 'Rules Engine',
              desc: 'Deterministic evaluation: PASS, FAIL, or NEEDS_VERIFICATION per criterion.',
              color: 'bg-saffron-50 text-saffron-600',
            },
            {
              icon: <FileCheck className="w-5 h-5" />,
              title: 'Verify Documents',
              desc: 'Upload documents for OCR extraction and profile matching.',
              color: 'bg-linen-200 text-charcoal-700',
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              className="civic-card rounded-xl p-5 text-center"
            >
              <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center mx-auto mb-3`}>
                {step.icon}
              </div>
              <h3 className="font-semibold text-sm text-charcoal-900 mb-1">{step.title}</h3>
              <p className="text-xs text-charcoal-700/60 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick demo CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="py-12"
      >
        <div className="civic-card rounded-2xl p-8 sm:p-10 text-center bg-charcoal-800 border-charcoal-700">
          <Sparkles className="w-6 h-6 text-saffron-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Try the Demo Flow</h2>
          <p className="text-sm text-white/60 mb-6 max-w-md mx-auto">
            See how a sample profile (Age: 20, Karnataka, BCA, ₹2,40,000) is evaluated
            against real government scheme criteria.
          </p>
          <button
            onClick={() => onNavigate('results')}
            className="btn-terracotta text-base px-8 py-3"
          >
            Run Eligibility Check
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.section>
    </div>
  );
}
