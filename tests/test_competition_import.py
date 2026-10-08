import importlib.util,io,unittest,zipfile
from pathlib import Path
spec=importlib.util.spec_from_file_location('importer',Path(__file__).parents[1]/'scripts/import_competitions.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class ImportTests(unittest.TestCase):
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
 def test_docx_no_fabricated_pdf_pages(self):
  b=io.BytesIO()
  with zipfile.ZipFile(b,'w') as z:z.writestr('word/document.xml','<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:r><w:t>'+('exercițiu '*12)+'</w:t></w:r></w:p></w:document>')
  text,pages,readable=m.text_document(b.getvalue(),'subiect.docx');self.assertEqual(pages,0);self.assertTrue(text.startswith('[[PAGE:1]]'))
if __name__=='__main__':unittest.main()
