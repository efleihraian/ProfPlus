"""Finite companion to original recovery: verify source references, remove omitted caches."""
import argparse,csv,fcntl,hashlib,json,os,time
from pathlib import Path
from cloud_library import CloudLibrary
LIMIT=50*1024**2

def sync(root,client,completed):
 data=root/'data/rag/original-recovery'
 progress=json.loads((data/'progress.txt').read_text())
 with (root/'catalog/manuale-edu.csv').open() as handle:
  rows={r['source_id']+'-'+r['part']:r for r in csv.DictReader(handle)}
 candidates={uid for uid,item in progress['manuals'].items() if item['status']=='over_file_limit'}
 caches={}
 for folder in (root/'data/rag/pdf',data):
  for path in folder.glob('*.pdf'):
   if not path.is_symlink() and path.stem in rows and path.stat().st_size>LIMIT:
    candidates.add(path.stem);caches.setdefault(path.stem,[]).append(path)
 for uid in sorted(candidates):
  if uid not in rows:raise RuntimeError('UNKNOWN_MANUAL_KEEPING_COPY')
  if uid not in completed:
   result=progress['manuals'].get(uid,{})
   metadata={**rows[uid]}
   # Persist exact size only if known, otherwise an explicitly labelled lower bound.
   for key in ('size','size_at_least'):
    if key in result:metadata['source_'+key]=result[key]
   reference=client.source_link('manuals',uid,metadata)
   completed[uid]={'source_url':rows[uid]['pdf_url'],'reference_sha256':reference['sha256'],'deleted':[]}
  if caches.get(uid):
   reference=client.manifest('manuals',uid,'reference')
   if not reference or reference.get('sha256')!=completed[uid]['reference_sha256']:raise RuntimeError('MANIFEST_VERIFY_FAILED_KEEPING_COPY')
  for path in caches.get(uid,[]):
   before=path.stat();digest=hashlib.sha256(path.read_bytes()).hexdigest()
   after=path.stat()
   if (before.st_size,before.st_mtime_ns)!=(after.st_size,after.st_mtime_ns):raise RuntimeError('LOCAL_FILE_CHANGED_KEEPING_COPY')
   deletion={'filename':path.name,'size':before.st_size,'sha256':digest,'reason':'USER_AUTHORISED_OVERSIZE_OMISSION','state':'pending_deletion'}
   completed[uid]['deleted'].append(deletion)
   save(data,completed);path.unlink();deletion['state']='deleted'
  save(data,completed)
 return progress

def save(data,completed):
 target=data/'source-links.txt';temp=target.with_suffix('.tmp')
 temp.write_text(json.dumps({'references':completed,'updated_at':time.time()},ensure_ascii=False,indent=2));temp.replace(target)

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--operational-root',type=Path,required=True);parser.add_argument('--follow-active-import',action='store_true');args=parser.parse_args()
 root=args.operational_root.resolve();os.environ['PROFPLUS_OPERATIONAL_ROOT']=str(root);data=root/'data/rag/original-recovery';data.mkdir(parents=True,exist_ok=True)
 with (data/'source-links.lock').open('a') as lock:
  fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
  completed=json.loads((data/'source-links.txt').read_text())['references'] if (data/'source-links.txt').exists() else {}
  client=CloudLibrary()
  while True:
   progress=sync(root,client,completed)
   client.archive(data/'source-links.txt','checkpoints','manual-source-links','text',delete=False)
   print(json.dumps({'verified_source_links':len(completed),'manual_import_state':progress['state']}),flush=True)
   controller=json.loads((data/'controller.json').read_text()) if (data/'controller.json').exists() else {}
   if not args.follow_active_import or controller.get('state')!='running':return 0
   time.sleep(30)
if __name__=='__main__':raise SystemExit(main())
