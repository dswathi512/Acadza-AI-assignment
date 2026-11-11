import json
import re

def clean_html(t):
    t = re.sub(r'<math.*?</math>', '[M]', t, flags=re.DOTALL)
    t = re.sub(r'<[^>]+>', ' ', t)
    return ' '.join(t.split())

with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = {q['_id']: q for q in json.load(f)}

check_qids = [
    ('R004', '68e870ef42c06737d6e565c4'),
    ('R007/8', '60f742f6660d187cc13a8078'),
    ('R034', '695ee00b88d7701e561aabc5'),
    ('R032', '68dea7c2387eea3d0d95f9bb'),
    ('R044', '68dea577d0cda73d07e9391c'),
    ('R028', '6956d7bb23cb221e570d6013'),
    ('R016', '6263d75bdd44e265ef926d97'),
    ('R030', '6956d7e988d7701e5617bd3e'),
    ('R043', '636283dbe3770c24f866e6d6'),
    ('R006', '696a866665252c04fc1f81c2'),
    ('R035', '66fe9dbe22132e5a70a3e579'),
    ('R020', '68c8153cfb6b2f16e2d3ceaf'),
    ('R031', '68dea619d0cda73d07e93aee')
]

for label, qid in check_qids:
    q = questions[qid]
    qtype = q['questionType']
    payload = q[qtype]
    print(f"=== {label} (QID: {qid}, Type: {qtype}) ===")
    print("Ans:", payload.get('answer'))
    print("Q:", clean_html(payload.get('question')))
    print("Sol:", clean_html(payload.get('solution')))
    print()
