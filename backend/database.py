"""
Database initialization and connection management using SQLite.
"""

import json
import sqlite3
import os
from contextlib import contextmanager
from typing import Generator, Dict, Any, List, Optional
from backend.config import settings


def get_db_connection() -> sqlite3.Connection:
    """Creates a connection to the SQLite database with row factory enabled."""
    conn = sqlite3.connect(settings.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    """Context manager for safe transactional database sessions."""
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """Initializes database schema if tables do not exist."""
    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Questions table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS questions (
            id TEXT PRIMARY KEY,
            qid TEXT,
            question_type TEXT NOT NULL,
            subject TEXT,
            chapter TEXT,
            concept TEXT,
            sub_concept TEXT,
            level TEXT,
            question_html TEXT NOT NULL,
            solution_html TEXT NOT NULL,
            answer TEXT NOT NULL,
            options_json TEXT NOT NULL DEFAULT '{}',
            ques_images_json TEXT NOT NULL DEFAULT '[]',
            solution_images_json TEXT NOT NULL DEFAULT '[]',
            raw_json TEXT NOT NULL,
            current_question_html TEXT NOT NULL,
            current_solution_html TEXT NOT NULL,
            current_answer TEXT NOT NULL,
            is_modified INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 2. Reports table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            report_id TEXT PRIMARY KEY,
            question_id TEXT NOT NULL,
            student_id TEXT NOT NULL,
            source TEXT NOT NULL,
            reported_at TEXT NOT NULL,
            comment TEXT NOT NULL,
            FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
        );
        """)

        # 3. Triage Results table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS triage_results (
            report_id TEXT PRIMARY KEY,
            question_id TEXT NOT NULL,
            verdict TEXT NOT NULL,
            repair TEXT,
            edit_field TEXT,
            edit_find TEXT,
            edit_replace TEXT,
            edit_raw_json TEXT,
            route TEXT NOT NULL,
            confidence REAL NOT NULL,
            evidence TEXT NOT NULL,
            student_reply TEXT NOT NULL,
            review_status TEXT NOT NULL DEFAULT 'pending',
            faculty_notes TEXT,
            investigation_details_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (report_id) REFERENCES reports (report_id) ON DELETE CASCADE,
            FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
        );
        """)

        # 4. Audit Logs table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_id TEXT,
            question_id TEXT NOT NULL,
            action TEXT NOT NULL,
            field_changed TEXT,
            previous_value TEXT,
            updated_value TEXT,
            faculty_action TEXT,
            notes TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
        );
        """)

        # 5. Bonus Findings table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS bonus_findings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id TEXT NOT NULL,
            potential_issue TEXT NOT NULL,
            evidence TEXT NOT NULL,
            confidence REAL NOT NULL,
            suggested_repair TEXT,
            recommended_route TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
        );
        """)

        # Indices for performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_reports_question_id ON reports(question_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_triage_question_id ON triage_results(question_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_triage_review_status ON triage_results(review_status);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_triage_route ON triage_results(route);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_question_id ON audit_logs(question_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_report_id ON audit_logs(report_id);")


def seed_db_from_json():
    """
    Seeds database from questions.json and reports.json if not already populated.
    Safe to re-run: preserves any faculty-approved edits or existing reviews.
    """
    init_db()

    questions_file = os.path.join(settings.DATA_DIR, "questions.json")
    reports_file = os.path.join(settings.DATA_DIR, "reports.json")

    if not os.path.exists(questions_file) or not os.path.exists(reports_file):
        print(f"Warning: Seed files not found in {settings.DATA_DIR}")
        return

    with open(questions_file, "r", encoding="utf-8") as f:
        questions_data = json.load(f)

    with open(reports_file, "r", encoding="utf-8") as f:
        reports_data = json.load(f)

    from src.data_processor import normalize_question

    with get_db() as conn:
        cursor = conn.cursor()

        # Seed Questions
        for q in questions_data:
            norm = normalize_question(q)
            qid = norm["id"]
            ext = norm["extracted"]

            # Only insert if not exists to avoid overwriting modified questions
            cursor.execute("SELECT id FROM questions WHERE id = ?", (qid,))
            existing = cursor.fetchone()

            answer_val = ext["answer"]
            if isinstance(answer_val, (list, dict)):
                answer_str = json.dumps(answer_val)
            else:
                answer_str = str(answer_val)

            if not existing:
                cursor.execute("""
                INSERT INTO questions (
                    id, qid, question_type, subject, chapter, concept, sub_concept, level,
                    question_html, solution_html, answer, options_json, ques_images_json,
                    solution_images_json, raw_json, current_question_html, current_solution_html,
                    current_answer, is_modified
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                """, (
                    qid,
                    norm["qid"],
                    norm["questionType"],
                    norm["subject"],
                    norm["chapter"],
                    norm["concept"],
                    norm["subConcept"],
                    norm["level"],
                    ext["questionHtml"],
                    ext["solutionHtml"],
                    answer_str,
                    json.dumps(ext["options"]),
                    json.dumps(ext["quesImages"]),
                    json.dumps(ext["solutionImages"]),
                    json.dumps(norm["raw"]),
                    ext["questionHtml"],
                    ext["solutionHtml"],
                    answer_str
                ))

        # Seed Reports
        for r in reports_data:
            cursor.execute("SELECT report_id FROM reports WHERE report_id = ?", (r["reportId"],))
            if not cursor.fetchone():
                cursor.execute("""
                INSERT INTO reports (
                    report_id, question_id, student_id, source, reported_at, comment
                ) VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    r["reportId"],
                    r["questionId"],
                    r["studentId"],
                    r["source"],
                    r["reportedAt"],
                    r["comment"]
                ))

        print(f"Database seeded successfully. {len(questions_data)} questions, {len(reports_data)} reports.")


if __name__ == "__main__":
    seed_db_from_json()
