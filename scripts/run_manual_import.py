"""Durable local import queue; progress and logs contain no credentials or text."""
import argparse
import fcntl
import json
import os
from pathlib import Path
import subprocess
import sys
import time
import sqlite3

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data/rag'
STATE = DATA / 'run.json'


def status(**fields):
    old = json.loads(STATE.read_text()) if STATE.exists() else {}
    old.update(fields)
    old['updated_at'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    temporary = STATE.with_suffix('.' + str(os.getpid()) + '.tmp')
    temporary.write_text(json.dumps(old, indent=2) + '\n')
    temporary.replace(STATE)


def wait_for_importer():
    with (DATA / 'import.lock').open('a') as handle:
        while True:
            try:
                fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
                fcntl.flock(handle, fcntl.LOCK_UN)
                return
            except BlockingIOError:
                time.sleep(10)


def run():
    with (DATA / 'queue.lock').open('a') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print('O coadă de import rulează deja.'); return
        status(pid=os.getpid(), state='running', phase='waiting_for_existing_import', started_at=time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), error=None)
        wait_for_importer()
        groups = ['matematica', 'fizica', 'informatica_tic', 'alte_materii']
        # User priority: finish text imports for every subject before OCR.
        phases = [(name, False) for name in groups]
        for name, ocr in phases:
            phase = ('ocr_' if ocr else 'text_') + name
            status(phase=phase)
            command = [sys.executable, str(ROOT / 'scripts/import_manuals.py'), '--subject-group', name, '--workers', '3' if not ocr else '1']
            if ocr:
                command.extend(['--ocr', '--only-ocr'])
            for attempt in range(3 if not ocr else 1):
                status(attempt=attempt + 1)
                child = subprocess.Popen(command, cwd=ROOT)
                status(child_pid=child.pid)
                result = child.wait()
                status(child_pid=None)
                if result:
                    failure = json.loads((DATA / 'last-error.json').read_text()) if (DATA / 'last-error.json').exists() else {}
                    if result == 1 and failure.get('code') in ('API_NETWORK_ERROR', 'API_TEMPORARY_FAILURE') and attempt < 2 and not ocr:
                        status(error=failure['code'])
                        time.sleep(30)
                        continue
                    status(state='blocked', error='IMPORT_EXIT_' + str(result))
                    return
                if ocr:
                    break
                from import_manuals import group
                with sqlite3.connect(DATA / 'import.sqlite') as conn:
                    remaining = [row for row in conn.execute('SELECT metadata FROM documents WHERE status IN ("failed","indexing")') if group(json.loads(row[0])['subject']) == name]
                if not remaining:
                    break
                time.sleep(10)
            subprocess.run([sys.executable, str(ROOT / 'scripts/import_manuals.py'), '--status', '--export-report'], cwd=ROOT)
            if not ocr:
                verification = subprocess.run([sys.executable, str(ROOT / 'scripts/verify_manual_search.py'), '--group', name], cwd=ROOT)
                status(last_search_group=name, last_search_exit=verification.returncode)
        result = subprocess.run([sys.executable, str(ROOT / 'scripts/import_manuals.py'), '--status', '--reconcile', '--export-report'], cwd=ROOT)
        status(state='awaiting_ocr' if result.returncode == 0 else 'blocked', phase='verification', error=None if not result.returncode else 'VERIFY_EXIT_' + str(result.returncode))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--start', action='store_true')
    parser.add_argument('--run', action='store_true')
    args = parser.parse_args()
    DATA.mkdir(parents=True, exist_ok=True)
    if args.start:
        with (DATA / 'queue.lock').open('a') as lock:
            try:
                fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError:
                print('O coadă de import rulează deja.'); return
        with (DATA / 'queue.log').open('a') as log:
            child = subprocess.Popen([sys.executable, '-u', __file__, '--run'], cwd=ROOT, stdin=subprocess.DEVNULL, stdout=log, stderr=log, start_new_session=True)
        print('Coada de import pornită. PID:', child.pid)
    elif args.run:
        run()
    else:
        print(STATE.read_text() if STATE.exists() else 'Nicio coadă de import pornită.')


if __name__ == '__main__':
    main()
