"""Copy one stopped local D1 database, verify every full row, preserve source."""
import argparse,hashlib,json,os,sqlite3,tempfile
from pathlib import Path
from cloud_library import CloudLibrary,STATE_BUCKET
SPECS={
 'documents':['id','user_id','chat_id','name','mime','size','store_id','file_id','status','created_at'],
 'projects':['id','user_id','name','created_at'],
 'conversations':['id','user_id','title','project_id','deleted','messages','selection','revision','created_at','updated_at'],
 'document_labels':['document_id','user_id','metadata'],
 'account_deletions':['user_id','started_at'],
 'guest_chat_budget':['bucket','used','expires'],
}
def main():
 p=argparse.ArgumentParser();p.add_argument('--operational-root',required=True,type=Path);p.add_argument('--database',required=True,type=Path);a=p.parse_args()
 database=a.database.resolve();root=a.operational_root.resolve()
 if not database.is_relative_to(root/'web/.wrangler/state') or database.suffix!='.sqlite' or a.database.is_symlink():p.error('Select an explicit local ProfPlus D1 cache file.')
 os.environ['PROFPLUS_OPERATIONAL_ROOT']=str(root);client=CloudLibrary()
 conn=sqlite3.connect(f'file:{database}?mode=ro',uri=True);conn.row_factory=sqlite3.Row
 tables={r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
 if 'documents' in tables and conn.execute('SELECT count(*) FROM documents').fetchone()[0]:raise RuntimeError('LOCAL_ORIGINALS_REQUIRE_SEPARATE_TRANSFER')
 with tempfile.TemporaryDirectory(prefix='profplus-app-state-') as directory:
  path=Path(directory)/'snapshot.sqlite';backup=sqlite3.connect(path)
  try:conn.backup(backup)
  finally:backup.close()
  data=path.read_bytes();sha=hashlib.sha256(data).hexdigest();client.verified_put(STATE_BUCKET,'app-state/local-'+sha+'.sqlite',data)
 totals={}
 for table,columns in SPECS.items():
  if table not in tables:continue
  rows=conn.execute('SELECT * FROM '+table).fetchall()
  for source in rows:
   row={key:source[key] for key in columns};params={columns[0]:'eq.'+str(row[columns[0]]),'select':'*'}
   saved=client.request('GET','/rest/v1/'+table,params=params)
   if not saved.ok:raise RuntimeError('LOCAL_MIGRATION_READ_'+str(saved.status_code))
   actual=saved.json()
   if not actual:
    saved=client.request('POST','/rest/v1/'+table,json=row,headers={'Prefer':'return=representation'})
    if not saved.ok:raise RuntimeError('LOCAL_MIGRATION_WRITE_'+str(saved.status_code))
    saved=client.request('GET','/rest/v1/'+table,params=params)
    if not saved.ok:raise RuntimeError('LOCAL_MIGRATION_VERIFY_'+str(saved.status_code))
    actual=saved.json()
   if len(actual)!=1 or any(actual[0].get(key)!=value for key,value in row.items()):raise RuntimeError('LOCAL_MIGRATION_ROW_MISMATCH')
  totals[table]=len(rows)
 conn.close();print(json.dumps({'verified':True,'counts':totals,'sourcePreserved':True}))
if __name__=='__main__':
 try:main()
 except RuntimeError as e:print(str(e));raise SystemExit(2)
