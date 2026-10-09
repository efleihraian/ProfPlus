"""Recover missing originals without changing existing AI indexes or import rows."""
import argparse,collections,concurrent.futures,fcntl,hashlib,json,os,sqlite3,threading,time
from pathlib import Path
import import_competitions as importer
from cloud_library import CloudLibrary
LIMIT=50*1024**2

def matching_members(data,name,expected):
 for filename,value in importer.unpack(data,name):
  digest=hashlib.sha256(value).hexdigest()
  if digest in expected:yield expected[digest],filename,value

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--operational-root',type=Path,required=True);parser.add_argument('--workers',type=int,choices=(1,2),default=2);args=parser.parse_args()
 root=args.operational_root.resolve();os.environ['PROFPLUS_OPERATIONAL_ROOT']=str(root)
 folder=root/'data/competitions/original-recovery';folder.mkdir(parents=True,exist_ok=True);importer.DATA=folder
 with (folder/'recovery.lock').open('a') as lock:
  fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB);client=CloudLibrary();known=set();offset=0
  while True:
   r=client.request('GET','/rest/v1/library_materials',params={'select':'uid,kind,metadata','family':'eq.competitions','kind':'in.(original,reference)','order':'uid.asc,kind.asc','limit':1000,'offset':offset})
   if not r.ok:raise RuntimeError('CLOUD_CATALOG_READ_'+str(r.status_code))
   rows=r.json();known.update(row['uid'] for row in rows if row['kind']=='original' or row.get('metadata',{}).get('sourceOnly') is True)
   if len(rows)<1000:break
   offset+=len(rows)
  connection=sqlite3.connect(f'file:{root}/data/competitions/import.sqlite?mode=ro',uri=True);connection.row_factory=sqlite3.Row
  groups=collections.defaultdict(list)
  try:
   for row in connection.execute('SELECT * FROM docs WHERE status="indexed"'):
    if row['uid'] not in known:
     item=dict(row);item['metadata']=json.loads(item['metadata']);groups[item['metadata']['url']].append(item)
  finally:connection.close()
  guard=threading.Lock();stop=threading.Event();results={}
  def report(uid,result):
   with guard:
    results[uid]=result
    summary={'state':'stopped' if stop.is_set() else 'running','pid':os.getpid(),'updated_at':time.time(),'counts':dict(collections.Counter(v['status'] for v in results.values())),'documents':results}
    temp=folder/'progress.tmp';temp.write_text(json.dumps(summary,ensure_ascii=False,indent=2));temp.replace(folder/'progress.txt')
  def recover(group):
   url,items=group
   if stop.is_set():return
   wanted={item['sha']:item for item in items};found=set()
   try:
    _,data,_=importer.fetch(url);name=items[0]['metadata']['archiveMember'].split(' / ')[0]
    for item,filename,value in matching_members(data,name,wanted):
     uid=item['uid'];found.add(uid);metadata=item['metadata']
     if len(value)>LIMIT:
      client.source_link('competitions',uid,{**metadata,'sourceSize':len(value)})
      report(uid,{'status':'source_only_verified','source_url':url,'size':len(value)});continue
     client.assert_library_capacity(len(value))
     path=folder/(uid+Path(filename).suffix.lower());path.write_bytes(value)
     stored=client.archive(path,'competitions',uid,'original',metadata,delete=True)
     report(uid,{'status':'stored_verified','source_url':url,'size':stored['size'],'sha256':stored['sha256']})
    for item in items:
     if item['uid'] not in found:report(item['uid'],{'status':'failed','source_url':url,'error':'SOURCE_CONTENT_CHANGED_OR_MEMBER_MISSING'})
   except Exception as error:
    code=str(error) if isinstance(error,RuntimeError) else type(error).__name__
    if code.startswith(('SUPABASE_','CLOUD_','BUCKET_','IMMUTABLE_','REMOTE_','MANIFEST_')):stop.set()
    for item in items:
     if item['uid'] not in results:report(item['uid'],{'status':'failed','source_url':url,'error':code})
  with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:list(pool.map(recover,groups.items()))
  target=folder/'progress.txt'
  if not target.exists():target.write_text(json.dumps({'documents':{},'counts':{}}))
  summary=json.loads(target.read_text());summary['state']='stopped' if stop.is_set() else 'finished_with_report';target.write_text(json.dumps(summary,ensure_ascii=False,indent=2))
  client.archive(target,'checkpoints','competition-original-recovery','text',delete=False)
  print(json.dumps({'state':summary['state'],'counts':summary['counts'],'pending_groups':len(groups),'known_originals_or_omitted_at_start':len(known)}),flush=True)
  return 2 if stop.is_set() else 0
if __name__=='__main__':raise SystemExit(main())
