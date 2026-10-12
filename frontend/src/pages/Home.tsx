import React from 'react';
import { ArrowRight, FileCheck2, Search, UserRound } from 'lucide-react';
import type { PageId } from '../types';

interface HomeProps {
  onNavigate: (page: PageId) => void;
}

const STEPS = [
  {
    title: 'Add your details',
    description: 'Share only the information needed to compare your situation with scheme requirements.',
    icon: <UserRound aria-hidden="true" className="h-5 w-5" />,
  },
  {
    title: 'Review possible matches',
    description: 'See which requirements appear to fit and which ones need more information.',
    icon: <Search aria-hidden="true" className="h-5 w-5" />,
  },
  {
    title: 'Prepare to apply',
    description: 'Check the documents and official sources before continuing with the scheme authority.',
    icon: <FileCheck2 aria-hidden="true" className="h-5 w-5" />,
  },
];

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section aria-labelledby="home-title" className="border-b border-slate-200 py-10 sm:py-14">
        <p className="mb-3 text-sm font-semibold text-blue-900">Government schemes, made easier to understand</p>
        <h1 id="home-title" className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl">
          Find support you may qualify for
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700 sm:text-lg">
          SchemeSaathi helps you explore government schemes in Karnataka and across India, compare published eligibility requirements with your details, and understand what you may need to apply.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button onClick={() => onNavigate('profile')} className="btn-primary w-full sm:w-auto">
            Check possible eligibility <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
          <button onClick={() => onNavigate('schemes')} className="btn-secondary w-full sm:w-auto">
            Browse schemes
          </button>
        </div>

        <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-600">
          SchemeSaathi provides guidance; it does not submit applications or guarantee approval. Confirm current requirements with the official scheme authority.
        </p>
      </section>

      <section aria-labelledby="how-it-works" className="py-9 sm:py-11">
        <div className="max-w-2xl">
          <p className="section-label mb-2">Using SchemeSaathi</p>
          <h2 id="how-it-works" className="text-2xl font-bold tracking-tight text-slate-950">What happens next</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">You stay in control at every step. Review information before deciding whether to apply.</p>
        </div>

        <ol className="mt-6 grid grid-cols-1 divide-y divide-slate-200 border-y border-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4 py-5 md:px-5 md:first:pl-0 md:last:pr-0">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-900">
                {step.icon}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-900">Step {index + 1}</p>
                <h3 className="mt-1 font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-700">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
