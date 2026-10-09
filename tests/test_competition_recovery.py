import hashlib,io,sys,unittest,zipfile
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parents[1]/'scripts'))
from recover_competition_originals import matching_members
class RecoveryTests(unittest.TestCase):
 def test_archive_recovers_only_exact_original_hash(self):
  original=b'%PDF-original';wanted={hashlib.sha256(original).hexdigest():{'uid':'expected'}};data=io.BytesIO()
  with zipfile.ZipFile(data,'w') as archive:
   archive.writestr('subiect.pdf',original);archive.writestr('another.pdf',b'%PDF-new');archive.writestr('~$temporary.docx',b'junk')
  result=list(matching_members(data.getvalue(),'archive.zip',wanted));self.assertEqual(len(result),1);self.assertEqual(result[0][0]['uid'],'expected');self.assertEqual(result[0][2],original)
 def test_changed_source_is_never_uploaded_as_previous_original(self):
  wanted={hashlib.sha256(b'%PDF-old').hexdigest():{'uid':'old'}}
  self.assertEqual(list(matching_members(b'%PDF-changed','subiect.pdf',wanted)),[])
if __name__=='__main__':unittest.main()
