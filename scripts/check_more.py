import json

with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = {q['_id']: q for q in json.load(f)}

for label, qid in [
    ('R030', '6956d7e988d7701e5617bd3e'),
    ('R031', '68dea619d0cda73d07e93aee'),
    ('R015', '6956d79788d7701e5617bc29'),
    ('R018/19', '612151a6a34397610a9a2e58'),
    ('R010/9', '622f08d7b70e4b50e4500a1b'),
    ('R011', '68e872546e45ba37dcc16bc0'),
    ('R012', '61dffbec08489156b684bd22'),
    ('R017', '6208e80a9cb2ab67dac61bd0'),
    ('R022', '61ee6c9d90a1a968a168686b'),
    ('R013', '617fa18efd53ff1629ed890f'),
    ('R014', '63765a28f1d8416ae0408d89'),
    ('R021', '68f21caf941cda588bc04365'),
    ('R024', '5fc60508028950133eac8963'),
    ('R025', '622df25ab70e4b50e44ff837'),
    ('R026', '620e23cecc50543bc7db9186'),
    ('R042', '63c7cce12981ed154ee92c94'),
    ('R023', '68ecbacb2ec87a18deba1ad7')
]:
    q = questions[qid]
    payload = q[q['questionType']]
    print(f"=== {label} ({qid[:8]}) ===")
    print("Q:", payload.get('question'))
    print("ANS:", payload.get('answer'))
    print("SOL:", payload.get('solution')[:200])
    print()
