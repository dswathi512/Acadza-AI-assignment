import json
import re

def clean_html(text):
    if not text:
        return ""
    # remove mathml tags for quick terminal reading
    text = re.sub(r'<math.*?</math>', '[MATH]', text, flags=re.DOTALL)
    # remove html tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # unescape
    text = ' '.join(text.split())
    return text

def analyze_all():
    with open('data/reports.json', 'r', encoding='utf-8') as f:
        reports = json.load(f)
    with open('data/questions.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)
    q_map = {q['_id']: q for q in questions}

    results = []
    for r in reports:
        qid = r['questionId']
        q = q_map[qid]
        qtype = q.get('questionType')
        payload = q.get(qtype, {})
        q_raw = payload.get('question', '')
        sol_raw = payload.get('solution', '')
        ans = payload.get('answer', '')
        
        results.append({
            'reportId': r['reportId'],
            'questionId': qid,
            'subject': q.get('subject'),
            'chapter': q.get('chapter'),
            'type': qtype,
            'student_comment': r['comment'],
            'answer': ans,
            'question_clean': clean_html(q_raw)[:160],
            'solution_clean': clean_html(sol_raw)[:160],
            'has_images': bool(payload.get('quesImages') or payload.get('solutionImages'))
        })

    with open('scripts/all_reports_analysis.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)

    print(f"Dumped analysis of {len(results)} reports to scripts/all_reports_analysis.json")

if __name__ == '__main__':
    analyze_all()
