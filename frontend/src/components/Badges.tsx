import React from 'react';

export const VerdictBadge: React.FC<{ verdict?: string }> = ({ verdict }) => {
  if (!verdict) return <span className="text-slate-400 text-xs">—</span>;

  const styles: Record<string, string> = {
    defect: 'bg-rose-50 text-rose-700 border-rose-200',
    no_error: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    display_issue: 'bg-amber-50 text-amber-700 border-amber-200',
    app_issue: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    language_mode: 'bg-purple-50 text-purple-700 border-purple-200',
    already_fixed: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    not_actionable: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const style = styles[verdict] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style}`}>
      {verdict.replace('_', ' ')}
    </span>
  );
};

export const RouteBadge: React.FC<{ route?: string }> = ({ route }) => {
  if (!route) return <span className="text-slate-400 text-xs">—</span>;

  const styles: Record<string, string> = {
    auto_apply: 'bg-teal-50 text-teal-700 border-teal-200',
    faculty_review: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
    no_change: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const style = styles[route] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style}`}>
      {route === 'faculty_review' ? '⚠️ Faculty Review' : route === 'auto_apply' ? '⚡ Auto Applied' : 'No Change'}
    </span>
  );
};

export const ReviewStatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  if (!status) return <span className="text-slate-400 text-xs">—</span>;

  const styles: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-800 border-rose-200',
    edited: 'bg-blue-50 text-blue-800 border-blue-200',
    auto_resolved: 'bg-teal-50 text-teal-800 border-teal-200',
  };

  const style = styles[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border uppercase tracking-wider ${style}`}>
      {status.replace('_', ' ')}
    </span>
  );
};
