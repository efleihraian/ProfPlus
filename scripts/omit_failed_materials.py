"""Omit failed public materials: verified cloud reference first, bounded cache deletion second."""
import argparse,collections,concurrent.futures,csv,fcntl,hashlib,json,os,re,sqlite3,time
from contextlib import ExitStack
from pathlib import Path
from cloud_library import CloudLibrary,cloud_snapshot
ERROR='IMPORT_FAILED_OMITTED'

def read(path,default=None):return json.loads(path.read_text()) if path.exists() else (default or {})
def write(path,value):
 path.parent.mkdir(parents=True,exist_ok=True);temp=path.with_suffix('.tmp');temp.write_text(json.dumps(value,ensure_ascii=False,indent=2));temp.replace(path)
def rows(path,query):
 if not path.exists():return []
 conn=sqlite3.connect(path,timeout=30);conn.row_factory=sqlite3.Row
 try:return [dict(r) for r in conn.execute(query)]
 finally:conn.close()
def ignored(metadata,error):
 name=Path(metadata.get('archiveMember','').replace('\\','/')).name
 return error=='PERSONAL_RESULTS_EXCLUDED' or name.startswith(('~$','._'))

def collect(root):
 items={}
 def add(family,uid,metadata,error,origin):
  if ignored(metadata,error):return
  key=family+'/'+uid
  if key not in items:items[key]={'family':family,'uid':uid,'metadata':metadata,'error':error,'origins':[]}
  items[key]['origins'].append(origin)
 with (root/'catalog/manuale-edu.csv').open() as handle:catalog={r['source_id']+'-'+r['part']:r for r in csv.DictReader(handle)}
 for uid,result in read(root/'data/rag/original-recovery/progress.txt').get('manuals',{}).items():
  if result['status']=='failed':add('manuals',uid,catalog[uid],result.get('error','IMPORT_ERROR'),'manual-original')
 for row in rows(root/'data/rag/import.sqlite','SELECT * FROM documents WHERE status="failed"'):
  add('manuals',row['uid'],json.loads(row['metadata']),row.get('error'),'manual-index')
 for row in rows(root/'data/competitions/import.sqlite','SELECT * FROM docs WHERE status="failed"'):
  add('competitions',row['uid'],json.loads(row['metadata']),row.get('error'),'competition-document')
 by_uid={r['uid']:r for r in rows(root/'data/competitions/import.sqlite','SELECT * FROM docs')}
 for uid,result in read(root/'data/competitions/original-recovery/progress.txt').get('documents',{}).items():
  if result['status']=='failed' and uid in by_uid:
   add('competitions',uid,json.loads(by_uid[uid]['metadata']),result.get('error'),'competition-original')
 seeds={s['id']:s for s in read(root/'catalog/competition-archives.json',[])}
 for row in rows(root/'data/competitions/import.sqlite','SELECT * FROM urls WHERE status="failed"'):
  seed=seeds[row['seed']];uid='source-'+hashlib.sha256(row['url'].encode()).hexdigest()[:24]
  add('competitions',uid,{'url':row['url'],'title':row['label'] or seed['title'],'category':seed['category'],'archiveId':seed['id']},row.get('error'),'competition-url')
 return items

def cache_paths(root,item):
 family,uid=item['family'],item['uid']
 if not re.fullmatch(r'[A-Za-z0-9_-]{1,160}',uid):raise RuntimeError('MATERIAL_KEY_REJECTED')
 folders=('data/rag/pdf','data/rag/text','data/rag/original-recovery') if family=='manuals' else ('data/competitions','data/competitions/text','data/competitions/original-recovery')
 return [root/folder/(uid+ext) for folder in folders for ext in ('.pdf','.doc','.docx','.pptx','.txt','.html','.zip','.rar')]

def prepare_reference(client,item):
 return client.source_link(item['family'],item['uid'],{**item['metadata'],'importError':item['error'] or 'IMPORT_ERROR'},reason='IMPORT_FAILED')

def omit(root,client,item,journal,save,reference=None):
 # source_link verifies object bytes, manifest and PostgreSQL before it returns.
 metadata={**item['metadata'],'importError':item['error'] or 'IMPORT_ERROR'}
 if reference is None:reference=prepare_reference(client,item)
 result={'family':item['family'],'uid':item['uid'],'origins':item['origins'],'error':item['error'],'source_url':metadata.get('pdf_url') or metadata.get('url'),'reference_sha256':reference['sha256'],'state':'reference_verified','deleted':[]}
 journal[item['family']+'/'+item['uid']]=result;save()
 for path in cache_paths(root,item):
  if not path.exists():continue
  if path.is_symlink() or not path.is_file() or not path.resolve().is_relative_to(root.resolve()):raise RuntimeError('LOCAL_FILE_REJECTED_KEEPING_COPY')
  before=path.stat();digest=hashlib.sha256(path.read_bytes()).hexdigest();after=path.stat()
  if (before.st_size,before.st_mtime_ns)!=(after.st_size,after.st_mtime_ns):raise RuntimeError('LOCAL_FILE_CHANGED_KEEPING_COPY')
  deletion={'filename':str(path.relative_to(root)),'sha256':digest,'size':before.st_size,'state':'pending_deletion'}
  result['deleted'].append(deletion);save();path.unlink();deletion['state']='deleted';save()
 result['state']='omitted';save();return result

def apply_states(root,journal):
 completed=[v for v in journal.values() if v['state']=='omitted']
 for rel,table,family,status in [('data/rag/import.sqlite','documents','manuals','omitted'),('data/competitions/import.sqlite','docs','competitions','skipped')]:
  if not (root/rel).exists():continue
  conn=sqlite3.connect(root/rel,timeout=30)
  try:
   for item in completed:
    if item['family']==family:
     conn.execute('UPDATE '+table+' SET status=?,error=? WHERE uid=? AND status="failed"',(status,ERROR,item['uid']))
     if family=='competitions' and 'competition-url' in item['origins']:
      conn.execute('UPDATE urls SET status="skipped",error=? WHERE url=? AND status="failed"',(ERROR,item['source_url']))
   conn.commit()
  finally:conn.close()
 for rel,key,origin in [('data/rag/original-recovery/progress.txt','manuals','manual-original'),('data/competitions/original-recovery/progress.txt','documents','competition-original')]:
  path=root/rel;progress=read(path)
  if not progress:continue
  changed=False
  for item in completed:
   if origin in item['origins'] and progress[key].get(item['uid'],{}).get('status')=='failed':
    progress[key][item['uid']].update(status='omitted_failed',reference_sha256=item['reference_sha256'],source_url=item['source_url']);changed=True
  if changed:
   progress['counts']=dict(collections.Counter(v['status'] for v in progress[key].values()));write(path,progress)
   remaining=path.parent/'remaining.csv'
   if origin=='manual-original' and remaining.exists():
    with remaining.open() as handle:reader=csv.DictReader(handle);fields=reader.fieldnames;entries=list(reader)
    for entry in entries:
     current=progress[key].get(entry['uid'],{})
     if current.get('status')=='omitted_failed':entry['status']='omitted_failed'
    temporary=remaining.with_suffix('.tmp')
    with temporary.open('w') as handle:writer=csv.DictWriter(handle,fieldnames=fields);writer.writeheader();writer.writerows(entries)
    temporary.replace(remaining)

def active(root):
 controller=read(root/'data/competitions/run.json');pid=controller.get('pid')
 if controller.get('state')!='running' or not pid:return False
 try:os.kill(int(pid),0);return True
 except ProcessLookupError:return False

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--operational-root',type=Path,required=True);parser.add_argument('--follow-active-import',action='store_true');args=parser.parse_args()
 root=args.operational_root.resolve();os.environ['PROFPLUS_OPERATIONAL_ROOT']=str(root);folder=root/'data/cleanup';folder.mkdir(parents=True,exist_ok=True)
 with ExitStack() as locks:
  for relative in ('data/rag/import.lock','data/rag/original-recovery/recovery.lock','data/competitions/original-recovery/recovery.lock'):
   path=root/relative;path.parent.mkdir(parents=True,exist_ok=True);guard=locks.enter_context(path.open('a'));fcntl.flock(guard,fcntl.LOCK_EX|fcntl.LOCK_NB)
  lock=locks.enter_context((folder/'omit-failed.lock').open('a'))
  fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB);target=folder/'failed-materials.txt';journal=read(target).get('materials',{});client=CloudLibrary()
  def save():write(target,{'updated_at':time.time(),'materials':journal})
  first=True
  while True:
   running_at_start=active(root)
   items=collect(root)
   pending=[(key,item) for key,item in items.items() if journal.get(key,{}).get('state')!='omitted']
   with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    references=pool.map(lambda pair:prepare_reference(client,pair[1]),pending)
    for (key,item),reference in zip(pending,references):
     omit(root,client,item,journal,save,reference);apply_states(root,{key:journal[key]})
   if pending or first:
    apply_states(root,journal);save()
    client.archive(target,'checkpoints','omitted-failed-materials','text',delete=False)
    print(json.dumps({'omitted':sum(v['state']=='omitted' for v in journal.values()),'deleted_files':sum(len(v['deleted']) for v in journal.values())}),flush=True)
    first=False
   if not args.follow_active_import or not running_at_start:
    for family in ('manuals','competitions'):
     database=root/('data/rag/import.sqlite' if family=='manuals' else 'data/competitions/import.sqlite')
     if database.exists():cloud_snapshot(database,family)
    return 0
   time.sleep(30)
if __name__=='__main__':raise SystemExit(main())
