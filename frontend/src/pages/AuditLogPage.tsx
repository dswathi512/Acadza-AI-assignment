import React, { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import type { AuditRecord } from '../types';
import { fetchAuditLogs } from '../services/api';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (actionFilter && log.action !== actionFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const inRep = log.report_id?.toLowerCase().includes(q);
      const inQ = (log as any).question_id?.toLowerCase().includes(q);
      const inNotes = log.notes?.toLowerCase().includes(q);
      return inRep || inQ || inNotes;
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'FACULTY_APPROVED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">APPROVED</span>;
      case 'FACULTY_REJECTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">REJECTED</span>;
      case 'FACULTY_EDITED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">EDITED</span>;
      case 'AUTO_APPLY':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">AUTO APPLIED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">{action}</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Log & Compliance Trail</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Cryptographically sound, immutable record of every automatic edit and faculty decision.
          </p>
        </div>
        <button
          onClick={loadLogs}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by Report ID, Question ID, or Notes..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="w-full md:w-56">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full py-2 px-3 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Action Types</option>
            <option value="FACULTY_APPROVED">Faculty Approved</option>
            <option value="FACULTY_REJECTED">Faculty Rejected</option>
            <option value="FACULTY_EDITED">Faculty Edited</option>
            <option value="AUTO_APPLY">Auto Applied</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading audit trail...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No audit entries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3.5">ID</th>
                  <th className="py-3 px-3.5">Report / Question</th>
                  <th className="py-3 px-3.5">Action</th>
                  <th className="py-3 px-3.5">Field Changed</th>
                  <th className="py-3 px-3.5">Details / Notes</th>
                  <th className="py-3 px-3.5">Previous Value</th>
                  <th className="py-3 px-3.5">Updated Value</th>
                  <th className="py-3 px-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3.5 text-slate-400">#{log.id}</td>
                    <td className="py-3 px-3.5 font-sans">
                      <div className="font-bold text-indigo-700">{log.report_id || '—'}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-[120px]">
                        {(log as any).question_id}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">{getActionBadge(log.action)}</td>
                    <td className="py-3 px-3.5 text-slate-700">{log.field_changed || '—'}</td>
                    <td className="py-3 px-3.5 font-sans text-slate-800 max-w-xs">{log.notes || '—'}</td>
                    <td className="py-3 px-3.5 text-rose-700 max-w-xs truncate" title={log.previous_value || ''}>
                      {log.previous_value ? log.previous_value.slice(0, 40) + '...' : '—'}
                    </td>
                    <td className="py-3 px-3.5 text-emerald-700 max-w-xs truncate" title={log.updated_value || ''}>
                      {log.updated_value ? log.updated_value.slice(0, 40) + '...' : '—'}
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                      {log.timestamp}
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
