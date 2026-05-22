import json, os

STORE_FILE = 'patterns.json'

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
    for p in new_patterns:
        if p['hash'] not in hashes:
            existing.append(p)
    save_patterns(existing)
    return existing

def search_patterns(query):
    patterns = load_patterns()
    query = query.lower()
    return [p for p in patterns if query in p['message'].lower() or query in p['diff_preview'].lower()]
