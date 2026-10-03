"""Run functional RAG cases against the local chat; keep responses out of Git."""
import concurrent.futures
import json
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parents[1]


def main():
    cases = json.loads((ROOT / 'tests/rag-cases.json').read_text())
    manuals = json.loads((ROOT / 'catalog/matematica-clasa-5.json').read_text())['manuals']
    urls = {m['pdf_url']: m['uid'] for m in manuals}
    snapshot = json.loads((ROOT / 'catalog/matematica-clasa-5-status.json').read_text())['manuals']
    pages = {m['uid']: m['pages'] for m in snapshot}

    def check(case):
        try:
            response = requests.post('http://127.0.0.1:3000/api/chat', json={'messages': [{'role': 'user', 'content': case['question']}]}, timeout=65)
            data = response.json()
            sources = data.get('sources', [])
            valid = all((s.get('kind') == 'web' and s.get('url', '').startswith(('https://', 'http://'))) or (s.get('url', '').split('#')[0] in urls and isinstance(s.get('page'), int) and 1 <= s['page'] <= pages[urls[s['url'].split('#')[0]]]) for s in sources)
            citations = bool(sources) if case['expectedGrounded'] else not sources
            passed = response.status_code == 200 and data.get('grounded') == case['expectedGrounded'] and valid and citations
            return {**case, 'http': response.status_code, **data, 'passed': passed}
        except (requests.RequestException, ValueError):
            return {**case, 'passed': False, 'error': 'REQUEST_FAILED'}

    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(check, cases))
    target = ROOT / 'data/rag/evaluation.json'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(results, ensure_ascii=False, indent=2))
    for case in results:
        print(case['id'], 'PASS' if case['passed'] else 'FAIL')
    raise SystemExit(0 if all(c['passed'] for c in results) else 1)


if __name__ == '__main__':
    main()
