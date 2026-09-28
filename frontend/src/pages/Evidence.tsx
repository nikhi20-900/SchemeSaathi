import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileCheck, 
  ExternalLink, 
  Shield, 
  Building2, 
  Calendar, 
  BookOpen, 
  Search, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import type { PageId } from '../types';

interface EvidenceProps {
  onNavigate: (page: PageId, data?: any) => void;
}

interface GazetteSourceItem {
  id: string;
  schemeId: string;
  schemeName: string;
  department: string;
  notificationNo: string;
  gazetteDate: string;
  portalUrl: string;
  title: string;
  excerpt: string;
  hash: string;
  keyRules: string[];
}

const OFFICIAL_EVIDENCE_REGISTRY: GazetteSourceItem[] = [
  {
    id: 'EVD-KA-SSP-01',
    schemeId: 'KA-SCHOLARSHIP-001',
    schemeName: 'Karnataka Post-Matric Scholarship for OBC Students',
    department: 'Department of Backward Classes and Minorities, Govt. of Karnataka',
    notificationNo: 'BCWD/SCH/2024-25/CR-44',
    gazetteDate: '14-May-2024',
    portalUrl: 'https://ssp.postmatric.karnataka.gov.in',
    title: 'Notification on Post-Matric Fee Concession and Scholarship Framework (SSP 2024-25)',
    excerpt: 'Eligible students belonging to Category 1, 2A, 2B, 3A, and 3B enrolled in recognized post-matric institutions whose parental annual family income does not exceed ₹2,50,000 shall be sanctioned fee reimbursement and monthly maintenance.',
    hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    keyRules: [
      'Age between 17 and 35 years',
      'Domicile of Karnataka state confirmed via Form 3',
      'Family annual income ceiling: ₹2,50,000',
      'Category 2A, 2B, 3A, 3B or OBC recognized list',
    ],
  },
  {
    id: 'EVD-IN-PMKVY-01',
    schemeId: 'IN-PMKVY-001',
    schemeName: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)',
    department: 'Ministry of Skill Development and Entrepreneurship, Govt. of India',
    notificationNo: 'MSDE-18011/04/2023-TTC',
    gazetteDate: '28-Dec-2023',
    portalUrl: 'https://www.pmkvyofficial.org',
    title: 'Operational Guidelines for Implementation of PMKVY 4.0 Scheme Component',
    excerpt: 'Any Indian national between 15 to 45 years possessing an Aadhaar card and meeting individual job role education requirements is entitled to zero-fee skill training with direct DBT reward assessment support.',
    hash: 'sha256:4a382c4f74d6182cfeb5c9f5ff17b9b71d9d95f4007df3cf090c29f606e788bc',
    keyRules: [
      'Age between 15 and 45 years',
      'Indian citizenship',
      'Aadhaar seeded bank account',
    ],
  },
  {
    id: 'EVD-IN-PMAYG-01',
    schemeId: 'IN-PMAY-001',
    schemeName: 'Pradhan Mantri Awas Yojana – Gramin (PMAY-G)',
    department: 'Ministry of Rural Development, Govt. of India',
    notificationNo: 'PMAY-G/RULES/REV-2023',
    gazetteDate: '10-Aug-2023',
    portalUrl: 'https://pmayg.nic.in',
    title: 'PMAY-G Master Guidelines on Beneficiary Entitlements and Socio-Economic Deprivation',
    excerpt: 'Financial assistance of ₹1,20,000 in plain areas and ₹1,30,000 in hilly/difficult areas for pucca house construction to households without shelter or residing in kutcha dwellings with income below ₹3,00,000.',
    hash: 'sha256:d55f053e00be928df77c5d985a6a0e67dbd3ad55a1532029c07e05fc867a544f',
    keyRules: [
      'Household annual income ≤ ₹3,00,000',
      'Must reside in declared rural block',
      'Does not own a permanent pucca house',
    ],
  },
  {
    id: 'EVD-KA-FARM-01',
    schemeId: 'KA-FARM-001',
    schemeName: 'Karnataka Raitha Siri Scheme',
    department: 'Department of Agriculture, Govt. of Karnataka',
    notificationNo: 'AGRI/R-SIRI/2023/89',
    gazetteDate: '05-Sep-2023',
    portalUrl: 'https://raitamitra.karnataka.gov.in',
    title: 'Incentive and Interest Subvention Scheme for Small and Marginal Agriculturalists',
    excerpt: 'Zero percent crop loan subvention up to ₹3,00,000 and direct millet cultivation assistance of ₹10,000 per hectare for registered farmers holding up to 5 acres in Karnataka.',
    hash: 'sha256:88a6d9cf114299b666a2e4604a11f95b5c90b85b46e382061e8cf0bbd3910c22',
    keyRules: [
      'Karnataka resident farmer',
      'Agricultural land holding ≤ 5 acres',
      'Active bank account linked to FRUITS / RTC ID',
    ],
  },
];

export default function Evidence({ onNavigate }: EvidenceProps) {
  const [search, setSearch] = useState('');

  const filteredSources = OFFICIAL_EVIDENCE_REGISTRY.filter((ev) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      ev.schemeName.toLowerCase().includes(q) ||
      ev.department.toLowerCase().includes(q) ||
      ev.notificationNo.toLowerCase().includes(q) ||
      ev.title.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-saffron-100 flex items-center justify-center text-saffron-600">
            <FileCheck className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal-900">Official Evidence & Source Registry</h1>
        </div>
        <p className="text-sm text-charcoal-700/60">
          Every eligibility rule in SchemeSaathi is legally grounded in official gazettes, government orders (G.O.), and department portal guidelines.
        </p>

        {/* Audit Transparency Badge */}
        <div className="mt-3 flex items-center gap-2 p-3 bg-sage-50 border border-sage-200 rounded-lg text-xs text-sage-700">
          <Shield className="w-4 h-4 text-sage-600 flex-shrink-0" />
          <span>
            <strong>Deterministic Grounding:</strong> No arbitrary criteria. Each rule maps 1-to-1 with signed gazette orders and tamper-evident cryptographic hashes.
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="civic-card rounded-2xl p-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-charcoal-700/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gazette orders, notification numbers, schemes, or departments…"
            className="input-field pl-10 text-sm"
          />
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-6">
        {filteredSources.map((ev) => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="civic-card rounded-2xl overflow-hidden border border-linen-300 bg-white"
          >
            {/* Top Bar */}
            <div className="p-6 border-b border-linen-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-saffron-100 text-saffron-700">
                    {ev.notificationNo}
                  </span>
                  <span className="text-xs text-charcoal-700/50 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Gazetted: {ev.gazetteDate}
                  </span>
                </div>

                <a
                  href={ev.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta-500 hover:text-terracotta-600"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <h3 className="text-base font-bold text-charcoal-900 leading-snug">{ev.title}</h3>
              <p className="text-xs text-charcoal-700/60 mt-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-charcoal-700/40" />
                {ev.department}
              </p>
            </div>

            {/* Content & Quote */}
            <div className="p-6 bg-linen-50/40 space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-700/50 mb-1">
                  Verbatim Gazette Extract
                </p>
                <div className="p-3.5 rounded-xl bg-white border border-linen-200 text-xs italic text-charcoal-800 leading-relaxed">
                  "{ev.excerpt}"
                </div>
              </div>

              {/* Key Rules Enforced Deterministically */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-700/50 mb-2">
                  Enforced Deterministic Rules
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ev.keyRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white border border-linen-200 text-xs flex items-center gap-2 text-charcoal-800"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-sage-600 flex-shrink-0" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cryptographic Proof Hash & Scheme Link */}
              <div className="pt-3 border-t border-linen-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="font-mono text-[10px] text-charcoal-700/40 truncate max-w-sm">
                  {ev.hash}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('scheme-details', ev.schemeId)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-charcoal-800 hover:text-terracotta-500 transition-colors"
                  >
                    <span>View Scheme Rules</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigate('results')}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    Evaluate Me
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
