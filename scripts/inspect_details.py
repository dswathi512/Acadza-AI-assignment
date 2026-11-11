import json
from src.data_processor import load_json, extract_options_from_html

def inspect_details():
    questions = load_json('data/questions.json')
    reports = load_json('data/reports.json')
    q_map = {q['_id']: q for q in questions}

    with open('scripts/detailed_inspection.txt', 'w', encoding='utf-8') as out:
        for r in reports:
            qid = r['questionId']
            q = q_map[qid]
            qtype = q['questionType']
            payload = q[qtype]
            out.write(f"=== Report {r['reportId']} | QID: {qid} | Type: {qtype} ===\n")
            out.write(f"Subject: {q.get('subject')} | Chapter: {q.get('chapter')}\n")
            out.write(f"Student: \"{r['comment']}\"\n")
            out.write(f"Answer: {payload.get('answer')}\n")
            out.write(f"Question HTML: {payload.get('question')}\n")
            out.write(f"Solution HTML: {payload.get('solution')}\n")
            out.write("\n" + "="*80 + "\n\n")

    print("Detailed inspection written to scripts/detailed_inspection.txt")

if __name__ == '__main__':
    inspect_details()
