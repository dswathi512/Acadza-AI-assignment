import json

with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = {q['_id']: q for q in json.load(f)}

unreported = [
    '68dea87d387eea3d0d95fbe3',
    '695ede2a88d7701e561aa9d9',
    '68dea657387eea3d0d95f54a',
    '68dea6e6387eea3d0d95f6f8'
]

for qid in unreported:
    q = questions[qid]
    qtype = q['questionType']
    payload = q[qtype]
    print(f"=== UNREPORTED QID: {qid} ({q.get('subject')}, {q.get('chapter')}, {qtype}) ===")
    print("Q:", payload.get('question'))
    print("ANS:", payload.get('answer'))
    print("SOL:", payload.get('solution'))
    print("-" * 60)
