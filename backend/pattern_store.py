import json, os
from datetime import datetime

STORE_FILE = os.path.join(os.path.dirname(__file__), 'patterns.json')

def load_patterns():
    if not os.path.exists(STORE_FILE):
        return []
    with open(STORE_FILE, 'r') as f:
        return json.load(f)

def save_patterns(patterns):
    with open(STORE_FILE, 'w') as f:
        json.dump(patterns, f, indent=2)

def add_patterns(new_patterns):
    existing = load_patterns()
    hashes = {p['hash'] for p in existing}
    added = 0
    for p in new_patterns:
        if p['hash'] not in hashes:
            p['stored_at'] = datetime.now().isoformat()
            existing.append(p)
            added += 1
    save_patterns(existing)
    return existing

def search_patterns(query):
    patterns = load_patterns()
    query = query.lower()
    results = []
    for p in patterns:
        score = 0
        if query in p['message'].lower():
            score += 3
        if query in p.get('diff_preview', '').lower():
            score += 2
        if any(query in f.lower() for f in p.get('files_changed', [])):
            score += 1
        if score > 0:
            p['relevance_score'] = score
            results.append(p)
    return sorted(results, key=lambda x: x['relevance_score'], reverse=True)