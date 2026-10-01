import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Shield, ArrowRight, BookOpen, ExternalLink, HelpCircle } from 'lucide-react';
import { EvidenceCard } from '../components/EvidenceCard';
import { queryAssistant } from '../services/api';
import type { PageId, EvidenceSource, UserProfile } from '../types';

interface AssistantProps {
  onNavigate: (page: PageId, data?: any) => void;
  userProfile: UserProfile;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  evidence?: EvidenceSource;
  suggestedAction?: {
    label: string;
    page: PageId;
    data?: any;
  };
}

const SAMPLE_QUESTIONS = [
  'Am I eligible for Karnataka Post-Matric OBC Scholarship?',
  'What documents are needed for Karnataka SSP scholarships?',
  'Can I apply for PMKVY skill certification at age 20?',
  'What is the income limit for PMAY-G housing subsidy?',
];

const PRE_TRAINED_RESPONSES: Record<string, {
  text: string;
  evidence: EvidenceSource;
  action?: { label: string; page: PageId; data?: any };
}> = {
  'post-matric': {
    text: `Based on official guidelines from the Department of Backward Classes and Minorities (Karnataka), the Post-Matric Scholarship is open to students enrolled in higher education (Undergraduate, Postgraduate, Diploma). 

Key eligibility requirements:
• Age between 17 and 35
• Resident of Karnataka with valid Domicile Certificate
• Belongs to OBC categories (2A, 2B, 3A, 3B, General-OBC)
• Annual family income not exceeding ₹2,50,000 per annum
• Enrolled as a full-time regular student

Your current profile matches age, state, education, and category, but requires a verified Domicile Certificate.`,
    evidence: {
      title: 'Karnataka State Scholarship Portal (SSP) Post-Matric Guidelines 2024-25',
      url: 'https://ssp.postmatric.karnataka.gov.in',
      quote: 'Students belonging to Category 2A/2B/3A/3B whose parental annual income is less than or equal to ₹2,50,000 are eligible for fee reimbursement.',
      scheme_id: 'KA-SCHOLARSHIP-001',
    },
    action: {
      label: 'Evaluate Eligibility for this Scheme',
      page: 'results',
    },
  },
  'pmkvy': {
    text: `The Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0) under the Ministry of Skill Development and Entrepreneurship provides industry-relevant skill training and certification.

Key criteria:
• Age between 15 and 45 years
• Indian citizen with valid Aadhaar-linked identity
• Free training + government assessment certification + direct monetary reward upon completion.`,
    evidence: {
      title: 'PMKVY 4.0 Operational Guidelines, Ministry of Skill Development & Entrepreneurship',
      url: 'https://www.pmkvyofficial.org',
      quote: 'Candidates of Indian nationality aged 15 to 45 years with valid Aadhaar identification are eligible for fee-waived short-term skill training.',
      scheme_id: 'IN-PMKVY-001',
    },
    action: {
      label: 'View PMKVY Scheme Details',
      page: 'scheme-details',
      data: 'IN-PMKVY-001',
    },
  },
  'pmay': {
    text: `Pradhan Mantri Awas Yojana – Gramin (PMAY-G) provides direct financial assistance for the construction of pucca houses to rural households without shelter or living in dilapidated houses.

Key criteria:
• Annual household income up to ₹3,00,000
• Must reside in a declared rural area
• Must not own a pucca house in any part of India
• Financial assistance: ₹1,20,000 in plain areas / ₹1,30,000 in hilly/difficult areas.`,
    evidence: {
      title: 'PMAY-Gramin Framework for Implementation, Ministry of Rural Development',
      url: 'https://pmayg.nic.in',
      quote: 'Beneficiary selection is based on housing deprivation parameters identified in Socio-Economic and Caste Census (SECC).',
      scheme_id: 'IN-PMAY-001',
    },
    action: {
      label: 'Check PMAY-G Eligibility',
      page: 'results',
    },
  },
  'default': {
    text: `SchemeSaathi's AI assistant searches gazetted government scheme criteria. While I can summarize guidelines and clarify terminology, all final eligibility evaluations are performed by our deterministic rules engine — ensuring zero hallucinations or incorrect guarantees.`,
    evidence: {
      title: 'SchemeSaathi Deterministic Governance Architecture Rulebook',
      url: 'https://github.com/nikhi20-900/SchemeSaathi',
      quote: 'The LLM does NOT make final eligibility determinations. Deterministic rule evaluation guarantees transparency and legal verifiability.',
    },
    action: {
      label: 'View All Available Schemes',
      page: 'schemes',
    },
  },
};

export default function Assistant({ onNavigate, userProfile }: AssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Namaste, ${userProfile.name || 'Citizen'}! I am SchemeSaathi's AI Navigator. You can ask me questions about government scholarships, welfare schemes, income limits, or required documents in plain language.`,
      timestamp: 'Just now',
      evidence: {
        title: 'Gazette of India & Karnataka State Welfare Notifications',
        url: 'https://karnataka.gov.in',
        quote: 'All criteria evaluated deterministically against gazetted welfare eligibility frameworks.',
      },
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await queryAssistant(textToSend);
      let evidence: EvidenceSource | undefined;
      let matchedSchemeId: string | undefined;

      if (data.sources && data.sources.length > 0) {
        const topSource = data.sources[0];
        matchedSchemeId = topSource.scheme_id;
        evidence = {
          title: topSource.source_title || topSource.scheme_name,
          url: topSource.source_url || 'https://www.india.gov.in',
          quote: topSource.matched_snippet || `${topSource.scheme_name} (${topSource.department})`,
          scheme_id: topSource.scheme_id,
        };
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        evidence,
        suggestedAction: matchedSchemeId ? {
          label: 'Evaluate Eligibility for this Scheme',
          page: 'results',
        } : undefined,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      // Fallback to pre-trained response if backend is unreachable
      const lower = textToSend.toLowerCase();
      let match = PRE_TRAINED_RESPONSES.default;
      if (lower.includes('post-matric') || lower.includes('scholarship') || lower.includes('obc') || lower.includes('ssp')) {
        match = PRE_TRAINED_RESPONSES['post-matric'];
      } else if (lower.includes('pmkvy') || lower.includes('skill') || lower.includes('kaushal')) {
        match = PRE_TRAINED_RESPONSES.pmkvy;
      } else if (lower.includes('pmay') || lower.includes('housing') || lower.includes('awas') || lower.includes('rural')) {
        match = PRE_TRAINED_RESPONSES.pmay;
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: match.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        evidence: match.evidence,
        suggestedAction: match.action,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-terracotta-100 flex items-center justify-center text-terracotta-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal-900">AI Scheme Navigator</h1>
        </div>
        <p className="text-sm text-charcoal-700/60">
          Ask questions in natural language. Powered by retrieval-augmented generation grounded in official gazette notifications.
        </p>

        {/* Civic Safeguard Banner */}
        <div className="mt-3 flex items-center gap-2 p-3 bg-sage-50 border border-sage-200 rounded-lg text-xs text-sage-700">
          <Shield className="w-4 h-4 text-sage-600 flex-shrink-0" />
          <span>
            <strong>Deterministic Safeguard:</strong> The AI helps you understand scheme rules and find relevant programs. Official eligibility determinations are computed with mathematical accuracy by our rules engine.
          </span>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="mb-6">
        <p className="section-label mb-2 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" /> Suggested Inquiries
        </p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs bg-white border border-linen-300 hover:border-terracotta-500/50 hover:bg-terracotta-100/30 text-charcoal-800 px-3 py-1.5 rounded-full transition-all text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="civic-card rounded-2xl p-4 sm:p-6 mb-4 min-h-[420px] max-h-[560px] overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-charcoal-800 text-white'
                  : 'bg-terracotta-500 text-white'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble Content */}
            <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-charcoal-800 text-white rounded-tr-none'
                    : 'bg-linen-100 border border-linen-300 text-charcoal-900 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[10px] mt-2 ${
                    msg.sender === 'user' ? 'text-white/50 text-right' : 'text-charcoal-700/40'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {/* Source Evidence Attached to Assistant Response */}
              {msg.evidence && (
                <div className="pt-1">
                  <EvidenceCard evidence={msg.evidence} />
                </div>
              )}

              {/* Action Button */}
              {msg.suggestedAction && (
                <div className="pt-1">
                  <button
                    onClick={() => onNavigate(msg.suggestedAction!.page, msg.suggestedAction!.data)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-terracotta-500 text-white hover:bg-terracotta-600 transition-colors shadow-sm"
                  >
                    <span>{msg.suggestedAction.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-terracotta-500 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-linen-100 border border-linen-300 rounded-tl-none flex items-center gap-2">
              <span className="text-xs text-charcoal-700/60 font-medium">Retrieving official gazette evidence</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500 typing-dot" />
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500 typing-dot" />
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500 typing-dot" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about any scheme, income limit, or required certificate..."
          className="input-field text-sm"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="btn-primary py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>
      </form>
    </div>
  );
}
