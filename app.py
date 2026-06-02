from flask import Flask, request, jsonify
from flask_cors import CORS
from git_analyzer import analyze_repo
from pattern_store import add_patterns, load_patterns, search_patterns
from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def ai_analyze(code_snippet, patterns):
    if not patterns:
        return {"risk_level": "low", "warning": None, "similar_pattern": None, "suggestion": "No patterns stored yet."}
    pattern_text = "\n".join([f"- [{p['hash']}] {p['message']}" for p in patterns[:10]])
    prompt = f"""You are ECHO, an AI regression memory system for developers.

Known bug-fix patterns from this repo:
{pattern_text}

Developer is working on this code:
{code_snippet}

Respond in JSON only:
{{
  "risk_level": "high/medium/low",
  "warning": "one line warning or null",
  "similar_pattern": "hash of most similar past bug or null",
  "suggestion": "one line fix suggestion or null"
}}"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=300
    )
    text = response.choices[0].message.content.strip()
    try:
        return json.loads(text)
    except:
        return {"risk_level": "low", "warning": None, "similar_pattern": None, "suggestion": None}

@app.route('/api/scan', methods=['POST'])
def scan():
    data = request.json
    repo_path = data.get('repo_path', '.')
    patterns = analyze_repo(repo_path)
    saved = add_patterns(patterns)
    return jsonify({'scanned': len(patterns), 'total_stored': len(saved), 'patterns': patterns})

@app.route('/api/patterns', methods=['GET'])
def get_patterns():
    return jsonify(load_patterns())

@app.route('/api/search', methods=['GET'])
def search():
    query = request.args.get('q', '')
    return jsonify(search_patterns(query))

@app.route('/api/warn', methods=['POST'])
def warn():
    data = request.json
    code = data.get('code', '')
    patterns = load_patterns()
    ai_result = ai_analyze(code, patterns)
    return jsonify(ai_result)

@app.route('/api/stats', methods=['GET'])
def stats():
    patterns = load_patterns()
    return jsonify({'total': len(patterns), 'authors': list({p['author'] for p in patterns})})

if __name__ == '__main__':
    app.run(debug=True, port=5050)