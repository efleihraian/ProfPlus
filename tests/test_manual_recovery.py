"""Offline original recovery boundaries; no operational credentials or requests."""
import importlib.util, io, sys, tempfile, unittest
import requests
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from recover_manual_originals import fair_order, download, recover_download

class Response:
    status_code = 200
    def __init__(self, blocks, size=None):
        self.blocks = blocks; self.headers = {} if size is None else {'Content-Length':str(size)}
    def __enter__(self): return self
    def __exit__(self, *args): pass
    def iter_content(self, *args): yield from self.blocks

class RecoveryTests(unittest.TestCase):
    row = {'pdf_url':'https://manuale.edu.ro/official.pdf'}
    def test_subject_and_grade_coverage_precedes_duplicate_publishers(self):
        rows = [{'uid':str(i),'subject':subject,'class':grade} for i,(subject,grade) in enumerate([('Matematică','V'),('Matematica','V'),('Biologie','VI'),('Matematică','VI')])]
        self.assertEqual([r['uid'] for r in fair_order(rows)],['0','2','3','1'])
    def attempt(self, response, limit):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder)/'manual.pdf'
            with patch('recover_manual_originals.download_response', return_value=response):
                result = download(self.row,path,limit)
            return result, path.exists(), path.with_suffix('.part').exists()
    def test_exact_limit_is_downloaded(self):
        result, present, temporary = self.attempt(Response([b'%PDF-12345']),10)
        self.assertEqual(result,{'status':'downloaded','size':10});self.assertTrue(present);self.assertFalse(temporary)
    def test_announced_oversize_never_downloads(self):
        result,present,temporary = self.attempt(Response([b'%PDF-'],11),10)
        self.assertEqual(result,{'status':'over_file_limit','size':11});self.assertFalse(present or temporary)
    def test_chunked_unannounced_oversize_removes_only_partial_file(self):
        result,present,temporary = self.attempt(Response([b'%PDF-',b'123456']),10)
        self.assertEqual(result['status'],'over_file_limit');self.assertEqual(result['size_at_least'],11);self.assertFalse(present or temporary)
    def test_retained_original_cannot_bypass_the_limit(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'manual.pdf';path.write_bytes(b'%PDF-too-large')
            with patch('recover_manual_originals.download') as source:
                result=recover_download(self.row,path,10)
            self.assertEqual(result['status'],'over_file_limit');source.assert_not_called()
            self.assertEqual(path.read_bytes(),b'%PDF-too-large')
    def test_resume_skips_known_oversize_only_for_unchanged_source(self):
        previous={'status':'over_file_limit','size':11,'source_url':self.row['pdf_url']}
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'manual.pdf'
            with patch('recover_manual_originals.download',return_value={'status':'downloaded','size':8}) as source:
                self.assertEqual(recover_download(self.row,path,10,previous),previous)
                source.assert_not_called()
                self.assertEqual(recover_download({'pdf_url':'https://manuale.edu.ro/new.pdf'},path,10,previous)['status'],'downloaded')
                source.assert_called_once()
    def test_html_is_not_stored_as_pdf(self):
        with self.assertRaisesRegex(RuntimeError,'NOT_PDF'):self.attempt(Response([b'<html>error</html>']),100)
    def test_failed_download_preserves_existing_original(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'manual.pdf';path.write_bytes(b'%PDF-original')
            response=Response([]);response.status_code=404
            with patch('recover_manual_originals.download_response',return_value=response),self.assertRaisesRegex(RuntimeError,'DOWNLOAD_HTTP_404'):
                download(self.row,path,100)
            self.assertEqual(path.read_bytes(),b'%PDF-original');self.assertFalse(path.with_suffix('.part').exists())
    def test_source_timeout_is_retried_but_dead_link_is_not(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'manual.pdf'
            with patch('recover_manual_originals.download_response',side_effect=[requests.ConnectTimeout(),Response([b'%PDF-123'])]) as source,patch('recover_manual_originals.time.sleep'):
                self.assertEqual(download(self.row,path,100)['status'],'downloaded')
            self.assertEqual(source.call_count,2)
        response=Response([]);response.status_code=404
        with patch('recover_manual_originals.download_response',return_value=response) as source:
            with self.assertRaisesRegex(RuntimeError,'DOWNLOAD_HTTP_404'):
                with tempfile.TemporaryDirectory() as folder:download(self.row,Path(folder)/'manual.pdf',100)
            self.assertEqual(source.call_count,1)

if __name__ == '__main__':unittest.main()
