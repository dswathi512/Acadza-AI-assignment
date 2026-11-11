import json
from collections import Counter

def main():
    with open('data/taxonomy.json', 'r', encoding='utf-8') as f:
        taxonomy = json.load(f)

    with open('data/reports.json', 'r', encoding='utf-8') as f:
        reports = json.load(f)

    with open('data/questions.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)

    print('=== TAXONOMY ===')
    print('Verdicts:', list(taxonomy['verdicts'].keys()))
    print('Repairs count:', len(taxonomy['repairs']))
    for k, v in taxonomy['repairs'].items():
        print(f"  {k:18} | fields: {str(v.get('fields')):25} | auto: {str(v.get('auto')):5} | {v.get('label')}")

    print('\n=== QUESTIONS (Total: {}) ==='.format(len(questions)))
    q_map = {q['_id']: q for q in questions}
    subjects = Counter(q.get('subject') for q in questions)
    print('Subjects:', dict(subjects))
    qtypes = Counter(q.get('questionType') for q in questions)
    print('Question types:', dict(qtypes))
    levels = Counter(q.get('level') for q in questions)
    print('Levels:', dict(levels))

    print('\n=== REPORTS (Total: {}) ==='.format(len(reports)))
    report_ids = [r['reportId'] for r in reports]
    print('Unique reportIds:', len(set(report_ids)))
    sources = Counter(r.get('source') for r in reports)
    print('Sources:', dict(sources))
    
    reported_qids = [r['questionId'] for r in reports]
    q_counter = Counter(reported_qids)
    print('Unique questions reported:', len(q_counter))
    
    duplicates = {qid: cnt for qid, cnt in q_counter.items() if cnt > 1}
    print('Questions with duplicate reports:', len(duplicates))
    for qid, cnt in duplicates.items():
        matching_reports = [r for r in reports if r['questionId'] == qid]
        print(f"  Question {qid} ({cnt} reports):")
        for mr in matching_reports:
            print(f"    - [{mr['reportId']}] {mr['comment']}")

    unreported_qids = set(q_map.keys()) - set(q_counter.keys())
    print('\n=== UNREPORTED QUESTIONS (Total: {}) ==='.format(len(unreported_qids)))
    for uqid in unreported_qids:
        uq = q_map[uqid]
        print(f"  - {uqid} | {uq.get('subject')} | {uq.get('chapter')} | {uq.get('questionType')}")

if __name__ == '__main__':
    main()
