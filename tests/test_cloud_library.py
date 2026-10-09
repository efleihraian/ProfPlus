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
if __name__=='__main__':unittest.main()
