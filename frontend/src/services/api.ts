import type { DashboardMetrics, ReportItem, ReportDetail, AuditRecord, BonusFinding } from '../types';

const BASE_URL = '/api';

export async function fetchHealth(): Promise<{ status: string; mode: string; llm_live: boolean }> {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchDashboard(): Promise<DashboardMetrics> {
  const res = await fetch(`${BASE_URL}/dashboard`);
  if (!res.ok) throw new Error('Failed to load dashboard metrics');
  return res.json();
}

export async function fetchReports(params: Record<string, any> = {}): Promise<{ total: number; items: ReportItem[] }> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      query.append(k, String(v));
    }
  });

  const res = await fetch(`${BASE_URL}/reports?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function fetchReportDetail(reportId: string): Promise<ReportDetail> {
  const res = await fetch(`${BASE_URL}/reports/${reportId}`);
  if (!res.ok) throw new Error(`Failed to load report ${reportId}`);
  return res.json();
}

export async function approveReview(reportId: string, notes: string = 'Approved by faculty'): Promise<any> {
  const res = await fetch(`${BASE_URL}/reviews/${reportId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Approval failed');
  }
  return res.json();
}

export async function rejectReview(reportId: string, reason: string = 'Rejected by faculty'): Promise<any> {
  const res = await fetch(`${BASE_URL}/reviews/${reportId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Rejection failed');
  }
  return res.json();
}

export async function editReview(
  reportId: string,
  field: string,
  findStr?: string,
  replaceStr?: string,
  notes: string = 'Edited and approved by faculty'
): Promise<any> {
  const res = await fetch(`${BASE_URL}/reviews/${reportId}/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      field,
      find: findStr || null,
      replace: replaceStr || null,
      notes,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Edit submission failed');
  }
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditRecord[]> {
  const res = await fetch(`${BASE_URL}/audit?limit=100`);
  if (!res.ok) throw new Error('Failed to load audit logs');
  return res.json();
}

export async function fetchBonusFindings(): Promise<BonusFinding[]> {
  const res = await fetch(`${BASE_URL}/bonus-audit`);
  if (!res.ok) throw new Error('Failed to load bonus audit findings');
  return res.json();
}

export async function triggerTriage(): Promise<any> {
  const res = await fetch(`${BASE_URL}/triage/run`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to run triage');
  return res.json();
}

export async function triggerBonusAudit(): Promise<any> {
  const res = await fetch(`${BASE_URL}/bonus-audit/run`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to run bonus audit');
  return res.json();
}
