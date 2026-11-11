"""
Script to comprehensively inspect all 44 student reports,
cross-reference with questions, options, solutions, and determine the exact academic facts.
"""

import json
import re

def main():
    with open('data/reports.json', 'r', encoding='utf-8') as f:
        reports = json.load(f)
    with open('data/questions.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)
    with open('data/taxonomy.json', 'r', encoding='utf-8') as f:
        taxonomy = json.load(f)

    q_map = {q['_id']: q for q in questions}

    print(f"Total reports: {len(reports)}")
    for r in reports:
        qid = r['questionId']
        q = q_map[qid]
        qtype = q['questionType']
        payload = q[qtype]
        q_html = payload.get('question', '')
        sol_html = payload.get('solution', '')
        ans = payload.get('answer', '')

        # Quick diagnosis heuristics
        comment = r['comment']
        comment_lower = comment.lower()

        notes = []
        if "ignore all previous instructions" in comment_lower:
            notes.append("PROMPT INJECTION TRAP")
        if "asdfgh" in comment_lower or comment == "wrong":
            notes.append("VAGUE / GIBBERISH (not_actionable)")
        if "hindi" in comment_lower:
            notes.append("LANGUAGE MODE REQUEST")
        if "phone screen" in comment_lower or "takes forever to load" in comment_lower:
            notes.append("DISPLAY ISSUE")
        if "clicked a but it saved b" in comment_lower:
            notes.append("APP ISSUE")
        if "neet 2019" in comment_lower and "(NEET 2019)" in q_html:
            notes.append("EXAM REFERENCE IN QUESTION")
        if r"\frac" in q_html:
            notes.append("MARKUP LEAK (\frac in question text)")
        if "out of syllabus" in comment_lower:
            notes.append("SYLLABUS REPORT")
        if "chapter is wrong" in comment_lower or "neural control" in comment_lower:
            notes.append("WRONG CHAPTER")
        if "figure not given" in comment_lower:
            notes.append("DIAGRAM MISSING")
        if "option d is missing" in comment_lower or "3 options showing" in comment_lower or "option c blank" in comment_lower:
            notes.append("OPTION REPAIR")
        if "two options are same" in comment_lower:
            notes.append("IDENTICAL OPTIONS")
        if "solution is of some other question" in comment_lower or "solution me 5.47" in comment_lower:
            notes.append("WRONG QUESTION / SOLUTION MISMATCH")
        if "multiple correct type" in comment_lower or (qtype == "mcq" and "only b is correct" in comment_lower):
            notes.append("TYPE MISMATCH")
        if "unit not mentioned" in comment_lower:
            notes.append("ANSWER FORM (unit missing)")
        if "spelling" in comment_lower:
            notes.append("SPELLING TYPO")

        print(f"[{r['reportId']}] QID: {qid[:8]} | Student: \"{comment}\" | Notes: {notes}")

if __name__ == '__main__':
    main()
