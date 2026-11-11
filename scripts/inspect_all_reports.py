import json

def inspect_all_reports():
    with open('data/reports.json', 'r', encoding='utf-8') as f:
        reports = json.load(f)

    with open('data/questions.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)

    q_map = {q['_id']: q for q in questions}

    with open('data/taxonomy.json', 'r', encoding='utf-8') as f:
        taxonomy = json.load(f)

    print(f"Total reports: {len(reports)}")
    for r in reports:
        qid = r['questionId']
        q = q_map.get(qid, {})
        qtype = q.get('questionType', '')
        payload = q.get(qtype, {})
        ans = payload.get('answer', '')
        q_text = payload.get('question', '')[:120].replace('\n', ' ')
        sol_text = payload.get('solution', '')[:120].replace('\n', ' ')
        print(f"ID: {r['reportId']} | Q: {qid[:8]} | Type: {qtype} | Ans: {ans}")
        print(f"   Student: \"{r['comment']}\"")
        print(f"   Q Stem: {q_text}...")
        print(f"   Sol: {sol_text}...")
        print("-" * 60)

if __name__ == '__main__':
    inspect_all_reports()
