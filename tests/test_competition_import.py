import importlib.util,io,unittest,zipfile,tempfile,json
from unittest.mock import patch
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).parents[1]/'scripts'))
spec=importlib.util.spec_from_file_location('importer',Path(__file__).parents[1]/'scripts/import_competitions.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class ImportTests(unittest.TestCase):
 def setUp(self):
  cloud=patch.object(m,'cloud_active',return_value=False);cloud.start();self.addCleanup(cloud.stop)
 def test_external_private_rejected(self):
  self.assertFalse(m.public_url('https://127.0.0.1/doc.pdf'));self.assertFalse(m.public_url('file:///tmp/file'));self.assertFalse(m.public_url('https://u:p@example.org/file'))
 def test_results_excluded(self):
  seed={'url':'https://isj.example/olimpiade'}
  self.assertEqual(m.eligible('https://isj.example/rezultate.pdf','Rezultate finale',seed,seed['url']),(False,'personal_results'))
 def test_scoped_links(self):
  seed={'url':'https://isj.example/olimpiade'}
  self.assertTrue(m.eligible('https://cdn.example/subiect.pdf','Subiect',seed,seed['url'])[0])
  self.assertFalse(m.eligible('https://elsewhere.example/olimpiade','Olimpiade',seed,seed['url'])[0])
 def test_zip_members_only_documents(self):
  b=io.BytesIO()
  with zipfile.ZipFile(b,'w') as z:
   z.writestr('../statement.pdf',b'%PDF-fixture');z.writestr('resultate.txt','names');z.writestr('rezultate.pdf',b'%PDF-names');z.writestr('program.exe',b'code')
  items=list(m.unpack(b.getvalue(),'archive.zip'));self.assertEqual(len(items),1);self.assertEqual(items[0][1],b'%PDF-fixture')
 def test_bomb_rejected(self):
  b=io.BytesIO()
  with zipfile.ZipFile(b,'w',compression=zipfile.ZIP_DEFLATED) as z:z.writestr('statement.pdf',b'0'*1000000)
  with self.assertRaisesRegex(RuntimeError,'ARCHIVE_SIZE_REJECTED'):list(m.unpack(b.getvalue(),'archive.zip'))
 def test_classification_without_guessed_year(self):
  seed={'id':'archive-14','title':'COMPER','category':'competition'}
  r=m.metadata('subiect.pdf','Matematică clasa a V-a',seed,'https://example.org/2025/file.pdf');self.assertEqual(r['category'],'competition');self.assertEqual(r['subject'],'Matematică');self.assertEqual(r['years'],[]);self.assertEqual(r['stages'],['middle'])
 def test_repeated_page_markers(self):
  value='[[PAGE:7]]\n'+('cuvant '*800)
  result=m.marked_chunks(value);self.assertGreater(result.count('[[PAGE:7]]'),4);self.assertEqual(result.replace('[[PAGE:7]]','').split(),value.replace('[[PAGE:7]]','').split())
 def test_new_document_has_markers_in_long_page(self):
  with tempfile.TemporaryDirectory() as directory,patch.object(m,'DATA',Path(directory)),patch.object(m,'text_document',return_value=('[[PAGE:7]]\n'+('cuvant '*800),7,7)):
   c=m.db();seed={'id':'test','title':'Olimpiada de matematică','category':'olympiad'}
   m.add_document(c,b'fixture','subiect.pdf',seed,'https://example.org/subiect.pdf')
   row=c.execute('SELECT * FROM docs').fetchone();self.assertGreater(Path(row['path']).read_text().count('[[PAGE:7]]'),4);self.assertEqual(json.loads(row['metadata'])['textChunkVersion'],3);c.close()
 def test_repair_preserves_old_attachment_until_replacement(self):
  with tempfile.TemporaryDirectory() as directory,patch.object(m,'DATA',Path(directory)):
   c=m.db();p=Path(directory)/'text.txt';p.write_text('[[PAGE:2]]\n'+('cuvant '*800))
   c.execute('INSERT INTO docs(uid,metadata,sha,path,status,file_id,attached) VALUES(?,?,?,?,?,?,1)',('test',json.dumps({'textChunkVersion':2}),'test',str(p),'indexed','old'));c.commit()
   m.repair_chunks(c);row=c.execute('SELECT * FROM docs').fetchone();self.assertEqual(row['old_file_id'],'old');self.assertIsNone(row['file_id']);self.assertEqual(row['status'],'extracted');self.assertGreater(p.read_text().count('[[PAGE:2]]'),4);c.close()
 def test_cleanup_can_resume_without_reindexing(self):
  with tempfile.TemporaryDirectory() as directory,patch.object(m,'DATA',Path(directory)):
   c=m.db();c.execute('INSERT INTO docs(uid,metadata,sha,status,file_id,old_file_id) VALUES(?,?,?,?,?,?)',('test','{}','test','indexed','new','old'));c.commit()
   with patch.object(m,'api',side_effect=RuntimeError('API_TEMPORARY_FAILURE')):m.cleanup_replaced(c,'store')
   self.assertEqual(c.execute('SELECT old_file_id FROM docs').fetchone()[0],'old')
   with patch.object(m,'api',return_value={}) as api:m.cleanup_replaced(c,'store');self.assertEqual(api.call_count,2)
   row=c.execute('SELECT * FROM docs').fetchone();self.assertIsNone(row['old_file_id']);self.assertEqual(row['file_id'],'new');self.assertEqual(row['status'],'indexed');c.close()
 def test_docx_no_fabricated_pdf_pages(self):
  b=io.BytesIO()
  with zipfile.ZipFile(b,'w') as z:z.writestr('word/document.xml','<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:r><w:t>'+('exercițiu '*12)+'</w:t></w:r></w:p></w:document>')
  text,pages,readable=m.text_document(b.getvalue(),'subiect.docx');self.assertEqual(pages,0);self.assertTrue(text.startswith('[[PAGE:1]]'))
 def test_oversize_is_skipped_before_extraction_and_original_upload(self):
  with tempfile.TemporaryDirectory() as directory,patch.object(m,'DATA',Path(directory)),patch.object(m,'MAX_DOCUMENT',4),patch.object(m,'cloud_active',return_value=True),patch.object(m,'CloudLibrary') as cloud,patch.object(m,'text_document') as extract:
   c=m.db();seed={'id':'test','title':'Olimpiada','category':'olympiad'}
   m.add_document(c,b'%PDF-large','subiect.pdf',seed,'https://example.org/subiect.pdf')
   row=c.execute('SELECT * FROM docs').fetchone();self.assertEqual(row['status'],'skipped');self.assertEqual(row['error'],'DOCUMENT_TOO_LARGE');self.assertIsNone(row['path'])
   extract.assert_not_called();cloud.return_value.archive.assert_not_called();cloud.return_value.source_link.assert_called_once();c.close()
 def test_office_lock_members_are_ignored(self):
  b=io.BytesIO()
  with zipfile.ZipFile(b,'w') as z:z.writestr('folder/~$subiect.docx',b'invalid');z.writestr('__MACOSX/._subiect.docx',b'junk');z.writestr('subiect.pdf',b'%PDF-fixture')
  self.assertEqual(len(list(m.unpack(b.getvalue(),'archive.zip'))),1)
 def test_index_failure_becomes_terminal_and_is_not_retried(self):
  with tempfile.TemporaryDirectory() as directory,patch.object(m,'DATA',Path(directory)/'competitions'),patch.object(m,'OPERATIONAL',Path(directory)),patch.object(m,'export',return_value={'counts':{}}):
   store=Path(directory)/'data/rag';store.mkdir(parents=True);(store/'store.json').write_text(json.dumps({'vector_store_id':'fixture'}));c=m.db();text=Path(directory)/'text.txt';text.write_text('fixture')
   c.execute('INSERT INTO docs(uid,metadata,sha,path) VALUES(?,?,?,?)',('test',json.dumps({'url':'https://example.org/subiect.pdf'}),'test',str(text)));c.commit()
   with patch.object(m,'api',side_effect=RuntimeError('API_TEMPORARY_FAILURE')):m.index(c,'test')
   row=c.execute('SELECT * FROM docs').fetchone();self.assertEqual(row['status'],'failed');self.assertEqual(row['error'],'API_TEMPORARY_FAILURE')
   with patch.object(m,'api') as api:m.index(c,'test');api.assert_not_called()
   self.assertTrue(text.exists());c.close()
 def test_failed_extraction_does_not_leave_original_cache(self):
  with tempfile.TemporaryDirectory() as directory,patch.object(m,'DATA',Path(directory)),patch.object(m,'cloud_active',return_value=True),patch.object(m,'text_document',side_effect=RuntimeError('INVALID_DOCUMENT')):
   c=m.db();m.add_document(c,b'invalid','subiect.docx',{'id':'test','title':'Olimpiada','category':'olympiad'},'https://example.org/subiect.docx')
   self.assertEqual(list(Path(directory).glob('*.docx')),[]);c.close()
if __name__=='__main__':unittest.main()
