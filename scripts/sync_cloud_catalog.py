"""Populate server-only Postgres metadata from verified private cloud manifests/checkpoints."""
import argparse,concurrent.futures,json,os,sqlite3
from pathlib import Path
from cloud_library import CloudLibrary,STATE_BUCKET

def upsert(client,table,records,keys):
 for start in range(0,len(records),100):
  batch=records[start:start+100]
  r=client.request('POST','/rest/v1/'+table,json=batch,headers={'Prefer':'resolution=merge-duplicates,return=representation'})
  if not r.ok:raise RuntimeError('POSTGRES_SYNC_'+str(r.status_code))
  saved=r.json()
  if len(saved)!=len(batch):raise RuntimeError('POSTGRES_ROW_COUNT_MISMATCH')
  by_key={tuple(row[k] for k in keys):row for row in saved}
  for row in batch:
   actual=by_key.get(tuple(row[k] for k in keys))
   if not actual or any(actual.get(k)!=v for k,v in row.items()):raise RuntimeError('POSTGRES_ROW_VERIFY_FAILED')

def list_objects(client,prefix):
 def folder(current):
  offset=0;files=[];folders=[]
  while True:
   r=client.request('POST','/storage/v1/object/list/'+STATE_BUCKET,json={'prefix':current,'limit':100,'offset':offset,'sortBy':{'column':'name','order':'asc'}})
   if not r.ok:raise RuntimeError('MANIFEST_LIST_'+str(r.status_code))
   rows=r.json()
   for item in rows:
    key=current+'/'+item['name'] if current else item['name']
    (files if item.get('id') else folders).append(key)
   if len(rows)<100:return files,folders
   offset+=100
 pending=[prefix]
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
  while pending:
   next_folders=[]
   for files,folders in pool.map(folder,pending):
    yield from files;next_folders.extend(folders)
   pending=next_folders

def main():
 p=argparse.ArgumentParser();p.add_argument('--operational-root',required=True,type=Path);p.add_argument('--competition-root',required=True,type=Path);p.add_argument('--family',choices=['manuals','competitions','references']);a=p.parse_args();os.environ['PROFPLUS_OPERATIONAL_ROOT']=str(a.operational_root);c=CloudLibrary()
 preflight=c.request('GET','/rest/v1/library_materials',params={'select':'uid','limit':1})
 if not preflight.ok:raise RuntimeError('POSTGRES_SCHEMA_NOT_READY_'+str(preflight.status_code))
 def material(key):
  parts=key.split('/')
  if len(parts)!=4 or not parts[-1].endswith('.json') or parts[1]=='checkpoints':return None
  r=c.request('GET',c.object_path(STATE_BUCKET,key))
  if not r.ok:raise RuntimeError('MANIFEST_READ_FAILED')
  v=r.json();return {'family':parts[1],'uid':parts[2],'kind':v['kind'],'bucket':v['bucket'],'object_key':v['objectKey'],'sha256':v['sha256'],'size':v['size'],'filename':v['filename'],'metadata':v['metadata']}
 keys=list(list_objects(c,'materials/'+a.family if a.family else 'materials'))
 print(json.dumps({'manifests':len(keys),'phase':'reading_verified_metadata'}),flush=True)
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:materials=[v for v in pool.map(material,keys) if v]
 upsert(c,'library_materials',materials,('family','uid','kind'))
 totals={'materials':len(materials)}
 for family,path,table in [('manuals',a.operational_root/'data/rag/import.sqlite','documents'),('competitions',a.competition_root/'data/competitions/import.sqlite','docs')]:
  if a.family and family!=a.family:continue
  if not path.exists():continue
  conn=sqlite3.connect(f'file:{path}?mode=ro',uri=True);conn.row_factory=sqlite3.Row;rows=[]
  for row in conn.execute('SELECT * FROM '+table):
   value=dict(row);value.pop('path',None)
   if value.get('error')=='PERSONAL_RESULTS_EXCLUDED':value={'uid':row['uid'],'status':'excluded','error':'PERSONAL_RESULTS_EXCLUDED'}
   rows.append({'family':family,'uid':row['uid'],'state':value})
  upsert(c,'library_import_documents',rows,('family','uid'));totals[family]=len(rows)
  if family=='competitions':
   urls=[{'family':family,'url':row['url'],'state':dict(row)} for row in conn.execute('SELECT * FROM urls')];upsert(c,'library_import_urls',urls,('family','url'));totals['urls']=len(urls)
  conn.close()
 print(json.dumps(totals),flush=True)
if __name__=='__main__':
 try:main()
 except Exception as e:print(str(e) if isinstance(e,RuntimeError) else type(e).__name__);raise SystemExit(2)
