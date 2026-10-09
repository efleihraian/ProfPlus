"""Explicit ProfPlus material roots only; no broad home-directory cleanup."""
import argparse,concurrent.futures,json,os,sqlite3,time
from pathlib import Path
from cloud_library import CloudLibrary,STATE_BUCKET,cloud_snapshot

def snapshot(client,path,family):
 target=path.with_suffix('.migration-snapshot')
 source=sqlite3.connect(f'file:{path}?mode=ro',uri=True);dest=sqlite3.connect(target)
 try:source.backup(dest)
 finally:dest.close();source.close()
 data=target.read_bytes()
 try:
  import hashlib
  digest=hashlib.sha256(data).hexdigest();key=f'checkpoints/{family}/{digest}.sqlite';client.verified_put(STATE_BUCKET,key,data)
  client.record('checkpoints',family,'text',{'bucket':STATE_BUCKET,'objectKey':key,'sha256':digest,'size':len(data)})
 finally:target.unlink(missing_ok=True)

def inventory(root,competition,include_pending=False):
 files=[]
 for family,directory,table in [('manuals',root/'data/rag','documents'),('competitions',competition/'data/competitions','docs')]:
  database=directory/'import.sqlite'
  if not database.exists():continue
  c=sqlite3.connect(f'file:{database}?mode=ro',uri=True);c.row_factory=sqlite3.Row
  for row in c.execute('SELECT * FROM '+table):
   uid=row['uid'];metadata=json.loads(row['metadata'])
   # Active imports keep their pending text. Completed files have confirmed remote indexing.
   if (row['status']=='indexed' and (family=='manuals' or not row['old_file_id'])) or (include_pending and row['status'] in ('extracted','uploaded','indexing')):
    p=directory/'text'/f'{uid}.txt'
    if p.exists():files.append((p,family,uid,'text',metadata))
   if family=='manuals':
    p=directory/'pdf'/f'{uid}.pdf'
    if p.exists():files.append((p,family,uid,'original',metadata))
   elif row['error']!='PERSONAL_RESULTS_EXCLUDED':
    for ext in ('.pdf','.doc','.docx','.pptx','.txt'):
     p=directory/(uid+ext)
     if p.exists():files.append((p,family,uid,'original',metadata))
  c.close()
 return files

def main():
 p=argparse.ArgumentParser();p.add_argument('--operational-root',required=True,type=Path);p.add_argument('--competition-root',required=True,type=Path);p.add_argument('--delete-verified',action='store_true');p.add_argument('--limit',type=int,default=0);p.add_argument('--references-root',type=Path);p.add_argument('--include-pending',action='store_true');a=p.parse_args()
 locks=[]
 if a.include_pending:
  import fcntl
  for directory in (a.operational_root/'data/rag',a.competition_root/'data/competitions'):
   handle=(directory/'import.lock').open('a');fcntl.flock(handle,fcntl.LOCK_EX|fcntl.LOCK_NB);locks.append(handle)
 os.environ['PROFPLUS_OPERATIONAL_ROOT']=str(a.operational_root.resolve());client=CloudLibrary();client.ensure_buckets()
 for family,path in [('manuals',a.operational_root/'data/rag/import.sqlite'),('competitions',a.competition_root/'data/competitions/import.sqlite')]:
  if path.exists():cloud_snapshot(path,family)
 files=inventory(a.operational_root,a.competition_root,a.include_pending)
 if a.references_root:
  import hashlib
  for file in sorted(a.references_root.glob('*')):
   if file.is_file() and not file.is_symlink() and file.suffix.lower() in ('.docx','.pdf','.txt','.md'):
    uid='reference-'+hashlib.sha256(file.name.encode()).hexdigest()[:24];files.append((file,'references',uid,'reference',{'title':file.name,'purpose':'import_source_inventory'}))
 files=files[:a.limit] if a.limit else files
 totals={'eligible':len(files),'verified':0,'deletedBytes':0,'errors':0}
 def move(item):
  path,family,uid,kind,metadata=item
  try:return {'uid':uid,'record':client.archive(path,family,uid,kind,metadata,a.delete_verified)}
  except Exception as e:return {'uid':uid,'error':str(e) if isinstance(e,RuntimeError) else type(e).__name__}
 report=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
  for result in pool.map(move,files):
   report.append(result)
   if 'error' in result:print(json.dumps({'uid':result['uid'],'error':result['error']}),flush=True)
   if 'error' in result:totals['errors']+=1
   else:
    totals['verified']+=1
    if a.delete_verified:totals['deletedBytes']+=result['record']['size']
   if len(report)%20==0:print(json.dumps(totals),flush=True)
 payload={'updatedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'totals':totals,'items':report}
 # Durable report in private cloud storage; tiny local status includes no paths/contents/credentials.
 data=json.dumps(payload,ensure_ascii=False).encode();import hashlib
 client.verified_put(STATE_BUCKET,'migrations/'+hashlib.sha256(data).hexdigest()+'.json',data,'application/json')
 (a.operational_root/'data/rag/cloud-migration-status.json').write_text(json.dumps({'updatedAt':payload['updatedAt'],'totals':totals},indent=2))
 print(json.dumps(totals),flush=True)
 if totals['errors']:raise SystemExit(2)
if __name__=='__main__':main()
