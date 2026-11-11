import React from 'react';
import { 
  LayoutDashboard, 
  ListFilter, 
  ShieldAlert, 
  History, 
  Sparkles, 
  RefreshCw,
  GraduationCap
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  pendingCount?: number;
  onRefreshTriage: () => void;
  isTriageLoading: boolean;
  engineMode?: string;
  isLiveLLM?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  pendingCount = 0,
  onRefreshTriage,
  isTriageLoading,
  engineMode = "Offline Deterministic Mode",
  isLiveLLM = false
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'queue', label: 'Reports Queue', icon: ListFilter },
    { 
      id: 'reviews', 
      label: 'Faculty Reviews', 
      icon: ShieldAlert, 
      badge: pendingCount > 0 ? pendingCount : undefined 
    },
    { id: 'audit', label: 'Audit Log', icon: History },
    { id: 'bonus', label: 'Bonus Audit', icon: Sparkles },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-slate-900 tracking-tight">Acadza AI</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                  QA System
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">JEE & NEET Question Quality Engine</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="ml-1.5 px-1.5 py-0.2 text-xs font-bold rounded-full bg-amber-500 text-white">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Engine Status & Action Button */}
          <div className="flex items-center space-x-3">
            {/* Engine Status Pill */}
            <div
              className={`hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isLiveLLM
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
              title={
                isLiveLLM
                  ? 'Live Gemini 2.5 Flash API active'
                  : 'Running in offline mode using verified deterministic academic rules. Add GEMINI_API_KEY in .env to switch to live LLM.'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLiveLLM ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="font-mono text-[11px]">{engineMode}</span>
            </div>

            <button
              onClick={onRefreshTriage}
              disabled={isTriageLoading}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 shadow-sm"
              title="Re-run AI triage on all reports"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isTriageLoading ? 'animate-spin' : ''}`} />
              <span>{isTriageLoading ? 'Triaging...' : 'Re-run Triage'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
