"""Recover official originals independently of AI indexing; verify before local deletion."""
import argparse, collections, concurrent.futures, csv, fcntl, hashlib, json, os
from pathlib import Path
import threading, time, signal
import requests
from cloud_library import CloudLibrary, BUCKET, STATE_BUCKET
from import_manuals import download_response, normalized

def fair_order(rows):
    groups = collections.defaultdict(collections.deque)
    for row in rows:
        groups[(normalized(row['subject']), row['class'])].append(row)
    ordered = []
    while groups:
        for key in list(groups):
            ordered.append(groups[key].popleft())
            if not groups[key]: del groups[key]
    return ordered

def download_once(row, path, limit):
    temporary = path.with_suffix('.part')
    try:
        with download_response(row['pdf_url']) as response:
            if response.status_code != 200:
                raise RuntimeError('DOWNLOAD_HTTP_' + str(response.status_code))
            announced = int(response.headers.get('Content-Length', '0'))
            if announced > limit: return {'status': 'over_file_limit', 'size': announced}
            size = 0
            with temporary.open('wb') as handle:
                for block in response.iter_content(262144):
                    size += len(block)
                    if size > limit: return {'status': 'over_file_limit', 'size_at_least': size}
                    handle.write(block)
        with temporary.open('rb') as handle:
            if handle.read(5) != b'%PDF-': raise RuntimeError('NOT_PDF')
        temporary.replace(path)
        return {'status': 'downloaded', 'size': size}
    finally:
        temporary.unlink(missing_ok=True)

def download(row, path, limit):
    for attempt in range(3):
        try: return download_once(row,path,limit)
        except (requests.RequestException,RuntimeError) as error:
            transient=isinstance(error,requests.RequestException) or str(error) in ('DOWNLOAD_HTTP_429','DOWNLOAD_HTTP_500','DOWNLOAD_HTTP_502','DOWNLOAD_HTTP_503','DOWNLOAD_HTTP_504')
            if not transient or attempt==2: raise
            time.sleep(2**attempt)

def recover_download(row, path, limit, previous=None):
    previous = previous or {}
    if previous.get('status') == 'omitted_failed': return previous
    if previous.get('status') == 'over_file_limit' and previous.get('source_url') == row['pdf_url']:
        return previous
    if path.exists():
        size = path.stat().st_size
        if size > limit: return {'status':'over_file_limit','size':size}
        with path.open('rb') as handle:
            if handle.read(5) != b'%PDF-': raise RuntimeError('NOT_PDF')
        return {'status':'downloaded','size':size}
    return download(row,path,limit)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--operational-root', type=Path, required=True)
    parser.add_argument('--file-limit-mb', type=int, default=50)
    parser.add_argument('--library-budget-gb', type=int, default=75)
    parser.add_argument('--workers', type=int, default=6)
    parser.add_argument('--limit', type=int, default=0)
    args = parser.parse_args()
    if not 1 <= args.file_limit_mb <= 250 or not 1 <= args.library_budget_gb <= 75 or not 1 <= args.workers <= 6:
        parser.error('Limits must preserve room for private documents and remain within the importer bounds.')
    root = args.operational_root.resolve()
    os.environ['PROFPLUS_OPERATIONAL_ROOT'] = str(root)
    data = root / 'data/rag/original-recovery'
    data.mkdir(parents=True, exist_ok=True)
    with (data / 'recovery.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        client = CloudLibrary(); client.ensure_buckets()
        existing = {}; offset = 0
        while True:
            result = client.request('GET', '/rest/v1/library_materials', params={'select':'uid,family,kind,size', 'order':'family.asc,uid.asc,kind.asc', 'limit':1000, 'offset':offset})
            if not result.ok: raise RuntimeError('CATALOG_READ_FAILED')
            batch = result.json()
            for item in batch: existing[(item['family'], item['uid'], item['kind'])] = item['size']
            if len(batch) < 1000: break
            offset += 1000
        used = sum(existing.values())
        report_path = data / 'progress.txt'
        results = json.loads(report_path.read_text()).get('manuals', {}) if report_path.exists() else {}
        guard = threading.Lock(); stop = threading.Event()
        signal.signal(signal.SIGTERM, lambda *_: stop.set())
        signal.signal(signal.SIGINT, lambda *_: stop.set())
        def report(state='running'):
            summary = {'state':state, 'updated_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()), 'file_limit_bytes':args.file_limit_mb * 1024**2, 'library_budget_bytes':args.library_budget_gb * 1000**3, 'catalog_bytes':used, 'counts':dict(collections.Counter(i['status'] for i in results.values())), 'manuals':results}
            temp = report_path.with_suffix('.tmp'); temp.write_text(json.dumps(summary, ensure_ascii=False, indent=2)); temp.replace(report_path)
        omitted = client.omitted_uids('manuals')
        rows = list(csv.DictReader((root / 'catalog/manuale-edu.csv').open()))
        for row in rows: row['uid'] = row['source_id'] + '-' + row['part']
        def process(row):
            nonlocal used
            uid = row['uid']; path = data / (uid + '.pdf')
            if stop.is_set(): return
            try:
                if results.get(uid,{}).get('status') == 'omitted_failed' or (uid in omitted and ('manuals',uid,'original') not in existing):
                    result = {**results.get(uid,{}),'status':'omitted_failed'}
                elif ('manuals', uid, 'original') in existing:
                    result = {'status':'already_stored', 'size':existing[('manuals',uid,'original')]}
                else:
                    result = recover_download(row,path,args.file_limit_mb*1024**2,results.get(uid))
                    if result['status'] == 'downloaded':
                        with guard:
                            if used + result['size'] > args.library_budget_gb * 1000**3:
                                stop.set(); raise RuntimeError('LIBRARY_BUDGET_REACHED')
                            used += result['size']
                        try: value = client.archive(path,'manuals',uid,'original',row,delete=True)
                        except Exception:
                            with guard: used -= result['size']
                            raise
                        result = {'status':'stored_verified','size':value['size'],'sha256':value['sha256']}
                result['source_url'] = row['pdf_url']
                with guard: results[uid] = result; report()
                print(uid + ': ' + result['status'], flush=True)
            except Exception as error:
                code = str(error) if isinstance(error,RuntimeError) else type(error).__name__
                if code.startswith(('SUPABASE_', 'BUCKET_', 'CLOUD_', 'LIBRARY_BUDGET', 'IMMUTABLE_', 'REMOTE_')): stop.set()
                with guard: results[uid] = {'status':'failed','error':code}; report()
                print(uid + ': ' + code, flush=True)
        ordered = fair_order(rows)
        if args.limit: ordered = ordered[:args.limit]
        report()
        with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
            list(pool.map(process,ordered))
        report('stopped' if stop.is_set() else 'finished_with_report')
        remaining = data / 'remaining.csv'
        with remaining.open('w') as handle:
            writer=csv.DictWriter(handle,fieldnames=['uid','title','subject','class','publisher','pdf_url','status','size','size_at_least','error'])
            writer.writeheader()
            for row in rows:
                result=results.get(row['uid'],{'status':'not_attempted'})
                if result['status'] not in ('already_stored','stored_verified'):
                    writer.writerow({key:(result if key in result else row).get(key,'') for key in writer.fieldnames})
        client.archive(report_path,'checkpoints','manual-original-recovery','text',delete=False)
        print(json.dumps({'counts':dict(collections.Counter(i['status'] for i in results.values())), 'stopped':stop.is_set()}),flush=True)
        return 2 if stop.is_set() else 0

if __name__ == '__main__':
    raise SystemExit(main())
