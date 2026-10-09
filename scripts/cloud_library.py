"""Private Supabase objects; delete a local copy only after byte-for-byte verification."""
import hashlib,json,os,re,time,threading
from pathlib import Path
from urllib.parse import quote,urlsplit,urljoin
import requests
BUCKET='profplus-library'
STATE_BUCKET='profplus-import-state'
PRIVATE_BUCKET='profplus-private-documents'

def settings():
 root=Path(os.environ.get('PROFPLUS_OPERATIONAL_ROOT',Path(__file__).resolve().parents[1]))
 values={}
 for p in (root/'.env',root/'web/.dev.vars'):
  if p.exists():
   for line in p.read_text().splitlines():
    if '=' in line and not line.startswith('#'):
     k,v=line.split('=',1);values[k]=v.strip().strip('"').strip("'")
 values.update({k:v for k,v in os.environ.items() if k.startswith('SUPABASE_')})
 url=values.get('SUPABASE_URL','').rstrip('/');key=values.get('SUPABASE_SECRET_KEY','')
 parsed=urlsplit(url)
 if parsed.scheme!='https' or not parsed.hostname or not parsed.hostname.endswith('.supabase.co') or parsed.username or parsed.password or not key:raise RuntimeError('SUPABASE_STORAGE_NOT_CONFIGURED')
 return url,key

class CloudLibrary:
 def __init__(self):self.url,self.key=settings();self.connections=threading.local()
 def request(self,method,path,**kw):
  headers={'apikey':self.key,**kw.pop('headers',{})}
  destination=self.url.replace('.supabase.co','.storage.supabase.co') if path.startswith('/storage/') else self.url
  if not hasattr(self.connections,'session'):self.connections.session=requests.Session()
  for attempt in range(7):
   try:r=self.connections.session.request(method,destination+path,headers=headers,timeout=(15,120),allow_redirects=False,**kw)
   except requests.RequestException:
    if attempt==6:raise RuntimeError('SUPABASE_NETWORK_ERROR') from None
    time.sleep(min(2**attempt,30));continue
   if r.status_code!=429 and not 500<=r.status_code<600:return r
   r.close();time.sleep(min(2**attempt,30))
  raise RuntimeError('SUPABASE_RETRY_EXHAUSTED')
 def ensure_buckets(self):
  for name in (BUCKET,STATE_BUCKET,PRIVATE_BUCKET):
   r=self.request('GET','/storage/v1/bucket/'+name)
   if r.status_code==404 or (r.status_code==400 and r.json().get('error')=='Bucket not found'):
    r=self.request('POST','/storage/v1/bucket',json={'id':name,'name':name,'public':False})
   if not r.ok:raise RuntimeError('SUPABASE_BUCKET_'+str(r.status_code))
   check=self.request('GET','/storage/v1/bucket/'+name)
   if not check.ok or check.json().get('public') is not False:raise RuntimeError('BUCKET_MUST_BE_PRIVATE')
 def object_path(self,bucket,key):
  if bucket not in (BUCKET,STATE_BUCKET,PRIVATE_BUCKET) or not key or any(x in ('','..','.') for x in key.split('/')):raise RuntimeError('UNSAFE_OBJECT_PATH')
  return '/storage/v1/object/'+bucket+'/'+quote(key,safe='/')
 def resumable_put(self,bucket,key,data,mime):
  import base64
  metadata={'bucketName':bucket,'objectName':key,'contentType':mime,'cacheControl':'3600'}
  headers={'Tus-Resumable':'1.0.0','Upload-Length':str(len(data)),'Upload-Metadata':','.join(k+' '+base64.b64encode(v.encode()).decode() for k,v in metadata.items()),'x-upsert':'false'}
  r=self.request('POST','/storage/v1/upload/resumable',headers=headers,data=b'')
  if not r.ok:raise RuntimeError('SUPABASE_RESUMABLE_CREATE_'+str(r.status_code))
  origin=self.url.replace('.supabase.co','.storage.supabase.co');location=urlsplit(urljoin(origin,r.headers.get('Location','')))
  if location.scheme!='https' or location.netloc!=urlsplit(origin).netloc or not location.path.startswith('/storage/v1/upload/resumable/') or location.username or location.password:raise RuntimeError('UNSAFE_RESUMABLE_LOCATION')
  path=location.path+('?' + location.query if location.query else '');offset=0;stalls=0
  while offset<len(data):
   chunk=data[offset:offset+6*1024*1024]
   try:r=self.request('PATCH',path,data=chunk,headers={'Tus-Resumable':'1.0.0','Upload-Offset':str(offset),'Content-Type':'application/offset+octet-stream'})
   except RuntimeError:r=None
   if r is not None and r.ok:
    next_offset=int(r.headers.get('Upload-Offset','-1'))
    if next_offset!=offset+len(chunk):raise RuntimeError('RESUMABLE_OFFSET_MISMATCH')
   else:
    # A timed-out PATCH may already have succeeded; reconcile its offset before retrying.
    if r is not None and r.status_code not in (409,429) and not 500<=r.status_code<600:raise RuntimeError('SUPABASE_RESUMABLE_PATCH_'+str(r.status_code))
    check=self.request('HEAD',path,headers={'Tus-Resumable':'1.0.0'})
    if not check.ok:raise RuntimeError('SUPABASE_RESUMABLE_HEAD_'+str(check.status_code))
    next_offset=int(check.headers.get('Upload-Offset','-1'))
    if next_offset not in (offset,offset+len(chunk)):raise RuntimeError('RESUMABLE_OFFSET_MISMATCH')
   stalls=stalls+1 if next_offset==offset else 0
   if stalls>3:raise RuntimeError('SUPABASE_RESUMABLE_STALLED')
   offset=next_offset
 def verified_put(self,bucket,key,data,mime='application/octet-stream'):
  digest=hashlib.sha256(data).hexdigest();path=self.object_path(bucket,key)
  existing=self.request('GET',path,stream=True)
  if existing.status_code==200:
   with existing:
    h=hashlib.sha256();size=0
    for block in existing.iter_content(262144):h.update(block);size+=len(block)
   if h.hexdigest()==digest and size==len(data):return digest
   raise RuntimeError('IMMUTABLE_OBJECT_CONFLICT')
  if existing.status_code not in (400,404):raise RuntimeError('SUPABASE_READ_'+str(existing.status_code))
  existing.close()
  if len(data)>6*1024*1024:self.resumable_put(bucket,key,data,mime)
  else:
   r=self.request('POST',path,data=data,headers={'Content-Type':mime,'x-upsert':'false'})
   if not r.ok:raise RuntimeError('SUPABASE_UPLOAD_'+str(r.status_code))
  r=self.request('GET',path,stream=True)
  if not r.ok:raise RuntimeError('SUPABASE_VERIFY_'+str(r.status_code))
  with r:
   h=hashlib.sha256();size=0
   for block in r.iter_content(262144):h.update(block);size+=len(block)
  if h.hexdigest()!=digest or size!=len(data):raise RuntimeError('REMOTE_HASH_MISMATCH')
  return digest
 def manifest(self,family,uid,kind):
  r=self.request('GET',self.object_path(STATE_BUCKET,f'materials/{family}/{uid}/{kind}.json'))
  if r.status_code in (400,404):return None
  if not r.ok:raise RuntimeError('SUPABASE_MANIFEST_'+str(r.status_code))
  return r.json()
 def record(self,family,uid,kind,value):
  path=self.object_path(STATE_BUCKET,f'materials/{family}/{uid}/{kind}.json')
  r=self.request('POST',path,json=value,headers={'x-upsert':'true'})
  if not r.ok:raise RuntimeError('SUPABASE_MANIFEST_WRITE_'+str(r.status_code))
  r=self.request('GET',path)
  if not r.ok or r.json()!=value:raise RuntimeError('MANIFEST_VERIFY_FAILED')
  if family!='checkpoints' and 'filename' in value:
   row={'family':family,'uid':uid,'kind':kind,'bucket':value['bucket'],'object_key':value['objectKey'],'sha256':value['sha256'],'size':value['size'],'filename':value['filename'],'metadata':value['metadata']}
   r=self.request('POST','/rest/v1/library_materials',json=row,headers={'Prefer':'resolution=merge-duplicates,return=representation'})
   if not r.ok:raise RuntimeError('CLOUD_CATALOG_WRITE_'+str(r.status_code))
   saved=r.json()
   if len(saved)!=1 or any(saved[0].get(k)!=v for k,v in row.items()):raise RuntimeError('CLOUD_CATALOG_VERIFY_FAILED')
 def archive(self,path,family,uid,kind,metadata=None,delete=False):
  path=Path(path)
  if path.is_symlink() or not path.is_file():raise RuntimeError('LOCAL_FILE_REJECTED')
  if not re.fullmatch(r'[a-z0-9_-]{1,100}',family) or not re.fullmatch(r'[A-Za-z0-9_-]{1,160}',uid) or kind not in ('text','original','reference'):raise RuntimeError('MATERIAL_KEY_REJECTED')
  before=path.stat();data=path.read_bytes();digest=hashlib.sha256(data).hexdigest();ext=path.suffix.lower()
  if ext not in ('.pdf','.txt','.doc','.docx','.pptx','.md','.html','.zip','.rar'):raise RuntimeError('FILE_TYPE_REJECTED')
  object_key=f'{family}/{uid}/{kind}/{digest}{ext}';mime='application/pdf' if ext=='.pdf' else 'text/plain; charset=utf-8' if ext in ('.txt','.md') else 'application/octet-stream'
  self.verified_put(BUCKET,object_key,data,mime)
  record={'bucket':BUCKET,'objectKey':object_key,'sha256':digest,'size':len(data),'filename':path.name,'kind':kind,'metadata':metadata or {}}
  self.record(family,uid,kind,record)
  if delete:
   after=path.stat()
   if (after.st_size,after.st_mtime_ns)!=(before.st_size,before.st_mtime_ns) or hashlib.sha256(path.read_bytes()).hexdigest()!=digest:raise RuntimeError('LOCAL_FILE_CHANGED_KEEPING_COPY')
   path.unlink()
  return record
 def restore(self,path,family,uid,kind):
  path=Path(path)
  if path.exists():return True
  item=self.manifest(family,uid,kind)
  if not item:return False
  r=self.request('GET',self.object_path(item['bucket'],item['objectKey']))
  if not r.ok or hashlib.sha256(r.content).hexdigest()!=item['sha256'] or len(r.content)!=item['size']:raise RuntimeError('RESTORE_HASH_MISMATCH')
  path.parent.mkdir(parents=True,exist_ok=True);temp=path.with_suffix(path.suffix+'.restore');temp.write_bytes(r.content);temp.replace(path);return True

def cloud_active():
 if os.environ.get('PROFPLUS_CLOUD_LIBRARY')=='true':return True
 root=Path(os.environ.get('PROFPLUS_OPERATIONAL_ROOT',Path(__file__).resolve().parents[1]))
 p=root/'web/.dev.vars'
 return p.exists() and any(line.strip()=='PROFPLUS_CLOUD_LIBRARY=true' for line in p.read_text().splitlines())

def cloud_snapshot(path,family):
 """Consistent, replaceable checkpoint; the live SQLite file is only a working cache."""
 import sqlite3
 path=Path(path);temp=path.with_suffix('.cloud-snapshot');client=CloudLibrary()
 source=sqlite3.connect(f'file:{path}?mode=ro',uri=True);target=sqlite3.connect(temp)
 try:source.backup(target)
 finally:source.close();target.close()
 try:
  data=temp.read_bytes();digest=hashlib.sha256(data).hexdigest();key=f'checkpoints/{family}/latest.sqlite';object_path=client.object_path(STATE_BUCKET,key)
  r=client.request('POST',object_path,data=data,headers={'Content-Type':'application/octet-stream','x-upsert':'true'})
  if not r.ok:raise RuntimeError('CLOUD_CHECKPOINT_UPLOAD_'+str(r.status_code))
  r=client.request('GET',object_path)
  if not r.ok or hashlib.sha256(r.content).hexdigest()!=digest:raise RuntimeError('CLOUD_CHECKPOINT_VERIFY_FAILED')
  client.record('checkpoints',family,'text',{'bucket':STATE_BUCKET,'objectKey':key,'sha256':digest,'size':len(data)})
  # The consistent checkpoint remains a recovery object; Postgres is the live ledger.
  connection=sqlite3.connect(temp);connection.row_factory=sqlite3.Row
  try:
   table='documents' if family=='manuals' else 'docs'
   for target,source,key in [('library_import_documents',table,'uid')]+([('library_import_urls','urls','url')] if family=='competitions' else []):
    pending=[]
    def save():
     if not pending:return
     r=client.request('POST','/rest/v1/'+target,json=pending,headers={'Prefer':'resolution=merge-duplicates,return=representation'})
     if not r.ok:raise RuntimeError('CLOUD_CHECKPOINT_CATALOG_'+str(r.status_code))
     by_key={row[key]:row for row in r.json()}
     if len(by_key)!=len(pending) or any(by_key.get(row[key],{}).get('state')!=row['state'] for row in pending):raise RuntimeError('CLOUD_CHECKPOINT_CATALOG_VERIFY_FAILED')
     pending.clear()
    for row in connection.execute('SELECT * FROM '+source):
     state=dict(row);state.pop('path',None)
     if state.get('error')=='PERSONAL_RESULTS_EXCLUDED':state={'uid':row['uid'],'status':'excluded','error':'PERSONAL_RESULTS_EXCLUDED'}
     pending.append({'family':family,key:row[key],'state':state})
     if len(pending)==100:save()
    save()
  finally:connection.close()
 finally:temp.unlink(missing_ok=True)
