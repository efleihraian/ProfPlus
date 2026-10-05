"""Resumable textbook ingestion. Secrets and document text never enter logs."""
import argparse
import contextlib
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
import unicodedata
from urllib.parse import urlparse, urljoin

import requests

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data' / 'rag'
LOCK = threading.Lock()
STOP = threading.Event()
OCR = False
MIN_COVERAGE = .90
KEY = None


def normalized(value):
    return ''.join(c for c in unicodedata.normalize('NFD', value.casefold()) if unicodedata.category(c) != 'Mn')


def group(subject):
    name = normalized(subject)
    if name.startswith('matematica'):
        return 'matematica'
    if name.startswith('fizica'):
        return 'fizica'
    if name.startswith('informatica') or name.startswith('tehnologia informatiei'):
        return 'informatica_tic'
    return 'alte_materii'


def official_url(value):
    try:
        parsed = urlparse(value)
        return parsed.scheme == 'https' and parsed.hostname in ('manuale.edu.ro', 'www.manuale.edu.ro') and not parsed.username and not parsed.password and parsed.port in (None, 443)
    except ValueError:
        return False


def download_response(url):
    for _ in range(6):
        if not official_url(url):
            raise RuntimeError('SOURCE_URL_REJECTED')
        response = requests.get(url, stream=True, allow_redirects=False, timeout=(30, 120), headers={'User-Agent': 'ProfPlus textbook research import/0.9.5'})
        if response.status_code not in (301, 302, 303, 307, 308):
            return response
        location = response.headers.get('Location', '')
        response.close()
        if not location:
            raise RuntimeError('SOURCE_REDIRECT_REJECTED')
        url = urljoin(url, location)
    raise RuntimeError('SOURCE_REDIRECT_LIMIT')


def ocr_languages(row):
    name = normalized(row['subject'])
    models = [('maghiar', 'hun'), ('german', 'deu'), ('francez', 'fra'), ('englez', 'eng'),
              ('italian', 'ita'), ('spaniol', 'spa'), ('croat', 'hrv'), ('rusa', 'rus'),
              ('rusi', 'rus'), ('sarb', 'srp'), ('slovac', 'slk'), ('turc', 'tur'), ('ucraine', 'ukr'), ('latina', 'lat')]
    requested = ['ron', 'eng']
    for fragment, model in models:
        if fragment in name and model not in requested:
            requested.append(model)
    if 'rrom' in name:
        # No verified Romani model: do not pretend Romanian OCR covers it.
        raise RuntimeError('OCR_LANGUAGE_UNSUPPORTED')
    if not all((DATA / 'tessdata' / (model + '.traineddata')).exists() for model in requested):
        raise RuntimeError('OCR_LANGUAGE_MODEL_MISSING')
    return '+'.join(requested)


def config():
    global KEY
    if KEY is not None:
        return KEY
    values = {}
    for target in (ROOT / '.env', ROOT / 'web/.dev.vars'):
        if target.exists():
            for line in target.read_text().splitlines():
                if '=' in line and not line.startswith('#'):
                    k, v = line.split('=', 1)
                    values[k] = v.strip().strip('"').strip("'")
    KEY = os.environ.get('OPENAI_API_KEY', values.get('OPENAI_API_KEY', ''))
    if not KEY:
        raise RuntimeError('API_KEY_MISSING')
    return KEY


def api(method, path, **kwargs):
    for attempt in range(4):
        for value in kwargs.get('files', {}).values():
            value[1].seek(0)
        try:
            response = requests.request(method, 'https://api.openai.com/v1' + path,
                                        headers={'Authorization': 'Bearer ' + config()},
                                        timeout=(10, 60), **kwargs)
        except requests.RequestException:
            if attempt == 3:
                raise RuntimeError('API_NETWORK_ERROR') from None
            time.sleep(2 ** attempt)
            continue
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


@contextlib.contextmanager
def db():
    conn = sqlite3.connect(DATA / 'import.sqlite', timeout=30)
    conn.row_factory = sqlite3.Row
    try:
        with conn:
            yield conn
    finally:
        conn.close()


def save(uid, **values):
    with LOCK, db() as conn:
        conn.execute('UPDATE documents SET ' + ','.join(k + '=?' for k in values) + ',updated_at=CURRENT_TIMESTAMP WHERE uid=?', [*values.values(), uid])
        report(conn)


def report(conn):
    counts = dict(conn.execute('SELECT status,count(*) FROM documents GROUP BY status').fetchall())
    groups = {}
    for item in conn.execute('SELECT metadata,status FROM documents'):
        bucket = groups.setdefault(group(json.loads(item['metadata'])['subject']), {'total': 0, 'counts': {}})
        bucket['total'] += 1
        bucket['counts'][item['status']] = bucket['counts'].get(item['status'], 0) + 1
    payload = {'total': conn.execute('SELECT count(*) FROM documents').fetchone()[0], 'counts': counts,
               'groups': groups, 'updated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}
    target = DATA / 'progress.json'
    temp = target.with_suffix(f'.{os.getpid()}.{threading.get_ident()}.tmp')
    temp.write_text(json.dumps(payload, indent=2))
    temp.replace(target)


def reconcile():
    """Confirm provider state before resuming; never trust a stale local success."""
    store = json.loads((DATA / 'store.json').read_text())['vector_store_id']
    after = ''
    remote = {}
    while True:
        result = api('GET', f'/vector_stores/{store}/files', params={'limit': 100, **({'after': after} if after else {})})
        for item in result['data']:
            uid = item.get('attributes', {}).get('uid')
            if uid:
                remote[uid] = item
        if not result.get('has_more'):
            break
        after = result['last_id']
    with LOCK, db() as conn:
        for row in conn.execute('SELECT uid,status,file_id FROM documents').fetchall():
            item = remote.get(row['uid'])
            if item:
                status = {'completed': 'indexed', 'in_progress': 'indexing', 'failed': 'failed', 'cancelled': 'failed'}.get(item['status'], 'indexing')
                conn.execute('UPDATE documents SET status=?,file_id=?,attached=1,error=?,updated_at=CURRENT_TIMESTAMP WHERE uid=?',
                             (status, item['id'], None if status != 'failed' else 'REMOTE_INDEX_FAILED', row['uid']))
            elif row['status'] in ('indexed', 'indexing'):
                conn.execute('UPDATE documents SET status="extracted",attached=0,error="REMOTE_ATTACHMENT_MISSING" WHERE uid=?', (row['uid'],))
        conn.commit()
        report(conn)
    print('Index verificat: ' + str(sum(x['status'] == 'completed' for x in remote.values())) + ' volume disponibile', flush=True)


def export_report():
    with db() as conn:
        report(conn)
        progress = json.loads((DATA / 'progress.json').read_text())
        items = []
        for row in conn.execute('SELECT * FROM documents ORDER BY uid'):
            metadata = json.loads(row['metadata'])
            items.append({k: metadata.get(k) for k in ('uid', 'title', 'class', 'subject', 'publisher', 'pdf_url')} | {
                k: row[k] for k in ('status', 'pages', 'readable_pages', 'sha256', 'error', 'updated_at')})
        progress['manuals'] = items
    target = ROOT / 'catalog/manual-import-status.json'
    target.write_text(json.dumps(progress, ensure_ascii=False, indent=2) + '\n')


def process(row):
    uid = row['uid']
    if STOP.is_set():
        return
    pdf = DATA / 'pdf' / (uid + '.pdf')
    text_path = DATA / 'text' / (uid + '.txt')
    try:
        with db() as conn:
            existing = dict(conn.execute('SELECT * FROM documents WHERE uid=?', (uid,)).fetchone())
        if existing['status'] == 'indexed':
            return
        if not text_path.exists() or (OCR and existing['status'] == 'needs_ocr'):
            save(uid, status='downloading', error=None)
            if not pdf.exists():
                temp = pdf.with_suffix('.part')
                for attempt in range(3):
                    try:
                        if not official_url(row['pdf_url']):
                            raise RuntimeError('SOURCE_URL_REJECTED')
                        if shutil.disk_usage(DATA).free < 1024 ** 3:
                            STOP.set()
                            raise RuntimeError('DISK_SPACE_LOW')
                        with download_response(row['pdf_url']) as response:
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
            options = {'row': row, 'pdf': str(pdf), 'output': str(text_path), 'ocr': OCR,
                       'force_ocr': existing['error'] == 'TEXT_EXTRACTION_TIMEOUT',
                       'tessdata': str(DATA / 'tessdata'), 'languages': ocr_languages(row) if OCR else '',
                       'min_coverage': MIN_COVERAGE}
            try:
                result = subprocess.run([os.sys.executable, str(ROOT / 'scripts/extract_manual_text.py')],
                                        input=json.dumps(options).encode(), capture_output=True,
                                        timeout=7200 if OCR else 180,
                                        env={k: v for k, v in os.environ.items() if not any(name in k.upper() for name in ('KEY', 'TOKEN', 'SECRET', 'PASSWORD', 'CREDENTIAL'))})
            except subprocess.TimeoutExpired:
                save(uid, status='needs_ocr', sha256=digest, error='TEXT_EXTRACTION_TIMEOUT' if not OCR else 'OCR_TIMEOUT')
                pdf.unlink(missing_ok=True)
                print(uid + ': needs_ocr (extraction timeout)', flush=True)
                return
            if result.returncode:
                raise RuntimeError('EXTRACTION_PROCESS_FAILED')
            extraction = json.loads(result.stdout)
            pages, readable = extraction['pages'], extraction['readable_pages']
            if readable < max(1, pages * MIN_COVERAGE):
                save(uid, status='needs_ocr', pages=pages, readable_pages=readable, sha256=digest)
                pdf.unlink(missing_ok=True)
                print(uid + ': needs_ocr (' + str(readable) + '/' + str(pages) + ' pagini)', flush=True)
                return
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
        print(uid + ': indexing (verificare la reluare)', flush=True)
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
    parser.add_argument('--subject-group', choices=('matematica', 'fizica', 'informatica_tic', 'alte_materii'))
    parser.add_argument('--priority-all', action='store_true', help='Matematică, fizică, informatică/TIC, apoi restul')
    parser.add_argument('--only-ocr', action='store_true')
    parser.add_argument('--reconcile', action='store_true')
    parser.add_argument('--export-report', action='store_true')
    parser.add_argument('--min-coverage', type=float, default=.90)
    args = parser.parse_args()
    global MIN_COVERAGE
    OCR = args.ocr
    if not .5 <= args.min_coverage <= 1:
        parser.error('Acoperirea trebuie să fie între 0.5 și 1.')
    MIN_COVERAGE = args.min_coverage
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
        if args.status and not args.reconcile:
            report(conn)
            if args.export_report:
                export_report()
            print((DATA / 'progress.json').read_text()); return
    # Prevent two importers from creating/uploading the same file concurrently.
    import fcntl
    with (DATA / 'import.lock').open('w') as handle:
        try:
            fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise SystemExit('Un import este deja în curs.')
        if not (DATA / 'store.json').exists():
            store = api('POST', '/vector_stores', json={'name': 'ProfPlus — manuale.edu.ro'})
            (DATA / 'store.json').write_text(json.dumps({'vector_store_id': store['id']}))
        reconcile()
        if args.status:
            if args.export_report:
                export_report()
            print((DATA / 'progress.json').read_text()); return
        with db() as conn:
            excluded = ('indexed',) if OCR else ('indexed', 'needs_ocr')
            todo = [json.loads(r['metadata']) for r in conn.execute('SELECT metadata FROM documents WHERE status NOT IN (' + ','.join('?' for _ in excluded) + ')', excluded)]
        todo = [r for r in todo if (not args.school_class or r['class'] == args.school_class) and (not args.subject_prefix or normalized(r['subject']).startswith(normalized(args.subject_prefix)))]
        if args.subject_group:
            todo = [r for r in todo if group(r['subject']) == args.subject_group]
        if args.only_ocr:
            with db() as conn:
                ocr_ids = {r['uid'] for r in conn.execute('SELECT uid FROM documents WHERE status="needs_ocr"')}
            todo = [r for r in todo if r['uid'] in ocr_ids]
        if args.priority_all:
            order = {'matematica': 0, 'fizica': 1, 'informatica_tic': 2, 'alte_materii': 3}
            todo.sort(key=lambda r: order[group(r['subject'])])
        if args.limit:
            todo = todo[:args.limit]
        print('Import: ' + str(len(todo)) + ' volume', flush=True)
        with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, min(3, args.workers))) as pool:
            for _ in pool.map(process, todo):
                pass
        with db() as conn:
            report(conn)
        print((DATA / 'progress.json').read_text(), flush=True)
        if args.export_report:
            export_report()
        if STOP.is_set():
            raise SystemExit(2)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        code = str(error) if isinstance(error, RuntimeError) and str(error).startswith(('API_', 'OCR_', 'SOURCE_', 'DISK_')) else type(error).__name__
        DATA.mkdir(parents=True, exist_ok=True)
        (DATA / 'last-error.json').write_text(json.dumps({'code': code, 'updated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}))
        print('Import error: ' + code, flush=True)
        raise SystemExit(2 if STOP.is_set() else 1)
