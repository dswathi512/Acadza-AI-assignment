import json
import re

def clean_text(h):
    if not h: return ""
    h = re.sub(r'<math.*?</math>', '[MATH]', h, flags=re.DOTALL)
    h = re.sub(r'<[^>]+>', ' ', h)
    return ' '.join(h.split())

with open('data/reports.json', 'r', encoding='utf-8') as f:
    reports = json.load(f)
with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

q_map = {q['_id']: q for q in questions}

for r in reports:
    qid = r['questionId']
    q = q_map[qid]
    qtype = q['questionType']
    payload = q[qtype]
    print(f"REPORT {r['reportId']} | QID: {qid} | Type: {qtype} | Ans: {payload.get('answer')}")
    print(f"  Comment: {r['comment']}")
    print(f"  Q Text:  {clean_text(payload.get('question'))[:120]}")
    print(f"  Sol:     {clean_text(payload.get('solution'))[:120]}")
    print("-" * 60)
