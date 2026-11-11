import json

with open('scripts/all_reports_analysis.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

for item in items:
    print(f"{item['reportId']} | QID: {item['questionId'][:8]} | Type: {item['type']} | Ans: {item['answer']} | Comment: {item['student_comment']}")
