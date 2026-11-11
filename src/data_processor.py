"""
Acadza AI Question Quality Assurance System - Data Processor
Normalizes raw questions, groups duplicate reports, validates foreign keys,
and outputs standardized datasets for the AI investigation engine.
"""

import json
import os
import re
from collections import Counter, defaultdict
from typing import Dict, List, Any, Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output")


def load_json(filepath: str) -> Any:
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(data: Any, filepath: str) -> None:
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def extract_options_from_html(html_text: str) -> Dict[str, str]:
    """
    Extracts options (A, B, C, D) from question HTML if present.
    Maintains raw HTML/MathML inside each option.
    """
    if not html_text:
        return {}

    options: Dict[str, str] = {}

    # Look for (A), (B), (C), (D) or Option A, Option B patterns
    # In Acadza questions, options often appear as <h3>(A)...</h3> or <h3>(A) <span>...
    # or (A) ... (B) ... (C) ... (D)
    pattern = r'(?:\(([A-D])\)|(?:Option\s+([A-D])[:.]?))\s*(.*?)(?=(?:\([A-D]\)|Option\s+[A-D][:.]?|$))'
    matches = re.findall(pattern, html_text, flags=re.DOTALL | re.IGNORECASE)

    for m in matches:
        opt_key = (m[0] or m[1]).upper()
        content = m[2].strip()
        # Clean trailing </h3> or <br /> if any
        content = re.sub(r'</h3>\s*$', '', content, flags=re.IGNORECASE)
        content = re.sub(r'<br\s*/?>\s*$', '', content, flags=re.IGNORECASE)
        options[opt_key] = content.strip()

    return options


def normalize_question(raw_q: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalizes a question into a consistent structure while preserving
    100% of the original content and fields.
    """
    qid = raw_q.get("_id") or raw_q.get("id")
    qtype = raw_q.get("questionType", "scq")
    payload = raw_q.get(qtype) or {}

    question_html = payload.get("question", "")
    solution_html = payload.get("solution", "")
    answer = payload.get("answer", "")
    ques_images = payload.get("quesImages", [])
    solution_images = payload.get("solutionImages", [])

    options = extract_options_from_html(question_html)

    return {
        "id": qid,
        "_id": qid,
        "qid": raw_q.get("qid"),
        "questionType": qtype,
        "subject": raw_q.get("subject"),
        "chapter": raw_q.get("chapter"),
        "concept": raw_q.get("concept"),
        "subConcept": raw_q.get("subConcept"),
        "level": raw_q.get("level"),
        "error": raw_q.get("error", 0),
        "updatedAt": raw_q.get("updatedAt"),
        "errorHistory": raw_q.get("errorHistory", []),
        "extracted": {
            "questionHtml": question_html,
            "solutionHtml": solution_html,
            "answer": answer,
            "options": options,
            "quesImages": ques_images,
            "solutionImages": solution_images,
        },
        "raw": raw_q  # Preserve full original object for lossless reproduction
    }


def process_dataset():
    """
    Executes full normalization, report grouping, validation, and summary generation.
    """
    taxonomy_path = os.path.join(DATA_DIR, "taxonomy.json")
    questions_path = os.path.join(DATA_DIR, "questions.json")
    reports_path = os.path.join(DATA_DIR, "reports.json")

    taxonomy = load_json(taxonomy_path)
    questions = load_json(questions_path)
    reports = load_json(reports_path)

    # 1. Normalize Questions
    normalized_questions = [normalize_question(q) for q in questions]
    q_map = {q["id"]: q for q in normalized_questions}

    # 2. Group Reports by questionId
    grouped_reports_dict: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for r in reports:
        grouped_reports_dict[r["questionId"]].append(r)

    grouped_reports = []
    for qid, reps in grouped_reports_dict.items():
        q_norm = q_map.get(qid)
        grouped_reports.append({
            "questionId": qid,
            "reportCount": len(reps),
            "reports": reps,
            "question": q_norm
        })

    # Sort grouped reports descending by report count (urgent first)
    grouped_reports.sort(key=lambda x: x["reportCount"], reverse=True)

    # 3. Processing Summary
    all_qids = set(q_map.keys())
    reported_qids = set(grouped_reports_dict.keys())
    unreported_qids = list(all_qids - reported_qids)

    duplicate_groups = {qid: reps for qid, reps in grouped_reports_dict.items() if len(reps) > 1}

    summary = {
        "totalQuestions": len(questions),
        "totalReports": len(reports),
        "uniqueReportedQuestions": len(reported_qids),
        "unreportedQuestions": len(unreported_qids),
        "unreportedQuestionIds": sorted(unreported_qids),
        "duplicateReportGroupsCount": len(duplicate_groups),
        "duplicateReportDetails": [
            {
                "questionId": qid,
                "reportCount": len(reps),
                "reportIds": [r["reportId"] for r in reps],
                "comments": [r["comment"] for r in reps]
            }
            for qid, reps in duplicate_groups.items()
        ],
        "subjectDistribution": dict(Counter(q.get("subject") for q in questions)),
        "questionTypeDistribution": dict(Counter(q.get("questionType") for q in questions)),
        "levelDistribution": dict(Counter(q.get("level") for q in questions)),
        "reportSourceDistribution": dict(Counter(r.get("source") for r in reports)),
        "taxonomyVerdictsCount": len(taxonomy.get("verdicts", {})),
        "taxonomyRepairsCount": len(taxonomy.get("repairs", {}))
    }

    # 4. Validation Report
    validation_issues = []
    # Check 1: All reports reference existing questions
    missing_q_references = [r for r in reports if r["questionId"] not in q_map]
    if missing_q_references:
        validation_issues.append({
            "severity": "CRITICAL",
            "type": "ORPHAN_REPORT",
            "message": f"Found {len(missing_q_references)} reports referencing non-existent questions",
            "items": missing_q_references
        })

    # Check 2: Unique report IDs
    report_ids = [r["reportId"] for r in reports]
    id_counts = Counter(report_ids)
    duplicate_report_ids = [rid for rid, c in id_counts.items() if c > 1]
    if duplicate_report_ids:
        validation_issues.append({
            "severity": "CRITICAL",
            "type": "DUPLICATE_REPORT_ID",
            "message": f"Found duplicate report IDs: {duplicate_report_ids}",
            "items": duplicate_report_ids
        })

    # Check 3: Check for empty question stems or solutions
    for q in normalized_questions:
        ext = q["extracted"]
        if not ext["questionHtml"]:
            validation_issues.append({
                "severity": "WARNING",
                "type": "EMPTY_QUESTION_STEM",
                "questionId": q["id"]
            })
        if not ext["solutionHtml"]:
            validation_issues.append({
                "severity": "WARNING",
                "type": "EMPTY_SOLUTION",
                "questionId": q["id"]
            })

    validation_report = {
        "status": "PASSED" if not any(i["severity"] == "CRITICAL" for i in validation_issues) else "FAILED",
        "totalChecks": 5,
        "criticalErrors": sum(1 for i in validation_issues if i["severity"] == "CRITICAL"),
        "warnings": sum(1 for i in validation_issues if i["severity"] == "WARNING"),
        "issues": validation_issues,
        "verifiedMetrics": {
            "questionsLoaded": len(normalized_questions),
            "reportsLoaded": len(reports),
            "reportsMappedToQuestions": len(reports) - len(missing_q_references),
            "unreportedQuestionsCount": len(unreported_qids)
        }
    }

    # 5. Save all outputs
    normalized_path = os.path.join(OUTPUT_DIR, "normalized_questions.json")
    grouped_path = os.path.join(OUTPUT_DIR, "grouped_reports.json")
    summary_path = os.path.join(OUTPUT_DIR, "processing_summary.json")
    val_path = os.path.join(OUTPUT_DIR, "validation_report.json")

    save_json(normalized_questions, normalized_path)
    save_json(grouped_reports, grouped_path)
    save_json(summary, summary_path)
    save_json(validation_report, val_path)

    print("Data processing complete:")
    print(f" - Normalized questions: {normalized_path} ({len(normalized_questions)} questions)")
    print(f" - Grouped reports:      {grouped_path} ({len(grouped_reports)} groups)")
    print(f" - Processing summary:   {summary_path}")
    print(f" - Validation report:    {val_path} (Status: {validation_report['status']})")

    return summary, validation_report


if __name__ == "__main__":
    process_dataset()
