"""
Database service handling queries, updates, transactions, and audit records.
"""

import json
from typing import Dict, Any, List, Optional
from backend.database import get_db, get_db_connection


def get_dashboard_metrics() -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()

        # Total counts
        cursor.execute("SELECT COUNT(*) FROM reports;")
        total_reports = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM questions;")
        total_questions = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(DISTINCT question_id) FROM reports;")
        reported_questions = cursor.fetchone()[0]

        # Triage metrics
        cursor.execute("SELECT COUNT(*) FROM triage_results WHERE verdict = 'defect';")
        defects_detected = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM triage_results WHERE route = 'auto_apply' OR review_status = 'approved';")
        auto_resolved = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM triage_results WHERE route = 'faculty_review' AND review_status = 'pending';")
        awaiting_faculty_review = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM triage_results WHERE route = 'no_change';")
        no_change_required = cursor.fetchone()[0]

        cursor.execute("SELECT AVG(confidence) FROM triage_results;")
        avg_conf_row = cursor.fetchone()[0]
        avg_confidence = round(float(avg_conf_row), 3) if avg_conf_row is not None else 0.0

        # Distributions
        cursor.execute("SELECT verdict, COUNT(*) FROM triage_results GROUP BY verdict;")
        verdict_distribution = {row[0]: row[1] for row in cursor.fetchall()}

        cursor.execute("SELECT repair, COUNT(*) FROM triage_results WHERE repair IS NOT NULL GROUP BY repair;")
        repair_distribution = {row[0]: row[1] for row in cursor.fetchall()}

        cursor.execute("SELECT route, COUNT(*) FROM triage_results GROUP BY route;")
        route_distribution = {row[0]: row[1] for row in cursor.fetchall()}

        cursor.execute("SELECT review_status, COUNT(*) FROM triage_results GROUP BY review_status;")
        review_status_distribution = {row[0]: row[1] for row in cursor.fetchall()}

        # Recent activities (last 5 audit entries)
        cursor.execute("""
            SELECT id, report_id, question_id, action, notes, timestamp
            FROM audit_logs
            ORDER BY timestamp DESC, id DESC LIMIT 6;
        """)
        recent_activity = [dict(row) for row in cursor.fetchall()]

        return {
            "total_reports": total_reports,
            "total_questions": total_questions,
            "reported_questions": reported_questions,
            "unreported_questions": total_questions - reported_questions,
            "defects_detected": defects_detected,
            "auto_resolved": auto_resolved,
            "awaiting_faculty_review": awaiting_faculty_review,
            "no_change_required": no_change_required,
            "avg_confidence": avg_confidence,
            "verdict_distribution": verdict_distribution,
            "repair_distribution": repair_distribution,
            "route_distribution": route_distribution,
            "review_status_distribution": review_status_distribution,
            "recent_activity": recent_activity
        }


def get_reports_list(
    verdict: Optional[str] = None,
    repair: Optional[str] = None,
    route: Optional[str] = None,
    review_status: Optional[str] = None,
    min_confidence: Optional[float] = None,
    max_confidence: Optional[float] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()

        query = """
            SELECT 
                r.report_id,
                r.question_id,
                r.student_id,
                r.source,
                r.reported_at,
                r.comment,
                q.subject,
                q.chapter,
                q.question_type,
                t.verdict,
                t.repair,
                t.route,
                t.confidence,
                t.review_status,
                t.evidence,
                t.student_reply
            FROM reports r
            LEFT JOIN questions q ON r.question_id = q.id
            LEFT JOIN triage_results t ON r.report_id = t.report_id
            WHERE 1=1
        """
        params = []

        if verdict:
            query += " AND t.verdict = ?"
            params.append(verdict)
        if repair:
            query += " AND t.repair = ?"
            params.append(repair)
        if route:
            query += " AND t.route = ?"
            params.append(route)
        if review_status:
            query += " AND t.review_status = ?"
            params.append(review_status)
        if min_confidence is not None:
            query += " AND t.confidence >= ?"
            params.append(min_confidence)
        if max_confidence is not None:
            query += " AND t.confidence <= ?"
            params.append(max_confidence)
        if search:
            search_param = f"%{search}%"
            query += " AND (r.report_id LIKE ? OR r.question_id LIKE ? OR r.comment LIKE ? OR q.subject LIKE ? OR q.chapter LIKE ?)"
            params.extend([search_param, search_param, search_param, search_param, search_param])

        # Count total
        count_query = f"SELECT COUNT(*) FROM ({query}) as cnt_tbl"
        cursor.execute(count_query, params)
        total_count = cursor.fetchone()[0]

        # Order and paginate
        query += " ORDER BY r.report_id ASC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor.execute(query, params)
        rows = [dict(row) for row in cursor.fetchall()]

        return {
            "total": total_count,
            "items": rows
        }


def get_report_detail(report_id: str) -> Optional[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                r.report_id, r.question_id, r.student_id, r.source, r.reported_at, r.comment,
                q.id as q_id, q.qid, q.question_type, q.subject, q.chapter, q.level,
                q.question_html, q.solution_html, q.answer, q.options_json,
                q.current_question_html, q.current_solution_html, q.current_answer, q.is_modified,
                t.verdict, t.repair, t.edit_field, t.edit_find, t.edit_replace, t.edit_raw_json,
                t.route, t.confidence, t.evidence, t.student_reply, t.review_status, t.faculty_notes,
                t.investigation_details_json
            FROM reports r
            JOIN questions q ON r.question_id = q.id
            LEFT JOIN triage_results t ON r.report_id = t.report_id
            WHERE r.report_id = ?
        """, (report_id,))

        row = cursor.fetchone()
        if not row:
            return None

        data = dict(row)

        # Parse JSON fields
        try:
            data["options"] = json.loads(data["options_json"]) if data.get("options_json") else {}
        except Exception:
            data["options"] = {}

        try:
            data["edit"] = json.loads(data["edit_raw_json"]) if data.get("edit_raw_json") else None
        except Exception:
            data["edit"] = None

        try:
            data["investigation_details"] = json.loads(data["investigation_details_json"]) if data.get("investigation_details_json") else {}
        except Exception:
            data["investigation_details"] = {}

        # Fetch sibling duplicate reports for the same question
        cursor.execute("""
            SELECT report_id, student_id, source, reported_at, comment
            FROM reports
            WHERE question_id = ? AND report_id != ?
            ORDER BY reported_at ASC
        """, (data["question_id"], report_id))
        data["sibling_reports"] = [dict(r) for r in cursor.fetchall()]

        # Fetch question audit history
        cursor.execute("""
            SELECT id, report_id, action, field_changed, previous_value, updated_value, faculty_action, notes, timestamp
            FROM audit_logs
            WHERE question_id = ?
            ORDER BY timestamp DESC
        """, (data["question_id"],))
        data["audit_history"] = [dict(r) for r in cursor.fetchall()]

        return data


def get_question_detail(question_id: str) -> Optional[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM questions WHERE id = ?", (question_id,))
        row = cursor.fetchone()
        if not row:
            return None

        data = dict(row)
        try:
            data["options"] = json.loads(data["options_json"]) if data.get("options_json") else {}
        except Exception:
            data["options"] = {}

        try:
            data["ques_images"] = json.loads(data["ques_images_json"]) if data.get("ques_images_json") else []
        except Exception:
            data["ques_images"] = []

        try:
            data["solution_images"] = json.loads(data["solution_images_json"]) if data.get("solution_images_json") else []
        except Exception:
            data["solution_images"] = []

        # Get reports for this question
        cursor.execute("SELECT report_id, student_id, source, reported_at, comment FROM reports WHERE question_id = ?", (question_id,))
        data["reports"] = [dict(r) for r in cursor.fetchall()]
        data["reports_count"] = len(data["reports"])

        return data


def save_triage_result(item: Dict[str, Any]) -> None:
    """
    Saves or updates a triage result record.
    Never overwrites a faculty-approved review!
    """
    with get_db() as conn:
        cursor = conn.cursor()

        report_id = item["reportId"]
        question_id = item["questionId"]
        verdict = item["verdict"]
        repair = item.get("repair")
        route = item["route"]
        confidence = float(item["confidence"])
        evidence = item["evidence"]
        student_reply = item["student_reply"]

        edit = item.get("edit")
        edit_field = edit.get("field") if isinstance(edit, dict) else None
        edit_find = edit.get("find") if isinstance(edit, dict) else None
        edit_replace = edit.get("replace") if isinstance(edit, dict) else None
        edit_raw_json = json.dumps(edit) if edit else None

        inv_details = json.dumps(item.get("investigation_details", {}))

        # Check existing review status
        cursor.execute("SELECT review_status FROM triage_results WHERE report_id = ?", (report_id,))
        existing = cursor.fetchone()

        if existing and existing["review_status"] in ("approved", "edited", "rejected"):
            # Preserve human decision!
            cursor.execute("""
                UPDATE triage_results
                SET confidence = ?, evidence = ?, student_reply = ?, investigation_details_json = ?, updated_at = CURRENT_TIMESTAMP
                WHERE report_id = ?
            """, (confidence, evidence, student_reply, inv_details, report_id))
            return

        initial_status = "auto_resolved" if route == "auto_apply" else "pending"

        cursor.execute("""
            INSERT INTO triage_results (
                report_id, question_id, verdict, repair, edit_field, edit_find, edit_replace,
                edit_raw_json, route, confidence, evidence, student_reply, review_status,
                investigation_details_json, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(report_id) DO UPDATE SET
                verdict = excluded.verdict,
                repair = excluded.repair,
                edit_field = excluded.edit_field,
                edit_find = excluded.edit_find,
                edit_replace = excluded.edit_replace,
                edit_raw_json = excluded.edit_raw_json,
                route = excluded.route,
                confidence = excluded.confidence,
                evidence = excluded.evidence,
                student_reply = excluded.student_reply,
                investigation_details_json = excluded.investigation_details_json,
                review_status = excluded.review_status,
                updated_at = CURRENT_TIMESTAMP
        """, (
            report_id, question_id, verdict, repair, edit_field, edit_find, edit_replace,
            edit_raw_json, route, confidence, evidence, student_reply, initial_status, inv_details
        ))

        # If auto_apply, automatically execute the edit on the question and write audit
        if route == "auto_apply" and edit_field and edit_find:
            apply_edit_to_question(conn, report_id, question_id, edit_field, edit_find, edit_replace, "AUTO_APPLY", "Auto-applied by AI triage system")


def apply_edit_to_question(
    conn: Any,
    report_id: Optional[str],
    question_id: str,
    field: str,
    find_str: Optional[str],
    replace_str: Optional[str],
    action_type: str,
    notes: Optional[str]
) -> bool:
    """
    Surgically applies an approved or auto-applied edit to the question record.
    Preserves original HTML and answers; only modifies current_* columns.
    """
    cursor = conn.cursor()
    cursor.execute("SELECT current_question_html, current_solution_html, current_answer FROM questions WHERE id = ?", (question_id,))
    q_row = cursor.fetchone()
    if not q_row:
        return False

    curr_q = q_row["current_question_html"]
    curr_sol = q_row["current_solution_html"]
    curr_ans = q_row["current_answer"]

    prev_val = ""
    new_val = ""

    if field == "question":
        prev_val = curr_q
        if find_str and find_str in curr_q:
            new_val = curr_q.replace(find_str, replace_str or "", 1)
        elif not find_str and replace_str:
            new_val = replace_str
        else:
            new_val = curr_q
        cursor.execute("UPDATE questions SET current_question_html = ?, is_modified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (new_val, question_id))

    elif field == "solution":
        prev_val = curr_sol
        if find_str and find_str in curr_sol:
            new_val = curr_sol.replace(find_str, replace_str or "", 1)
        elif not find_str and replace_str:
            new_val = replace_str
        else:
            new_val = curr_sol
        cursor.execute("UPDATE questions SET current_solution_html = ?, is_modified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (new_val, question_id))

    elif field == "answer":
        prev_val = curr_ans
        new_val = replace_str or curr_ans
        cursor.execute("UPDATE questions SET current_answer = ?, is_modified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (new_val, question_id))

    # Log to audit_logs
    cursor.execute("""
        INSERT INTO audit_logs (report_id, question_id, action, field_changed, previous_value, updated_value, faculty_action, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (report_id, question_id, action_type, field, prev_val[:500], new_val[:500], action_type, notes))

    return True


def faculty_approve_case(report_id: str, notes: str = "Approved by faculty") -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT question_id, edit_field, edit_find, edit_replace, review_status
            FROM triage_results WHERE report_id = ?
        """, (report_id,))
        row = cursor.fetchone()
        if not row:
            return {"success": False, "message": f"Report {report_id} not found"}

        qid = row["question_id"]
        field = row["edit_field"]
        find_str = row["edit_find"]
        replace_str = row["edit_replace"]

        # Apply edit if an edit was proposed
        if field and (find_str or replace_str):
            apply_edit_to_question(conn, report_id, qid, field, find_str, replace_str, "FACULTY_APPROVED", notes)

        cursor.execute("""
            UPDATE triage_results
            SET review_status = 'approved', faculty_notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE report_id = ?
        """, (notes, report_id))

        cursor.execute("""
            INSERT INTO audit_logs (report_id, question_id, action, faculty_action, notes)
            VALUES (?, ?, 'FACULTY_APPROVED', 'Approved', ?)
        """, (report_id, qid, notes))

        return {"success": True, "report_id": report_id, "question_id": qid, "status": "approved", "message": "Correction approved and applied."}


def faculty_reject_case(report_id: str, reason: str = "Rejected by faculty") -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT question_id FROM triage_results WHERE report_id = ?", (report_id,))
        row = cursor.fetchone()
        if not row:
            return {"success": False, "message": f"Report {report_id} not found"}

        qid = row["question_id"]

        cursor.execute("""
            UPDATE triage_results
            SET review_status = 'rejected', faculty_notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE report_id = ?
        """, (reason, report_id))

        cursor.execute("""
            INSERT INTO audit_logs (report_id, question_id, action, faculty_action, notes)
            VALUES (?, ?, 'FACULTY_REJECTED', 'Rejected', ?)
        """, (report_id, qid, reason))

        return {"success": True, "report_id": report_id, "question_id": qid, "status": "rejected", "message": "Correction rejected. Original question preserved."}


def faculty_edit_and_approve_case(
    report_id: str,
    field: str,
    find_str: Optional[str],
    replace_str: Optional[str],
    notes: str = "Edited and approved by faculty"
) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT question_id FROM triage_results WHERE report_id = ?", (report_id,))
        row = cursor.fetchone()
        if not row:
            return {"success": False, "message": f"Report {report_id} not found"}

        qid = row["question_id"]

        # Apply custom faculty edit
        apply_edit_to_question(conn, report_id, qid, field, find_str, replace_str, "FACULTY_EDITED", notes)

        new_edit_json = json.dumps({"field": field, "find": find_str, "replace": replace_str})
        cursor.execute("""
            UPDATE triage_results
            SET review_status = 'edited', edit_field = ?, edit_find = ?, edit_replace = ?,
                edit_raw_json = ?, faculty_notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE report_id = ?
        """, (field, find_str, replace_str, new_edit_json, notes, report_id))

        return {"success": True, "report_id": report_id, "question_id": qid, "status": "edited", "message": "Custom edit saved and applied."}


def get_audit_logs(limit: int = 100) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, report_id, question_id, action, field_changed, previous_value,
                   updated_value, faculty_action, notes, timestamp
            FROM audit_logs
            ORDER BY timestamp DESC, id DESC
            LIMIT ?
        """, (limit,))
        return [dict(r) for r in cursor.fetchall()]
