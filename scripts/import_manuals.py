"""Resumable textbook ingestion. Secrets and document text never enter logs."""
import argparse
import collections
import concurrent.futures
import csv
import hashlib
import json
import os
from pathlib import Path
import sqlite3
import shutil
import subprocess
import threading
import time

import pymupdf
import requests

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data' / 'rag'
LOCK = threading.Lock()
STOP = threading.Event()
OCR = False


def config():
    values = {}
    for line in (ROOT / '.env').read_text().splitlines():
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            values[k] = v.strip()
    return os.environ.get('OPENAI_API_KEY', values.get('OPENAI_API_KEY', ''))


def api(method, path, **kwargs):
    for attempt in range(4):
        for value in kwargs.get('files', {}).values():
            value[1].seek(0)
        response = requests.request(method, 'https://api.openai.com/v1' + path,
                                    headers={'Authorization': 'Bearer ' + config()},
                                    timeout=(15, 120), **kwargs)
        if response.ok:
            return response.json()
        if response.status_code in (401, 403):
            STOP.set()
            raise RuntimeError('API_ACCESS_' + str(response.status_code))
        if response.status_code == 429:
            try:
                code = response.json().get('error', {}).get('code', '')
            except ValueError:
                code = ''
            if code in ('insufficient_quota', 'billing_hard_limit_reached'):
                STOP.set()
                raise RuntimeError('API_QUOTA')
        if response.status_code not in (429, 500, 502, 503, 504):
            raise RuntimeError('API_HTTP_' + str(response.status_code))
        time.sleep(min(30, 2 ** attempt * 2))
    raise RuntimeError('API_TEMPORARY_FAILURE')


def db():
    conn = sqlite3.connect(DATA / 'import.sqlite', timeout=30)
    conn.row_factory = sqlite3.Row
    return conn


def save(uid, **values):
    with LOCK, db() as conn:
        conn.execute('UPDATE documents SET ' + ','.join(k + '=?' for k in values) + ',updated_at=CURRENT_TIMESTAMP WHERE uid=?', [*values.values(), uid])
        report(conn)


def report(conn):
    counts = dict(conn.execute('SELECT status,count(*) FROM documents GROUP BY status').fetchall())
    state = json.loads((DATA / 'store.json').read_text()) if (DATA / 'store.json').exists() else {}
    payload = {'total': conn.execute('SELECT count(*) FROM documents').fetchone()[0], 'counts': counts,
               'vector_store_id': state.get('vector_store_id'), 'updated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}
    target = DATA / 'progress.json'
    temp = target.with_suffix('.tmp')
    temp.write_text(json.dumps(payload, indent=2))
    temp.replace(target)


def process(row):
    uid = row['uid']
    if STOP.is_set():
        return
    pdf = DATA / 'pdf' / (uid + '.pdf')
    text_path = DATA / 'text' / (uid + '.txt')
    try:
        existing = dict(db().execute('SELECT * FROM documents WHERE uid=?', (uid,)).fetchone())
        if existing['status'] == 'indexed':
            return
        if not text_path.exists():
            save(uid, status='downloading', error=None)
            if not pdf.exists():
                temp = pdf.with_suffix('.part')
                for attempt in range(3):
                    try:
                        with requests.get(row['pdf_url'], stream=True, timeout=(30, 120), headers={'User-Agent': 'ProfOS textbook research import/0.3'}) as response:
                            if response.status_code != 200:
                                raise RuntimeError('DOWNLOAD_HTTP_' + str(response.status_code))
                            total = 0
                            with temp.open('wb') as handle:
                                for chunk in response.iter_content(262144):
                                    total += len(chunk)
                                    if total > 250 * 1024 * 1024:
                                        raise RuntimeError('PDF_TOO_LARGE')
                                    handle.write(chunk)
                        break
                    except requests.RequestException:
                        temp.unlink(missing_ok=True)
                        if attempt == 2:
                            raise
                        time.sleep(2 ** attempt)
                if not temp.open('rb').read(5).startswith(b'%PDF-'):
                    raise RuntimeError('NOT_PDF')
                temp.replace(pdf)
            save(uid, status='extracting')
            digest = hashlib.sha256(pdf.read_bytes()).hexdigest()
            sections, readable = [], 0
            with pymupdf.open(pdf) as document:
                pages = len(document)
                for page_no, page in enumerate(document, 1):
                    text = page.get_text(sort=True).strip()
                    if len(text) < 60 and OCR:
                        image = page.get_pixmap(dpi=160).tobytes('png')
                        result = subprocess.run([shutil.which('tesseract') or '/opt/homebrew/bin/tesseract', 'stdin', 'stdout', '--tessdata-dir', str(DATA / 'tessdata'), '-l', 'ron+eng'], input=image, capture_output=True, timeout=90)
                        if result.returncode:
                            raise RuntimeError('OCR_FAILED')
                        text = result.stdout.decode('utf8').strip()
                    if len(text) < 60:
                        continue
                    readable += 1
                    words, block, length = text.split(), [], 0
                    for word in words:
                        block.append(word); length += len(word) + 1
                        if length >= 900:
                            sections.append(f'[[PAGE:{page_no}]]\n' + ' '.join(block))
                            block, length = [], 0
                    if block:
                        sections.append(f'[[PAGE:{page_no}]]\n' + ' '.join(block))
            if readable < max(1, pages * .5):
                save(uid, status='needs_ocr', pages=pages, readable_pages=readable, sha256=digest)
                pdf.unlink(missing_ok=True)
                return
            title = row['title']
            text_path.write_text(f'Manual: {title}\nClasă: {row["class"]}\nDisciplina: {row["subject"]}\nEditura: {row["publisher"]}\nSursa: {row["pdf_url"]}\nPagini indicate: poziția în fișierul PDF, nu numerotarea tipărită.\n\n' + '\n\n'.join(sections))
            save(uid, status='extracted', pages=pages, readable_pages=readable, sha256=digest)
            pdf.unlink(missing_ok=True)
        with db() as conn:
            current = dict(conn.execute('SELECT * FROM documents WHERE uid=?', (uid,)).fetchone())
        if not current['file_id']:
            with text_path.open('rb') as handle:
                uploaded = api('POST', '/files', data={'purpose': 'assistants'}, files={'file': (uid + '.txt', handle, 'text/plain')})
            save(uid, file_id=uploaded['id'], status='uploaded')
            current['file_id'] = uploaded['id']
        store = json.loads((DATA / 'store.json').read_text())['vector_store_id']
        if not current['attached']:
            try:
                api('POST', f'/vector_stores/{store}/files', json={'file_id': current['file_id'],
                    'attributes': {'uid': uid, 'title': row['title'][:256], 'class': row['class'][:256], 'subject': row['subject'][:256], 'publisher': row['publisher'][:256]},
                    'chunking_strategy': {'type': 'static', 'static': {'max_chunk_size_tokens': 500, 'chunk_overlap_tokens': 100}}})
            except RuntimeError as error:
                if str(error) != 'API_HTTP_409':
                    raise
            save(uid, attached=1, status='indexing')
        for _ in range(60):
            item = api('GET', f'/vector_stores/{store}/files/{current["file_id"]}')
            if item['status'] == 'completed':
                save(uid, status='indexed', error=None)
                print(uid + ': indexed', flush=True)
                return
            if item['status'] in ('failed', 'cancelled'):
                raise RuntimeError('INDEX_' + item['status'].upper())
            time.sleep(3)
        save(uid, status='indexing', error='POLL_TIMEOUT')
    except Exception as error:
        # Never emit raw request exceptions: credentials/text might be embedded.
        code = str(error) if isinstance(error, RuntimeError) else type(error).__name__
        save(uid, status='failed', error=code)
        print(uid + ': ' + code, flush=True)
    finally:
        pdf.with_suffix('.part').unlink(missing_ok=True)


def main():
    global OCR
    parser = argparse.ArgumentParser()
    parser.add_argument('--limit', type=int, default=0)
    parser.add_argument('--workers', type=int, default=2)
    parser.add_argument('--status', action='store_true')
    parser.add_argument('--ocr', action='store_true')
    parser.add_argument('--school-class')
    parser.add_argument('--subject-prefix')
    args = parser.parse_args()
    OCR = args.ocr
    if OCR and not ((shutil.which('tesseract') or Path('/opt/homebrew/bin/tesseract').exists()) and all((DATA / 'tessdata' / (name + '.traineddata')).exists() for name in ('ron', 'eng'))):
        raise SystemExit('OCR indisponibil: instalează Tesseract și modelele ron/eng în data/rag/tessdata.')
    DATA.mkdir(parents=True, exist_ok=True)
    for name in ('pdf', 'text'):
        (DATA / name).mkdir(exist_ok=True)
    with db() as conn:
        conn.execute('PRAGMA journal_mode=WAL')
        conn.execute('CREATE TABLE IF NOT EXISTS documents(uid TEXT PRIMARY KEY, metadata TEXT NOT NULL, status TEXT NOT NULL DEFAULT "pending", file_id TEXT, attached INTEGER DEFAULT 0, pages INTEGER, readable_pages INTEGER, sha256 TEXT, error TEXT, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)')
        rows = list(csv.DictReader((ROOT / 'catalog/manuale-edu.csv').open()))
        for row in rows:
            uid = row['source_id'] + '-' + row['part']
            row['uid'] = uid
            conn.execute('INSERT OR IGNORE INTO documents(uid, metadata) VALUES (?,?)', (uid, json.dumps(row, ensure_ascii=False)))
        conn.commit()
        if args.status:
            report(conn); print((DATA / 'progress.json').read_text()); return
    # Prevent two importers from creating/uploading the same file concurrently.
    import fcntl
    with (DATA / 'import.lock').open('w') as handle:
        try:
            fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise SystemExit('Un import este deja în curs.')
        if not (DATA / 'store.json').exists():
            store = api('POST', '/vector_stores', json={'name': 'ProfOS — manuale.edu.ro'})
            (DATA / 'store.json').write_text(json.dumps({'vector_store_id': store['id']}))
        with db() as conn:
            excluded = ('indexed',) if OCR else ('indexed', 'needs_ocr')
            todo = [json.loads(r['metadata']) for r in conn.execute('SELECT metadata FROM documents WHERE status NOT IN (' + ','.join('?' for _ in excluded) + ')', excluded)]
        todo = [r for r in todo if (not args.school_class or r['class'] == args.school_class) and (not args.subject_prefix or r['subject'].casefold().startswith(args.subject_prefix.casefold()))]
        if args.limit:
            todo = todo[:args.limit]
        print('Import: ' + str(len(todo)) + ' volume', flush=True)
        with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, min(3, args.workers))) as pool:
            for _ in pool.map(process, todo):
                pass
        with db() as conn:
            report(conn)
        print((DATA / 'progress.json').read_text(), flush=True)


if __name__ == '__main__':
    main()
