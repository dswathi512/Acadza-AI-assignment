import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Edit3, 
  Users, 
  MessageSquare,
  Sparkles,
  FileCode,
  Layers,
  History
} from 'lucide-react';
import type { ReportDetail } from '../types';
import { fetchReportDetail, approveReview, rejectReview, editReview } from '../services/api';
import { SafeMathHtml } from '../components/SafeMathHtml';
import { VerdictBadge, RouteBadge, ReviewStatusBadge } from '../components/Badges';

interface InvestigationPageProps {
  reportId: string;
  onBack: () => void;
  onRefreshParent: () => void;
}

export const InvestigationPage: React.FC<InvestigationPageProps> = ({
  reportId,
  onBack,
  onRefreshParent,
}) => {
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editField, setEditField] = useState('question');
  const [editFind, setEditFind] = useState('');
  const [editReplace, setEditReplace] = useState('');
  const [editNotes, setEditNotes] = useState('Edited and approved by faculty');

  // Reject Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Rejected by faculty: Checked and question is correct');

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await fetchReportDetail(reportId);
      setReport(data);
      if (data.edit) {
        setEditField(data.edit.field || 'question');
        setEditFind(data.edit.find || '');
        setEditReplace(data.edit.replace || '');
      } else if (data.edit_field) {
        setEditField(data.edit_field);
        setEditFind(data.edit_find || '');
        setEditReplace(data.edit_replace || '');
      }
    } catch (err: any) {
      console.error(err);
      setActionMessage({ type: 'error', text: err.message || 'Failed to load report' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const handleApprove = async () => {
    if (!report) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await approveReview(report.report_id, 'Approved by faculty review console');
      setActionMessage({ type: 'success', text: 'Correction successfully approved and applied to active question.' });
      await loadReport();
      onRefreshParent();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Approval failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await rejectReview(report.report_id, rejectReason);
      setIsRejectModalOpen(false);
      setActionMessage({ type: 'success', text: 'Report rejected. Original question preserved unchanged.' });
      await loadReport();
      onRefreshParent();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Rejection failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await editReview(report.report_id, editField, editFind, editReplace, editNotes);
      setIsEditModalOpen(false);
      setActionMessage({ type: 'success', text: 'Custom correction saved and applied to question.' });
      await loadReport();
      onRefreshParent();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Edit submission failed' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 text-sm">
        Loading case investigation details for {reportId}...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-12 text-center text-slate-500 space-y-4">
        <p>Report not found.</p>
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-3 py-1.5 border border-slate-300 rounded text-xs font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to queue</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
            title="Back to queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Case {report.report_id}
              </h1>
              <VerdictBadge verdict={report.verdict} />
              <RouteBadge route={report.route} />
              <ReviewStatusBadge status={report.review_status} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Question ID: {report.question_id} &bull; Type: {report.question_type} &bull; Subject: {report.subject} ({report.chapter})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {report.review_status === 'pending' ? (
            <>
              <button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={actionLoading}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-md text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>

              <button
                onClick={() => setIsEditModalOpen(true)}
                disabled={actionLoading}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 rounded-md text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Correction</span>
              </button>

              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve & Apply</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-slate-500">
                Action decided: <strong className="text-slate-800 uppercase">{report.review_status}</strong>
              </span>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50 text-slate-600"
              >
                Modify Decision
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alert banner if any */}
      {actionMessage && (
        <div
          className={`p-3 rounded-md text-xs font-medium border flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid: Left Column (Student & Investigation) | Right Column (Original Question & Solution) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Student Report */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>Student Ticket #{report.report_id}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{report.reported_at}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
              <p className="text-xs font-semibold text-slate-700 mb-1">Reported Complaint:</p>
              <p className="text-sm text-slate-900 italic font-medium">"{report.comment}"</p>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center space-x-3">
                <span>Student: {report.student_id}</span>
                <span>Source: {report.source}</span>
              </div>
            </div>

            {/* Sibling Reports if question was reported multiple times */}
            {report.sibling_reports && report.sibling_reports.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-800 mb-2">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>Other Reports on This Question ({report.sibling_reports.length})</span>
                </div>
                <div className="space-y-1.5">
                  {report.sibling_reports.map((sib) => (
                    <div key={sib.report_id} className="text-xs bg-amber-50/50 p-2 rounded border border-amber-200">
                      <div className="flex justify-between font-mono text-[10px] text-amber-700">
                        <span>{sib.report_id} ({sib.student_id})</span>
                        <span>{sib.reported_at}</span>
                      </div>
                      <p className="text-slate-800 italic mt-0.5 font-medium">"{sib.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: AI Investigation & Ground Truth Evidence */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Investigation Diagnosis</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] text-slate-500">Confidence:</span>
                <span className="text-xs font-bold text-indigo-700">
                  {report.confidence ? Math.round(report.confidence * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Verdict and Repair details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="block text-[11px] text-slate-500 font-medium">Verdict</span>
                <span className="font-semibold text-slate-900 capitalize">{report.verdict}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="block text-[11px] text-slate-500 font-medium">Repair Type</span>
                <span className="font-semibold text-slate-900">{report.repair || 'None'}</span>
              </div>
            </div>

            {/* Evidence Text */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-900">Academic Evidence & Reason:</span>
              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {report.evidence || 'No evidence string available.'}
              </div>
            </div>

            {/* Proposed Surgical Edit */}
            {report.edit ? (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 flex items-center space-x-1">
                    <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Proposed Surgical Edit</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                    Field: {report.edit.field}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  {report.edit.find && (
                    <div className="bg-rose-50 border border-rose-200 rounded p-2.5 text-rose-900">
                      <span className="block text-[10px] font-bold text-rose-600 uppercase mb-1">Find / Original:</span>
                      <div className="break-all whitespace-pre-wrap">{report.edit.find}</div>
                    </div>
                  )}
                  {report.edit.replace !== undefined && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5 text-emerald-900">
                      <span className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">Replace With / Proposed:</span>
                      <div className="break-all whitespace-pre-wrap">{report.edit.replace || '"" (Removed)'}</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-500 italic">
                No surgical text edit proposed for this case (No change required or Distractor authoring required by faculty).
              </div>
            )}

            {/* Student Reply Preview */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-900">Student Reply Preview:</span>
              <div className="p-3 bg-indigo-50/50 rounded-md border border-indigo-200 text-xs text-indigo-950 leading-relaxed italic">
                "{report.student_reply}"
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Question & Solution Viewer */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">Active Question Content</h2>
              </div>
              <div className="flex items-center space-x-2">
                {report.is_modified && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    MODIFIED BY FACULTY
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                  Level: {report.level || 'MEDIUM'}
                </span>
              </div>
            </div>

            {/* Question Statement */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Question Statement
              </span>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 leading-relaxed overflow-x-auto">
                <SafeMathHtml html={report.current_question_html || report.question_html} />
              </div>
            </div>

            {/* Options display if scq/mcq */}
            {report.options && Object.keys(report.options).length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Extracted Options
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {Object.entries(report.options).map(([optKey, optHtml]) => {
                    const isKeyed = report.current_answer.includes(optKey) || report.answer.includes(optKey);
                    return (
                      <div
                        key={optKey}
                        className={`p-3 rounded-md border ${
                          isKeyed
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold">Option ({optKey})</span>
                          {isKeyed && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-600 text-white rounded">
                              CORRECT KEY
                            </span>
                          )}
                        </div>
                        <SafeMathHtml html={optHtml} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Answer Key */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200">
              <span className="text-xs font-semibold text-slate-700">Official Stored Answer Key:</span>
              <span className="text-sm font-mono font-bold text-indigo-700 px-3 py-1 bg-white border border-indigo-200 rounded">
                {report.current_answer || report.answer}
              </span>
            </div>

            {/* Solution */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Official Solution & Derivation
              </span>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 leading-relaxed overflow-x-auto text-sm">
                <SafeMathHtml html={report.current_solution_html || report.solution_html} />
              </div>
            </div>

            {/* Question Audit Log History if any */}
            {report.audit_history && report.audit_history.length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Question Revision History ({report.audit_history.length})</span>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {report.audit_history.map((h) => (
                    <div key={h.id} className="text-xs bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="flex justify-between font-mono text-[10px] text-slate-500">
                        <span className="font-bold text-slate-800">{h.action}</span>
                        <span>{h.timestamp}</span>
                      </div>
                      <p className="text-slate-700 text-[11px] mt-0.5">{h.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900">Reject Defect Report</h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRejectSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reason for Rejection (Audit Log):
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500">
                The original question and answer key will be preserved completely untouched.
              </p>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Before Approval Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900">Custom Edit & Approval</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Field:</label>
                <select
                  value={editField}
                  onChange={(e) => setEditField(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                >
                  <option value="question">question</option>
                  <option value="solution">solution</option>
                  <option value="answer">answer</option>
                  <option value="questionType">questionType</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Find String (Target):</label>
                <textarea
                  value={editFind}
                  onChange={(e) => setEditFind(e.target.value)}
                  rows={2}
                  placeholder="Exact string to replace in question/solution"
                  className="w-full p-2 border border-slate-300 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Replace With (New Value):</label>
                <textarea
                  value={editReplace}
                  onChange={(e) => setEditReplace(e.target.value)}
                  rows={2}
                  placeholder="Replacement value"
                  className="w-full p-2 border border-slate-300 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Faculty Notes / Justification:</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold"
                >
                  Apply & Approve Edit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
