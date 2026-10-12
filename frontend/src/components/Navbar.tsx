import React from 'react';
import { Menu, X } from 'lucide-react';
import type { PageId } from '../types';

interface NavbarProps {
  activeTab: PageId;
  onSelectTab: (tab: PageId) => void;
}

const NAV_ITEMS: { id: PageId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'schemes', label: 'Find schemes' },
  { id: 'results', label: 'Check eligibility' },
  { id: 'assistant', label: 'Ask a question' },
  { id: 'profile', label: 'My details' },
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [activeTab]);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileOpen]);

  const isActive = (tab: PageId) => activeTab === tab || (tab === 'schemes' && activeTab === 'scheme-details');
  const selectTab = (tab: PageId) => {
    onSelectTab(tab);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[4.5rem] items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => selectTab('home')}
            aria-label="SchemeSaathi home"
            className="flex min-h-11 shrink-0 items-center gap-3 rounded-sm focus-visible:outline"
          >
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-900 text-sm font-bold text-white">SS</span>
            <span className="text-left">
              <span className="block text-lg font-bold leading-tight tracking-tight text-slate-900">
                Scheme<span className="text-blue-800">Saathi</span>
              </span>
              <span className="hidden text-xs leading-tight text-slate-600 sm:block">Government scheme guide</span>
            </span>
          </button>

          <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                aria-current={isActive(item.id) ? 'page' : undefined}
                className={`min-h-11 rounded-md px-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 focus-visible:outline-offset-2 ${isActive(item.id)
                  ? 'bg-blue-50 text-blue-900'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-slate-800 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 focus-visible:outline-offset-2 lg:hidden"
          >
            {mobileOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav id="mobile-navigation" aria-label="Main navigation" className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <ul className="mx-auto max-w-7xl space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => selectTab(item.id)}
                  aria-current={isActive(item.id) ? 'page' : undefined}
                  className={`min-h-11 w-full rounded-md px-3 py-2 text-left text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 focus-visible:outline-offset-2 ${isActive(item.id)
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};
