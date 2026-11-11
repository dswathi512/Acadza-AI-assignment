import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import type { BonusFinding } from '../types';
import { fetchBonusFindings, triggerBonusAudit } from '../services/api';

export const BonusAuditPage: React.FC = () => {
  const [findings, setFindings] = useState<BonusFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadFindings = async () => {
    setLoading(true);
    try {
      const data = await fetchBonusFindings();
      setFindings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFindings();
  }, []);

  const handleRunAudit = async () => {
    setRunning(true);
    setMessage(null);
    try {
      const res = await triggerBonusAudit();
      setMessage(res.message);
      await loadFindings();
    } catch (err: any) {
      setMessage(`Error running audit: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bonus: Unreported Question Audit</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              BONUS FEATURE
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Proactive static and mathematical consistency analysis across all 43 JEE/NEET questions, including the 4 questions with zero student reports.
          </p>
        </div>
        <button
          onClick={handleRunAudit}
          disabled={running}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Auditing 43 Questions...' : 'Run Full Repository Audit'}</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs rounded-md">
          {message}
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Repository Scope</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">43 Questions</div>
          <p className="text-[11px] text-slate-500 mt-0.5">39 reported + 4 unreported</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Unreported Questions Audited</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">4 Questions</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Identified without student tickets</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Latent Anomalies Flagged</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{findings.length} Findings</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Saved to output/bonus_findings.json</p>
        </div>
      </div>

      {/* Findings Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Audit Findings & Verification Results</h2>
          </div>
          <span className="text-xs text-slate-500">Isolated from original 44 student reports</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading audit findings...</div>
        ) : findings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No audit findings recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3.5">Question ID</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5">Potential Issue / Check</th>
                  <th className="py-3 px-3.5">Academic Evidence</th>
                  <th className="py-3 px-3.5">Confidence</th>
                  <th className="py-3 px-3.5">Repair</th>
                  <th className="py-3 px-3.5">Route</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {findings.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-3 px-3.5 font-mono font-bold text-indigo-700 whitespace-nowrap">
                      {f.question_id.slice(0, 10)}...
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {f.is_unreported ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          UNREPORTED Q
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          REPORTED Q
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-slate-800 max-w-xs">
                      {f.potential_issue}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 max-w-sm leading-relaxed text-[11px]">
                      {f.evidence}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-slate-700 whitespace-nowrap">
                      {Math.round(f.confidence * 100)}%
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {f.suggested_repair || '—'}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.recommended_route === 'auto_apply'
                          ? 'bg-teal-100 text-teal-800'
                          : f.recommended_route === 'faculty_review'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {f.recommended_route}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
