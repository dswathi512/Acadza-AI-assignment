import json

def analyze_cases():
    with open('data/reports.json', 'r', encoding='utf-8') as f:
        reports = json.load(f)
    with open('data/questions.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)
    with open('data/taxonomy.json', 'r', encoding='utf-8') as f:
        taxonomy = json.load(f)

    q_map = {q['_id']: q for q in questions}

    print(f"Total reports to classify: {len(reports)}")
    for r in reports:
        qid = r['questionId']
        q = q_map[qid]
        qtype = q['questionType']
        payload = q[qtype]
        q_html = payload.get('question', '')
        sol_html = payload.get('solution', '')
        ans = payload.get('answer', '')
        comment = r['comment']

        # Print summary line
        print(f"[{r['reportId']}] QID:{qid[:6]} Subj:{q.get('subject')} Comment: '{comment}'")

if __name__ == '__main__':
    analyze_cases()
