import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RotateCcw, 
  ChevronRight
} from 'lucide-react';
import type { ReportItem } from '../types';
import { fetchReports } from '../services/api';
import { VerdictBadge, RouteBadge, ReviewStatusBadge } from '../components/Badges';

interface ReportsQueuePageProps {
  initialFilter?: Record<string, any>;
  onSelectReport: (reportId: string) => void;
  title?: string;
  subtitle?: string;
  forceFacultyReviewOnly?: boolean;
}

export const ReportsQueuePage: React.FC<ReportsQueuePageProps> = ({
  initialFilter = {},
  onSelectReport,
  title = "Triage Reports Queue",
  subtitle = "Search, filter, and inspect student defect reports and AI investigation outputs.",
  forceFacultyReviewOnly = false,
}) => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [verdict, setVerdict] = useState<string>(initialFilter.verdict || '');
  const [repair, setRepair] = useState<string>(initialFilter.repair || '');
  const [route, setRoute] = useState<string>(
    forceFacultyReviewOnly ? 'faculty_review' : initialFilter.route || ''
  );
  const [reviewStatus, setReviewStatus] = useState<string>(
    forceFacultyReviewOnly ? 'pending' : initialFilter.review_status || ''
  );
  const [minConfidence, setMinConfidence] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        limit: 100,
        search: search.trim() || undefined,
        verdict: verdict || undefined,
        repair: repair || undefined,
        route: route || undefined,
        review_status: reviewStatus || undefined,
        min_confidence: minConfidence ? parseFloat(minConfidence) : undefined,
      };
      const res = await fetchReports(params);
      setReports(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [verdict, repair, route, reviewStatus, minConfidence]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const resetFilters = () => {
    setSearch('');
    setVerdict('');
    setRepair('');
    if (!forceFacultyReviewOnly) {
      setRoute('');
      setReviewStatus('');
    }
    setMinConfidence('');
  };

  return (
    <div className="space-y-5">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="text-slate-900 font-bold">{reports.length}</span> of {total} reports
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Report ID (R001), Question ID, Student comment, Subject..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="px-3 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Filter Selectors */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Verdict</label>
            <select
              value={verdict}
              onChange={(e) => setVerdict(e.target.value)}
              className="w-full py-1.5 px-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Verdicts</option>
              <option value="defect">defect</option>
              <option value="no_error">no_error</option>
              <option value="display_issue">display_issue</option>
              <option value="app_issue">app_issue</option>
              <option value="language_mode">language_mode</option>
              <option value="not_actionable">not_actionable</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Repair Type</label>
            <select
              value={repair}
              onChange={(e) => setRepair(e.target.value)}
              className="w-full py-1.5 px-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Repairs</option>
              <option value="answer_key">answer_key</option>
              <option value="stem_data">stem_data</option>
              <option value="option_repair">option_repair</option>
              <option value="spelling">spelling</option>
              <option value="exam_reference">exam_reference</option>
              <option value="markup_leak">markup_leak</option>
              <option value="identical_options">identical_options</option>
              <option value="solution_fix">solution_fix</option>
              <option value="wrong_question">wrong_question</option>
              <option value="type_mismatch">type_mismatch</option>
              <option value="wrong_chapter">wrong_chapter</option>
              <option value="diagram">diagram</option>
              <option value="syllabus">syllabus</option>
              <option value="answer_form">answer_form</option>
            </select>
          </div>

          {!forceFacultyReviewOnly && (
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Route</label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full py-1.5 px-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Routes</option>
                <option value="faculty_review">Faculty Review</option>
                <option value="auto_apply">Auto Applied</option>
                <option value="no_change">No Change</option>
              </select>
            </div>
          )}

          {!forceFacultyReviewOnly && (
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Review Status</label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                className="w-full py-1.5 px-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="edited">Edited</option>
                <option value="auto_resolved">Auto Resolved</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Min Confidence</label>
            <select
              value={minConfidence}
              onChange={(e) => setMinConfidence(e.target.value)}
              className="w-full py-1.5 px-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Any Confidence</option>
              <option value="0.95">&ge; 95%</option>
              <option value="0.90">&ge; 90%</option>
              <option value="0.80">&ge; 80%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            Loading triage queue...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No matching reports found with current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3.5">Report ID</th>
                  <th className="py-3 px-3.5">Subject / Chapter</th>
                  <th className="py-3 px-3.5">Student Complaint</th>
                  <th className="py-3 px-3.5">Verdict</th>
                  <th className="py-3 px-3.5">Repair</th>
                  <th className="py-3 px-3.5">Route</th>
                  <th className="py-3 px-3.5">Confidence</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((item) => (
                  <tr
                    key={item.report_id}
                    onClick={() => onSelectReport(item.report_id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    {/* Report ID */}
                    <td className="py-3 px-3.5 font-mono font-bold text-indigo-700 whitespace-nowrap">
                      {item.report_id}
                    </td>

                    {/* Subject / Chapter */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{item.subject || '—'}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{item.chapter || '—'}</div>
                    </td>

                    {/* Student Complaint */}
                    <td className="py-3 px-3.5">
                      <div className="max-w-xs line-clamp-2 text-slate-800 font-medium italic">
                        "{item.comment}"
                      </div>
                    </td>

                    {/* Verdict */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <VerdictBadge verdict={item.verdict} />
                    </td>

                    {/* Repair */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                      {item.repair || '—'}
                    </td>

                    {/* Route */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <RouteBadge route={item.route} />
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {item.confidence !== undefined ? (
                        <div className="flex items-center space-x-1.5">
                          <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full"
                              style={{ width: `${Math.round(item.confidence * 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-slate-600">
                            {Math.round(item.confidence * 100)}%
                          </span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <ReviewStatusBadge status={item.review_status} />
                    </td>

                    {/* Arrow action */}
                    <td className="py-3 px-2 text-right text-slate-400 whitespace-nowrap">
                      <ChevronRight className="w-4 h-4 inline" />
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
