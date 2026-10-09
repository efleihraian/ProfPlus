import json,sqlite3,sys,tempfile,unittest
from pathlib import Path
from unittest.mock import Mock
sys.path.insert(0,str(Path(__file__).parents[1]/'scripts'))
import omit_failed_materials as m
class OmissionTests(unittest.TestCase):
 def item(self):return {'family':'manuals','uid':'book','metadata':{'pdf_url':'https://manuale.edu.ro/book.pdf'},'error':'ConnectionError','origins':['manual-original']}
 def fixture(self,root):
  p=root/'data/rag/original-recovery/book.pdf';p.parent.mkdir(parents=True);p.write_bytes(b'%PDF-failed');return p
 def test_cloud_failure_preserves_local_material(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);p=self.fixture(root);client=Mock();client.source_link.side_effect=RuntimeError('SUPABASE_NETWORK_ERROR')
   with self.assertRaises(RuntimeError):m.omit(root,client,self.item(),{},lambda:None)
   self.assertTrue(p.exists())
 def test_reference_verified_before_exact_failed_cache_deleted(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);p=self.fixture(root);active=p.with_suffix('.part');active.write_bytes(b'active');other=p.with_name('other.pdf');other.write_bytes(b'keep')
   client=Mock();client.source_link.return_value={'sha256':'verified'};journal={}
   client.source_link.side_effect=lambda *a,**kw:({'sha256':'verified'} if p.exists() else self.fail('Deleted before verification'))
   result=m.omit(root,client,self.item(),journal,lambda:None)
   self.assertFalse(p.exists());self.assertTrue(active.exists());self.assertTrue(other.exists());self.assertEqual(result['state'],'omitted');self.assertEqual(result['deleted'][0]['state'],'deleted');self.assertEqual(client.source_link.call_args.kwargs['reason'],'IMPORT_FAILED')
 def test_symlink_target_never_deleted(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);p=self.fixture(root);p.unlink();target=root/'keep.pdf';target.write_bytes(b'keep');p.symlink_to(target);client=Mock();client.source_link.return_value={'sha256':'verified'}
   with self.assertRaises(RuntimeError):m.omit(root,client,self.item(),{},lambda:None)
   self.assertTrue(target.exists());self.assertTrue(p.is_symlink())
 def test_failed_states_omitted_but_successful_index_preserved(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);folder=root/'data/rag';folder.mkdir(parents=True);conn=sqlite3.connect(folder/'import.sqlite');conn.execute('CREATE TABLE documents(uid,status,error)');conn.executemany('INSERT INTO documents VALUES(?,?,?)',[('book','failed','NOT_PDF'),('successful','indexed',None)]);conn.commit();conn.close()
   journal={'manuals/book':{'family':'manuals','uid':'book','state':'omitted','origins':[]},'manuals/successful':{'family':'manuals','uid':'successful','state':'omitted','origins':[]}}
   m.apply_states(root,journal);conn=sqlite3.connect(folder/'import.sqlite');self.assertEqual(conn.execute('SELECT status FROM documents WHERE uid="book"').fetchone()[0],'omitted');self.assertEqual(conn.execute('SELECT status FROM documents WHERE uid="successful"').fetchone()[0],'indexed');conn.close()
 def test_excluded_results_and_temporary_word_metadata_ignored(self):
  self.assertTrue(m.ignored({'archiveMember':'source / names.pdf'},'PERSONAL_RESULTS_EXCLUDED'));self.assertTrue(m.ignored({'archiveMember':'folder/~$temporary.docx'},'BadZipFile'));self.assertTrue(m.ignored({'archiveMember':'folder/._enunt.docx'},'BadZipFile'));self.assertFalse(m.ignored({'archiveMember':'subiect.pdf'},'NOT_PDF'))
if __name__=='__main__':unittest.main()
