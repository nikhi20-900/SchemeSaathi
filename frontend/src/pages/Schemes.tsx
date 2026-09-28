import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { SchemeCard } from '../components/SchemeCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/LoadingState';
import { MOCK_SCHEMES } from '../services/api';
import type { Scheme, PageId } from '../types';

interface SchemesProps {
  onNavigate: (page: PageId, data?: any) => void;
}

export default function Schemes({ onNavigate }: SchemesProps) {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');

  useEffect(() => {
    // Try backend first, fallback to mock data
    async function load() {
      try {
        const res = await fetch('/api/eligibility/schemes');
        if (res.ok) {
          const data = await res.json();
          setSchemes(data.schemes || []);
        } else {
          setSchemes(MOCK_SCHEMES);
        }
      } catch {
        setSchemes(MOCK_SCHEMES);
      }
      setLoading(false);
    }
    load();
  }, []);

  const states = ['all', ...Array.from(new Set(schemes.map(s => s.state)))];

  const filtered = schemes.filter(s => {
    const matchesSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase());
    const matchesState = stateFilter === 'all' || s.state === stateFilter;
    return matchesSearch && matchesState;
  });

  if (loading) return <LoadingState message="Loading government schemes…" />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-charcoal-900 mb-1">Government Schemes</h1>
        <p className="text-sm text-charcoal-700/60 mb-6">
          Browse verified Karnataka SSP and Central Government schemes with structured eligibility criteria.
        </p>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-700/40" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search schemes by name, department…"
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-700/40" />
            <select
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              className="select-field pl-10 pr-8"
            >
              {states.map(s => (
                <option key={s} value={s}>{s === 'all' ? 'All States' : s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-charcoal-700/50 mb-4">
          {filtered.length} scheme{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Scheme list */}
        {filtered.length === 0 ? (
          <EmptyState
            title="No schemes found"
            description="Try adjusting your search or filter criteria."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((scheme, i) => (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <SchemeCard
                  scheme={scheme}
                  onClick={() => onNavigate('scheme-details', { schemeId: scheme.id })}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
