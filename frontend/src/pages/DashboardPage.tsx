import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  TrendingUp, 
  FileQuestion, 
  FileText,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import type { DashboardMetrics } from '../types';

interface DashboardPageProps {
  metrics: DashboardMetrics | null;
  onNavigateToReviews: () => void;
  onNavigateToQueue: (filter?: Record<string, any>) => void;
}

const VERDICT_COLORS: Record<string, string> = {
  defect: '#e11d48',
  no_error: '#10b981',
  display_issue: '#f59e0b',
  app_issue: '#6366f1',
  language_mode: '#8b5cf6',
  not_actionable: '#64748b',
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  metrics,
  onNavigateToReviews,
  onNavigateToQueue
}) => {
  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Loading dashboard metrics...
      </div>
    );
  }

  // Prepare chart data
  const verdictData = Object.entries(metrics.verdict_distribution).map(([key, count]) => ({
    name: key.replace('_', ' '),
    rawKey: key,
    count,
  }));

  const repairData = Object.entries(metrics.repair_distribution).map(([key, count]) => ({
    name: key.replace('_', ' '),
    rawKey: key,
    count,
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      {/* Header title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time quality assurance metrics across 43 JEE/NEET questions and 44 student incident reports.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div 
          onClick={() => onNavigateToQueue()}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Reports</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.total_reports}</div>
          <div className="text-[11px] text-slate-400 mt-1">44 student tickets</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Investigated Qs</span>
            <FileQuestion className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.reported_questions}</div>
          <div className="text-[11px] text-slate-400 mt-1">39 unique with reports</div>
        </div>

        <div 
          onClick={() => onNavigateToQueue({ verdict: 'defect' })}
          className="bg-white p-4 rounded-lg border border-rose-200 shadow-sm hover:border-rose-300 transition-all cursor-pointer bg-rose-50/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-700">Genuine Defects</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2">{metrics.defects_detected}</div>
          <div className="text-[11px] text-rose-500/80 mt-1">Confirmed errors</div>
        </div>

        <div 
          onClick={() => onNavigateToQueue({ route: 'auto_apply' })}
          className="bg-white p-4 rounded-lg border border-teal-200 shadow-sm hover:border-teal-300 transition-all cursor-pointer bg-teal-50/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-teal-700">Auto Applied</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-bold text-teal-700 mt-2">{metrics.auto_resolved}</div>
          <div className="text-[11px] text-teal-600/80 mt-1">Low-risk verified edits</div>
        </div>

        <div 
          onClick={onNavigateToReviews}
          className="bg-white p-4 rounded-lg border border-amber-300 shadow-sm hover:border-amber-400 transition-all cursor-pointer bg-amber-50/30"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Faculty Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{metrics.awaiting_faculty_review}</div>
          <div className="text-[11px] text-amber-700/80 mt-1 font-medium">Needs human signoff</div>
        </div>

        <div 
          onClick={() => onNavigateToQueue({ route: 'no_change' })}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">No Change</span>
            <HelpCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{metrics.no_change_required}</div>
          <div className="text-[11px] text-slate-400 mt-1">Student errors / traps</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-indigo-200 shadow-sm bg-indigo-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-700">Avg Confidence</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-700 mt-2">
            {(metrics.avg_confidence * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-indigo-600/80 mt-1">Model certainty</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verdict Distribution */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Verdict Classification Breakdown</h2>
              <p className="text-xs text-slate-500">Distribution across closed taxonomy verdicts</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={verdictData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
                  dataKey="count"
                  label={(entry: any) => `${entry.name || ''}`}
                >
                  {verdictData.map((entry) => (
                    <Cell 
                      key={`cell-${entry.rawKey}`} 
                      fill={VERDICT_COLORS[entry.rawKey] || '#94a3b8'} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Repair Category Distribution */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Defect Repair Types Distribution</h2>
              <p className="text-xs text-slate-500">Surgical repairs categorized by taxonomy rules</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repairData} layout="vertical" margin={{ left: 35, right: 20 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity and Urgent Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Action Callout */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-lg shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-amber-800 font-semibold text-sm">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Pending Faculty Action</span>
            </div>
            <p className="text-xs text-amber-900/80 mt-2 leading-relaxed">
              There are <strong className="text-amber-950 font-bold">{metrics.awaiting_faculty_review} cases</strong> waiting for faculty decision, including high-stakes answer key revisions, authoring of distractors, and missing diagrams.
            </p>
          </div>
          <button
            onClick={onNavigateToReviews}
            className="mt-4 inline-flex items-center justify-between px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <span>Review Pending Queue ({metrics.awaiting_faculty_review})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Recent Audit Log Feed */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Recent Faculty & System Activity</h2>
          <div className="divide-y divide-slate-100">
            {metrics.recent_activity.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No recent faculty activities recorded.</p>
            ) : (
              metrics.recent_activity.map((act) => (
                <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 rounded font-mono font-medium text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                      {act.action}
                    </span>
                    <span className="text-slate-600 font-medium">
                      Report: <strong className="text-slate-900">{act.report_id || '—'}</strong>
                    </span>
                    <span className="text-slate-500 truncate max-w-xs">{act.notes || 'Action recorded'}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{act.timestamp.split('T')[0]}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
