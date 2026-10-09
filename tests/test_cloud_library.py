import sys,tempfile,unittest,hashlib
from pathlib import Path
from unittest.mock import patch,Mock
sys.path.insert(0,str(Path(__file__).parents[1]/'scripts'))
from cloud_library import CloudLibrary
class CloudTests(unittest.TestCase):
 def client(self):
  with patch('cloud_library.settings',return_value=('https://project.supabase.co','server-test')):return CloudLibrary()
 def test_verified_copy_is_deleted_only_after_manifest(self):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d)/'book.txt';p.write_text('material');c=self.client()
   with patch.object(c,'verified_put'),patch.object(c,'record') as record:
    result=c.archive(p,'manuals','book','text',delete=True);record.assert_called_once();self.assertFalse(p.exists());self.assertEqual(result['sha256'],hashlib.sha256(b'material').hexdigest())
 def test_failed_upload_keeps_local_copy(self):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d)/'book.txt';p.write_text('material');c=self.client()
   with patch.object(c,'verified_put',side_effect=RuntimeError('REMOTE_HASH_MISMATCH')):
    with self.assertRaisesRegex(RuntimeError,'REMOTE_HASH_MISMATCH'):c.archive(p,'manuals','book','text',delete=True)
   self.assertTrue(p.exists())
 def test_failed_manifest_keeps_local_copy(self):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d)/'book.txt';p.write_text('material');c=self.client()
   with patch.object(c,'verified_put'),patch.object(c,'record',side_effect=RuntimeError('MANIFEST_VERIFY_FAILED')):
    with self.assertRaises(RuntimeError):c.archive(p,'manuals','book','text',delete=True)
   self.assertTrue(p.exists())
 def test_changed_file_not_deleted(self):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d)/'book.txt';p.write_text('material');c=self.client()
   with patch.object(c,'verified_put'),patch.object(c,'record',side_effect=lambda *args:p.write_text('changed')):
    with self.assertRaisesRegex(RuntimeError,'LOCAL_FILE_CHANGED'):c.archive(p,'manuals','book','text',delete=True)
   self.assertEqual(p.read_text(),'changed')
 def test_symlink_and_unknown_files_rejected(self):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d)/'settings.env';p.write_text('secret');link=Path(d)/'alias.txt';link.symlink_to(p);c=self.client()
   for file in (p,link):
    with self.assertRaises(RuntimeError):c.archive(file,'manuals','book','text',delete=True)
   self.assertTrue(p.exists())
 def test_restore_invalid_bytes_never_writes_file(self):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d)/'book.txt';c=self.client()
   with patch.object(c,'manifest',return_value={'bucket':'profplus-library','objectKey':'manuals/book/text/hash.txt','sha256':hashlib.sha256(b'good').hexdigest(),'size':4}),patch.object(c,'request',return_value=Mock(ok=True,content=b'bad')):
    with self.assertRaisesRegex(RuntimeError,'RESTORE_HASH_MISMATCH'):c.restore(p,'manuals','book','text')
   self.assertFalse(p.exists())
 def test_resumable_upload_reconciles_ambiguous_patch(self):
  c=self.client();reply=lambda **kwargs:Mock(**kwargs)
  with patch.object(c,'request',side_effect=[reply(ok=True,headers={'Location':'https://project.storage.supabase.co/storage/v1/upload/resumable/fixture'}),RuntimeError('SUPABASE_NETWORK_ERROR'),reply(ok=True,headers={'Upload-Offset':'4'})]) as call:
   c.resumable_put('profplus-library','manuals/book/original/hash.pdf',b'book','application/pdf')
   self.assertEqual([v.args[0] for v in call.call_args_list],['POST','PATCH','HEAD'])
 def test_resumable_location_cannot_send_key_to_another_host(self):
  c=self.client()
  with patch.object(c,'request',return_value=Mock(ok=True,headers={'Location':'https://untrusted.example/storage/v1/upload/resumable/fixture'})) as call:
   with self.assertRaisesRegex(RuntimeError,'UNSAFE_RESUMABLE_LOCATION'):c.resumable_put('profplus-library','book',b'book','application/pdf')
   self.assertEqual(call.call_count,1)
 def test_restart_gateway_error_is_retried_without_revealing_credentials(self):
  c=self.client();session=Mock();session.request.side_effect=[Mock(status_code=544),Mock(status_code=200)]
  c.connections.session=session
  with patch('cloud_library.time.sleep') as sleep:
   self.assertEqual(c.request('GET','/rest/v1/library_materials').status_code,200)
  self.assertEqual(session.request.call_count,2);sleep.assert_called_once()
 def test_file_limit_error_is_not_retried(self):
  c=self.client();session=Mock();session.request.return_value=Mock(status_code=413);c.connections.session=session
  with patch('cloud_library.time.sleep') as sleep:
   self.assertEqual(c.request('POST','/storage/v1/upload/resumable').status_code,413)
  self.assertEqual(session.request.call_count,1);sleep.assert_not_called()
 def test_cloud_omission_catalog_is_used_after_fresh_checkout(self):
  c=self.client()
  with patch.object(c,'request',return_value=Mock(ok=True,json=lambda:[{'uid':'omitted-book'}])) as request:
   self.assertEqual(c.omitted_uids('manuals'),{'omitted-book'})
  self.assertEqual(request.call_args.kwargs['params']['metadata->>omissionReason'],'eq.IMPORT_FAILED')
 def test_import_failure_reference_is_not_labelled_oversized(self):
  c=self.client()
  with patch.object(c,'verified_put'),patch.object(c,'record'):
   item=c.source_link('manuals','book',{'pdf_url':'https://manuale.edu.ro/book.pdf','importError':'NOT_PDF'},reason='IMPORT_FAILED')
  self.assertEqual(item['metadata']['omissionReason'],'IMPORT_FAILED');self.assertNotIn('fileLimitBytes',item['metadata']);self.assertEqual(item['kind'],'reference')
 def test_capacity_failure_stops_before_upload(self):
  c=self.client()
  with patch.object(c,'request',return_value=Mock(ok=True,json=lambda:[{'size':74*1000**3}])):
   with self.assertRaisesRegex(RuntimeError,'CLOUD_LIBRARY_BUDGET_REACHED'):c.assert_library_capacity(1)
 def test_source_reference_is_not_an_original(self):
  c=self.client()
  with patch.object(c,'verified_put') as upload,patch.object(c,'record') as record:
   value=c.source_link('manuals','642-1',{'pdf_url':'https://manuale.edu.ro/book.pdf','source_size':203324862})
  self.assertEqual(value['kind'],'reference');self.assertTrue(value['metadata']['sourceOnly']);self.assertLess(value['size'],1000)
  self.assertEqual(record.call_args.args[2],'reference');self.assertIn('/reference/',upload.call_args.args[1])
 def test_reference_rejects_credentials_and_unsafe_identity_before_upload(self):
  c=self.client()
  with patch.object(c,'verified_put') as upload:
   for uid,url in [('ok','file:///tmp/book'),('ok','https://user:password@example.org/book'),('../bad','https://manuale.edu.ro/book')]:
    with self.assertRaises(RuntimeError):c.source_link('manuals',uid,{'pdf_url':url})
  upload.assert_not_called()
if __name__=='__main__':unittest.main()
