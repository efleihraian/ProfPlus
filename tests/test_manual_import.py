"""Offline ingestion contracts: no real API requests or credentials."""
import contextlib
import io
import json
from pathlib import Path
import tempfile
import unittest
import subprocess
import sys
from types import SimpleNamespace
from unittest.mock import patch, MagicMock

import pymupdf
from scripts import import_manuals as importer
from scripts import run_manual_import as queue


class ImportTests(unittest.TestCase):
    def setUp(self):
        # Offline fixtures must never use the operational cloud configuration.
        cloud = patch.object(importer, 'cloud_active', return_value=False)
        cloud.start()
        self.addCleanup(cloud.stop)
        self.temp = tempfile.TemporaryDirectory()
        self.old_data = importer.DATA
        importer.DATA = Path(self.temp.name)
        for name in ('pdf', 'text'):
            (importer.DATA / name).mkdir()
        (importer.DATA / 'store.json').write_text(json.dumps({'vector_store_id': 'synthetic-store'}))
        importer.STOP.clear()
        importer.OCR = False
        importer.MIN_COVERAGE = .9
        with importer.db() as conn:
            conn.execute('CREATE TABLE documents(uid TEXT PRIMARY KEY, metadata TEXT, status TEXT DEFAULT "pending", file_id TEXT, attached INTEGER DEFAULT 0, pages INTEGER, readable_pages INTEGER, sha256 TEXT, error TEXT, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)')

    def tearDown(self):
        importer.DATA = self.old_data
        self.temp.cleanup()

    def fixture(self, uid, text_pages):
        row = {'uid': uid, 'title': 'Test manual', 'class': 'Clasa a VI-a', 'subject': 'Fizica', 'publisher': 'Test', 'pdf_url': 'https://manuale.edu.ro/manuale/test.pdf'}
        with importer.db() as conn:
            conn.execute('INSERT INTO documents(uid,metadata) VALUES (?,?)', (uid, json.dumps(row)))
        with pymupdf.open() as pdf:
            for has_text in text_pages:
                page = pdf.new_page()
                if has_text:
                    page.insert_text((50, 50), 'Synthetic educational text repeated to make this page readable. ' * 2)
            pdf.save(importer.DATA / 'pdf' / (uid + '.pdf'))
        return row

    def state(self, uid):
        with importer.db() as conn:
            return dict(conn.execute('SELECT * FROM documents WHERE uid=?', (uid,)).fetchone())

    def test_priorities_and_sources(self):
        self.assertEqual(importer.group('Informatică și TIC in limba sarba'), 'informatica_tic')
        self.assertEqual(importer.group('Tehnologia informatiei si a comunicatiilor'), 'informatica_tic')
        self.assertEqual(importer.group('Matematică și explorarea mediului'), 'matematica')
        self.assertEqual(importer.group('Fizica in limba germana'), 'fizica')
        self.assertEqual(importer.group('Biologie'), 'alte_materii')
        self.assertTrue(importer.official_url('https://manuale.edu.ro/manuale/a.pdf'))
        for url in ('http://manuale.edu.ro/a', 'https://manuale.edu.ro.evil.test/a', 'https://127.0.0.1/a', 'https://secret@manuale.edu.ro/a', 'https://manuale.edu.ro:444/a'):
            self.assertFalse(importer.official_url(url))

    def test_announced_file_over_operator_limit_is_not_downloaded_or_indexed(self):
        row=self.fixture('large', [True])
        (importer.DATA/'pdf/large.pdf').unlink()
        response=MagicMock();response.status_code=200;response.headers={'Content-Length':'21'}
        response.__enter__.return_value=response
        with patch.object(importer,'MAX_PDF_BYTES',20),patch.object(importer,'download_response',return_value=response),patch.object(importer,'api') as api:
            importer.process(row)
        self.assertEqual(self.state('large')['error'],'PDF_TOO_LARGE')
        response.iter_content.assert_not_called();api.assert_not_called()
        self.assertFalse((importer.DATA/'pdf/large.part').exists())

    def test_existing_oversize_original_is_preserved_without_upload(self):
        row=self.fixture('existing-large',[True]);path=importer.DATA/'pdf/existing-large.pdf';original=path.read_bytes()
        with patch.object(importer,'MAX_PDF_BYTES',20),patch.object(importer,'api') as api,patch.object(importer,'CloudLibrary') as cloud:
            importer.process(row)
        self.assertEqual(self.state('existing-large')['error'],'PDF_TOO_LARGE')
        self.assertEqual(path.read_bytes(),original);api.assert_not_called();cloud.assert_not_called()

    def test_unreadable_pdf_never_uploaded(self):
        row = self.fixture('sparse', [True, False, False])
        with patch.object(importer, 'api') as api, contextlib.redirect_stdout(io.StringIO()):
            importer.process(row)
        api.assert_not_called()
        self.assertEqual(self.state('sparse')['status'], 'needs_ocr')
        self.assertEqual(self.state('sparse')['readable_pages'], 1)
        self.assertFalse((importer.DATA / 'text/sparse.txt').exists())

    def test_index_and_resume_without_duplicate(self):
        row = self.fixture('ready', [True, True, True])
        def response(method, path, **kwargs):
            if path == '/files':
                return {'id': 'synthetic-file'}
            if method == 'POST':
                self.assertEqual(kwargs['json']['attributes']['uid'], 'ready')
                return {'id': 'synthetic-file'}
            return {'status': 'completed'}
        with patch.object(importer, 'api', side_effect=response) as api, contextlib.redirect_stdout(io.StringIO()):
            importer.process(row)
            self.assertEqual(api.call_count, 3)
            importer.process(row)
            self.assertEqual(api.call_count, 3)
        self.assertEqual(self.state('ready')['status'], 'indexed')
        self.assertIn('[[PAGE:3]]', (importer.DATA / 'text/ready.txt').read_text())
        self.assertEqual(len(self.state('ready')['sha256']), 64)

    def test_remote_reconciliation_and_safe_progress(self):
        self.fixture('remote-ready', [True])
        self.fixture('missing-remote', [True])
        with importer.db() as conn:
            conn.execute('UPDATE documents SET status="indexed",attached=1 WHERE uid="missing-remote"')
        remote = {'data': [{'id': 'private-provider-id', 'attributes': {'uid': 'remote-ready'}, 'status': 'completed'}], 'has_more': False}
        with patch.object(importer, 'api', return_value=remote), contextlib.redirect_stdout(io.StringIO()):
            importer.reconcile()
        self.assertEqual(self.state('remote-ready')['status'], 'indexed')
        self.assertEqual(self.state('missing-remote')['status'], 'extracted')
        self.assertEqual(self.state('missing-remote')['attached'], 0)
        progress = json.loads((importer.DATA / 'progress.json').read_text())
        self.assertEqual(progress['groups']['fizica']['total'], 2)
        self.assertNotIn('vector_store_id', progress)

    def test_external_redirect_never_requested(self):
        response = MagicMock(status_code=302, headers={'Location': 'https://127.0.0.1/private'})
        with patch.object(importer.requests, 'get', return_value=response) as get:
            with self.assertRaisesRegex(RuntimeError, 'SOURCE_URL_REJECTED'):
                importer.download_response('https://manuale.edu.ro/manuale/test.pdf')
        self.assertEqual(get.call_count, 1)
        self.assertFalse(get.call_args.kwargs['allow_redirects'])

    def test_timeout_does_not_block_or_upload(self):
        row = self.fixture('timeout', [True])
        with patch.object(importer.subprocess, 'run', side_effect=subprocess.TimeoutExpired('extract', 180)), patch.object(importer, 'api') as api, contextlib.redirect_stdout(io.StringIO()):
            importer.process(row)
        api.assert_not_called()
        self.assertEqual(self.state('timeout')['status'], 'needs_ocr')
        self.assertEqual(self.state('timeout')['error'], 'TEXT_EXTRACTION_TIMEOUT')

    def test_queue_retries_network_but_stops_quota(self):
        old_data, old_state = queue.DATA, queue.STATE
        queue.DATA, queue.STATE = importer.DATA, importer.DATA / 'run.json'
        try:
            (importer.DATA / 'last-error.json').write_text(json.dumps({'code': 'API_NETWORK_ERROR'}))
            child = MagicMock(pid=123)
            child.wait.side_effect = [1] + [0] * 8
            with patch.object(queue.subprocess, 'Popen', return_value=child) as spawn, patch.object(queue.subprocess, 'run', return_value=SimpleNamespace(returncode=0)), patch.object(queue.time, 'sleep') as sleep, patch.dict(sys.modules, {'import_manuals': importer}):
                queue.run()
            self.assertEqual(spawn.call_count, 9)
            sleep.assert_called_once_with(30)
            self.assertEqual(json.loads(queue.STATE.read_text())['state'], 'finished_with_report')
            (importer.DATA / 'last-error.json').write_text(json.dumps({'code': 'API_QUOTA'}))
            child.wait.side_effect = [2]
            with patch.object(queue.subprocess, 'Popen', return_value=child) as spawn, patch.object(queue.time, 'sleep') as sleep:
                queue.run()
            self.assertEqual(spawn.call_count, 1)
            sleep.assert_not_called()
            self.assertEqual(json.loads(queue.STATE.read_text())['state'], 'blocked')
        finally:
            queue.DATA, queue.STATE = old_data, old_state


if __name__ == '__main__':
    unittest.main()
