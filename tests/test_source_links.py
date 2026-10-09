import csv,json,tempfile,unittest
from pathlib import Path
from unittest.mock import Mock
import sys
sys.path.insert(0,str(Path(__file__).parents[1]/'scripts'))
import sync_manual_source_links as m
class SourceTests(unittest.TestCase):
 def fixture(self,root):
  (root/'catalog').mkdir();(root/'data/rag/original-recovery').mkdir(parents=True);(root/'data/rag/pdf').mkdir()
  with (root/'catalog/manuale-edu.csv').open('w') as f:
   w=csv.DictWriter(f,fieldnames=['source_id','part','pdf_url']);w.writeheader();w.writerow({'source_id':'642','part':'1','pdf_url':'https://manuale.edu.ro/book.pdf'})
  (root/'data/rag/original-recovery/progress.txt').write_text(json.dumps({'state':'running','manuals':{'642-1':{'status':'over_file_limit','size':20}}}))
  p=root/'data/rag/pdf/642-1.pdf';p.write_bytes(b'%PDF-oversize');return p
 def test_failed_reference_keeps_omitted_original(self):
  from unittest.mock import patch
  with tempfile.TemporaryDirectory() as d,patch.object(m,'LIMIT',4):
   root=Path(d);p=self.fixture(root);client=Mock();client.source_link.side_effect=RuntimeError('SUPABASE_NETWORK_ERROR')
   with self.assertRaises(RuntimeError):m.sync(root,client,{})
   self.assertTrue(p.exists())
 def test_success_deletes_only_known_oversize_not_partial_or_smaller(self):
  from unittest.mock import patch
  with tempfile.TemporaryDirectory() as d,patch.object(m,'LIMIT',4):
   root=Path(d);p=self.fixture(root);partial=p.with_suffix('.part');partial.write_bytes(b'active-download');unknown=p.with_name('unknown.pdf');unknown.write_bytes(b'keep-unknown');small=p.with_name('small.pdf');small.write_bytes(b'ok')
   client=Mock();client.source_link.return_value={'sha256':'verified'};client.manifest.return_value={'sha256':'verified'};done={};m.sync(root,client,done)
   self.assertFalse(p.exists());self.assertTrue(partial.exists());self.assertTrue(unknown.exists());self.assertTrue(small.exists());self.assertEqual(done['642-1']['deleted'][0]['size'],13)
if __name__=='__main__':unittest.main()
