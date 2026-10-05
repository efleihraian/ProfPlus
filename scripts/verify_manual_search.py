"""Live search smoke test: records provenance/page counts, never source text."""
import argparse
import json
import re
import time
from import_manuals import api, db, group, DATA, ROOT


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--group', choices=('matematica', 'fizica', 'informatica_tic', 'alte_materii'))
    args = parser.parse_args()
    store = json.loads((DATA / 'store.json').read_text())['vector_store_id']
    with db() as conn:
        rows = [dict(r) for r in conn.execute('SELECT uid,metadata,pages FROM documents WHERE status="indexed" ORDER BY updated_at DESC')]
    results = []
    groups = [args.group] if args.group else ['matematica', 'fizica', 'informatica_tic', 'alte_materii']
    for name in groups:
        eligible = [row for row in rows if group(json.loads(row['metadata'])['subject']) == name]
        if not eligible:
            results.append({'group': name, 'status': 'not_indexed_yet'})
            continue
        # Prefer Romanian middle-school books, then the latest indexed book.
        middle = [row for row in eligible if json.loads(row['metadata']).get('language_id') == '1' and json.loads(row['metadata'])['class'] in ('Clasa a VI-a', 'Clasa a VII-a', 'Clasa a VIII-a')]
        row = (middle or eligible)[0]
        metadata = json.loads(row['metadata'])
        queries = {'matematica': 'Adunarea și scăderea numerelor, operații și exerciții', 'fizica': 'Forța, mișcarea și unitățile de măsură', 'informatica_tic': 'Algoritmi, variabile și programare', 'alte_materii': metadata['title']}
        data = api('POST', f'/vector_stores/{store}/search', json={'query': queries[name], 'filters': {'type': 'eq', 'key': 'uid', 'value': row['uid']}, 'max_num_results': 5, 'rewrite_query': True, 'ranking_options': {'score_threshold': .25}})
        hits = data.get('data', [])
        valid = bool(hits)
        pages = set()
        for hit in hits:
            valid = valid and hit.get('attributes', {}).get('uid') == row['uid']
            for content in hit.get('content', []):
                if content.get('type') == 'text':
                    for page in re.findall(r'\[\[PAGE:(\d+)\]\]', content.get('text', '')):
                        pages.add(int(page))
        valid = valid and bool(pages) and all(1 <= p <= row['pages'] for p in pages)
        result = {'group': name, 'uid': row['uid'], 'title': metadata['title'], 'class': metadata['class'], 'source_url': metadata['pdf_url'], 'hits': len(hits), 'pages': sorted(pages), 'status': 'passed' if valid else 'failed'}
        results.append(result)
        print(name, row['uid'], result['status'], 'hits:', len(hits), 'pages:', sorted(pages))
    old = json.loads((DATA / 'search-verification.json').read_text()) if (DATA / 'search-verification.json').exists() else {'checks': []}
    by_group = {r['group']: r for r in old['checks']}
    by_group.update({r['group']: r for r in results})
    payload = {'updated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'checks': list(by_group.values()), 'scope': 'Provenance and page markers; not pedagogical or formula validation.'}
    report = json.dumps(payload, ensure_ascii=False, indent=2) + '\n'
    (DATA / 'search-verification.json').write_text(report)
    (ROOT / 'catalog/manual-search-verification.json').write_text(report)
    if any(r['status'] == 'failed' for r in results):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
