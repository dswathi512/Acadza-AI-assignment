export interface DashboardMetrics {
  total_reports: number;
  total_questions: number;
  reported_questions: number;
  unreported_questions: number;
  defects_detected: number;
  auto_resolved: number;
  awaiting_faculty_review: number;
  no_change_required: number;
  avg_confidence: number;
  verdict_distribution: Record<string, number>;
  repair_distribution: Record<string, number>;
  route_distribution: Record<string, number>;
  review_status_distribution: Record<string, number>;
  recent_activity: Array<{
    id: number;
    report_id?: string;
    question_id: string;
    action: string;
    notes?: string;
    timestamp: string;
  }>;
}

export interface ReportItem {
  report_id: string;
  question_id: string;
  student_id: string;
  source: string;
  reported_at: string;
  comment: string;
  subject?: string;
  chapter?: string;
  question_type?: string;
  verdict?: string;
  repair?: string;
  route?: string;
  confidence?: number;
  review_status?: string;
  evidence?: string;
  student_reply?: string;
}

export interface ProposedEdit {
  field: string;
  find?: string;
  replace?: string;
}

export interface SiblingReport {
  report_id: string;
  student_id: string;
  source: string;
  reported_at: string;
  comment: string;
}

export interface AuditRecord {
  id: number;
  report_id?: string;
  action: string;
  field_changed?: string;
  previous_value?: string;
  updated_value?: string;
  faculty_action?: string;
  notes?: string;
  timestamp: string;
}

export interface ReportDetail {
  report_id: string;
  question_id: string;
  student_id: string;
  source: string;
  reported_at: string;
  comment: string;
  q_id: string;
  qid?: string;
  question_type: string;
  subject?: string;
  chapter?: string;
  level?: string;
  question_html: string;
  solution_html: string;
  answer: string;
  options: Record<string, string>;
  current_question_html: string;
  current_solution_html: string;
  current_answer: string;
  is_modified: boolean;
  verdict?: string;
  repair?: string;
  edit_field?: string;
  edit_find?: string;
  edit_replace?: string;
  edit?: ProposedEdit;
  route?: string;
  confidence?: number;
  evidence?: string;
  student_reply?: string;
  review_status?: string;
  faculty_notes?: string;
  investigation_details?: any;
  sibling_reports?: SiblingReport[];
  audit_history?: AuditRecord[];
}

export interface BonusFinding {
  id?: number;
  question_id: string;
  is_unreported?: boolean;
  potential_issue: string;
  evidence: string;
  confidence: number;
  suggested_repair?: string;
  recommended_route: string;
}
