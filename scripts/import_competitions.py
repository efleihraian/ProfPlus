"""Resumable archive discovery and educational-document indexing. No secrets in reports."""
import argparse, concurrent.futures, threading, hashlib, io, ipaddress, json, os, re, shutil, socket, sqlite3, subprocess, sys, time, unicodedata, zipfile
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin,urlsplit,urlunsplit,unquote
import requests
import pymupdf
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'data/competitions'
OPERATIONAL=Path(os.environ.get('PROFPLUS_OPERATIONAL_ROOT',str(ROOT)))
MAX_DOWNLOAD=250*1024*1024
MAX_MEMBER=100*1024*1024
MAX_EXPANDED=1024*1024*1024
STOP=False
KEY=None
EXPORT_LOCK=threading.Lock()

def norm(s):return ''.join(c for c in unicodedata.normalize('NFD',s.lower()) if unicodedata.category(c)!='Mn')
def canonical(u):
 p=urlsplit(u.strip());return urlunsplit(('https' if p.scheme=='http' else p.scheme,p.netloc,p.path or '/',p.query,''))
def public_url(u):
 try:
  p=urlsplit(u)
  if p.scheme != 'https' or not p.hostname or p.username or p.password or p.port not in (None,80,443):return False
  addresses=socket.getaddrinfo(p.hostname,p.port or (443 if p.scheme=='https' else 80),type=socket.SOCK_STREAM)
  return bool(addresses) and all(ipaddress.ip_address(a[4][0]).is_global for a in addresses)
 except (ValueError,OSError):return False

def fetch(u):
 for _ in range(6):
  if not public_url(u):raise RuntimeError('SOURCE_URL_REJECTED')
  r=requests.get(u,stream=True,allow_redirects=False,timeout=(15,45),headers={'User-Agent':'ProfPlus educational archive import/1.0'})
  if r.status_code in (301,302,303,307,308):
   loc=r.headers.get('Location');r.close()
   if not loc:raise RuntimeError('REDIRECT_MISSING')
   u=urljoin(u,loc);continue
  if r.status_code!=200:
   r.close();raise RuntimeError('SOURCE_HTTP_'+str(r.status_code))
  chunks=[];size=0
  with r:
   for b in r.iter_content(262144):
    size+=len(b)
    if size>MAX_DOWNLOAD:raise RuntimeError('DOWNLOAD_TOO_LARGE')
    chunks.append(b)
  return u,b''.join(chunks),r.headers.get('Content-Type','')
 raise RuntimeError('REDIRECT_LIMIT')

def config():
 global KEY
 if KEY:return KEY
 values={}
 for file in (OPERATIONAL/'.env',OPERATIONAL/'web/.dev.vars'):
  if file.exists():
   for line in file.read_text().splitlines():
    if '=' in line and not line.startswith('#'):
     k,v=line.split('=',1);values[k]=v.strip().strip('"').strip("'")
 KEY=os.environ.get('OPENAI_API_KEY',values.get('OPENAI_API_KEY',''))
 if not KEY:raise RuntimeError('API_KEY_MISSING')
 return KEY

def api(method,path,**kw):
 global STOP
 for attempt in range(4):
  for f in kw.get('files',{}).values():f[1].seek(0)
  try:r=requests.request(method,'https://api.openai.com/v1'+path,headers={'Authorization':'Bearer '+config()},timeout=(15,90),**kw)
  except requests.RequestException:
   if attempt==3:raise RuntimeError('API_NETWORK_ERROR') from None
   time.sleep(2**attempt);continue
  if r.ok:return r.json()
  if r.status_code in (401,403):STOP=True;raise RuntimeError('API_ACCESS_'+str(r.status_code))
  if r.status_code==429 and r.json().get('error',{}).get('code') in ('insufficient_quota','billing_hard_limit_reached'):STOP=True;raise RuntimeError('API_QUOTA')
  if r.status_code not in (429,500,502,503,504):raise RuntimeError('API_HTTP_'+str(r.status_code))
  time.sleep(min(30,2**attempt*2))
 raise RuntimeError('API_TEMPORARY_FAILURE')

class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.current=None;self.skip=0;self.text=[]
 def handle_starttag(self,t,a):
  d=dict(a)
  if t in ('script','style'):self.skip+=1
  if t=='a' and d.get('href'):self.current=[d['href'],'']
 def handle_data(self,d):
  if self.skip:return
  self.text.append(d)
  if self.current:self.current[1]+=d
 def handle_endtag(self,t):
  if t in ('script','style'):self.skip=max(0,self.skip-1)
  if t=='a' and self.current:self.links.append(self.current);self.current=None

PRIVATE=re.compile(r'rezultat|clasament|participan|admis|respins|repartizare|borderou|candidati|premianti|castigator|proces.verbal',re.I)
EDUCATIONAL=re.compile(r'olimp|concurs|comper|subiect|barem|solut|problem|task|o[jn][im]|scoala|lectura|regulament|calendar|competiti',re.I)
DOCUMENT=re.compile(r'\.(?:pdf|docx?|zip|rar|tar|gz|tgz)(?:$|[?&])|action=download',re.I)

def eligible(u,label,seed,parent):
 s=norm(unquote(urlsplit(u).path+'?'+urlsplit(u).query)+' '+label)
 if PRIVATE.search(s):return False,'personal_results'
 if re.search(r'login|logout|register|forum|author|wp-json|feed|facebook|twitter|instagram|mailto:|javascript:|creare-cont|conectare|contact|politica|cookie|termeni-si|cum-ma-inscriu',s):return False,'unrelated'
 if re.search(r'bacalaureat|evaluare-nationala|testare-nationala|formular.inscriere|statut|cotizati|lista.membr|/files/scoala/',s):return False,'unrelated'
 if DOCUMENT.search(u) or u.startswith('https://drive.google.com/uc?export=download'):return True,'file'
 if urlsplit(u).hostname!=urlsplit(seed['url']).hostname:return False,'external_navigation'
 if EDUCATIONAL.search(s):return True,'page'
 if seed['id']=='archive-08' and re.search(r'\.html?$',urlsplit(u).path):return True,'page'
 if re.search(r'20(?:0\d|1\d|2[0-6])',s) and urlsplit(u).path.startswith(urlsplit(parent).path.rsplit('/',1)[0]+'/'):return True,'page'
 return False,'unrelated'

def db():
 DATA.mkdir(parents=True,exist_ok=True)
 c=sqlite3.connect(DATA/'import.sqlite',timeout=30);c.row_factory=sqlite3.Row;c.execute('PRAGMA journal_mode=WAL')
 c.executescript('CREATE TABLE IF NOT EXISTS urls(url TEXT PRIMARY KEY,seed TEXT,depth INTEGER,label TEXT,status TEXT DEFAULT "pending",error TEXT); CREATE TABLE IF NOT EXISTS docs(uid TEXT PRIMARY KEY,metadata TEXT,sha TEXT UNIQUE,path TEXT,status TEXT DEFAULT "extracted",file_id TEXT,attached INTEGER DEFAULT 0,error TEXT); CREATE TABLE IF NOT EXISTS skips(url TEXT PRIMARY KEY,reason TEXT);')
 c.commit();return c

def metadata(name,text,seed,url):
 s=norm(name+' '+text[:5000]+' '+seed['title'])
 subjects=[('matemat','Matematică'),('informat','Informatică'),('fizic','Fizică'),('chimi','Chimie'),('biolog','Biologie'),('geograf','Geografie'),('istor','Istorie'),('romana','Limba și literatura română'),('englez','Limba engleză'),('francez','Limba franceză'),('german','Limba germană'),('socio','Educație socială')]
 found=[v for k,v in subjects if k in norm(name+' '+text[:5000])];found=found or [v for k,v in subjects if k in norm(seed['title'])];subject=found[0] if len(found)==1 else '*'
 grade=re.search(r'clas(?:a|ele)[\s._:-]*(?:a[\s._:-]*)?(pregatitoare|[ivx]{1,4}|\d{1,2})(?!\w)',s)
 roman={'i':1,'ii':2,'iii':3,'iv':4,'v':5,'vi':6,'vii':7,'viii':8,'ix':9,'x':10,'xi':11,'xii':12,'pregatitoare':0}
 value=grade.group(1) if grade else None
 number=roman.get(value,int(value) if value and value.isdigit() else None)
 stages=['primary' if number<=4 else 'middle' if number<=8 else 'high'] if number is not None and number<=12 else ['primary','middle','high']
 # Years are confirmed from content, not guessed from URLs.
 years=sorted(set(re.findall(r'\b20(?:0\d|1\d|2[0-6])\b',text[:5000])))
 actual=norm(name+' '+text[:5000])
 category='olympiad' if re.search(r'olimpiad|\b(?:oji|oni|onm|olm|ioi|boi|ceoi)\b',actual) else 'competition' if re.search(r'comper|concurs|contest|competiti|acm',actual) else seed['category']
 m={'title':(seed['title']+' — '+name)[:230],'subject':subject,'stages':stages,'category':category,'url':url,'publisher':seed['title'],'archiveId':seed['id'],'archiveMember':name,'years':years}
 if grade and number is not None:m['schoolClass']='Clasa '+str(number)
 return m

def text_document(data,name):
 if name.lower().endswith('.html'):
  p=Links();p.feed(data.decode('utf8',errors='replace'));text='\n'.join(p.text)
  if len(text.strip())<80:raise RuntimeError('EMPTY_DOCUMENT')
  return '[[PAGE:1]]\n'+text,0,0
 if data.startswith(b'%PDF-'):
  result=[];readable=0
  with pymupdf.open(stream=data,filetype='pdf') as pdf:
   pages=len(pdf)
   if pages>1000:raise RuntimeError('PAGE_LIMIT')
   for i,p in enumerate(pdf,1):
    text=p.get_text(sort=True).strip()
    if len(text)<40:
     image=p.get_pixmap(dpi=160).tobytes('png')
     tess=OPERATIONAL/'data/rag/tessdata'
     r=subprocess.run(['/opt/homebrew/bin/tesseract','stdin','stdout','--tessdata-dir',str(tess),'-l','ron+eng'],input=image,capture_output=True,timeout=90,env={**os.environ,'OMP_THREAD_LIMIT':'1'})
     if r.returncode:raise RuntimeError('OCR_FAILED')
     text=r.stdout.decode('utf8').strip()
    if len(text)>=40:readable+=1;result.append(f'[[PAGE:{i}]]\n'+text)
   if readable<max(1,pages*.9):raise RuntimeError('TEXT_COVERAGE_LOW')
  return '\n\n'.join(result),pages,readable
 if name.lower().endswith('.docx'):
  from xml.etree import ElementTree as E
  with zipfile.ZipFile(io.BytesIO(data)) as z:
   info=z.getinfo('word/document.xml')
   if info.file_size>MAX_MEMBER:raise RuntimeError('DOCX_TOO_LARGE')
   root=E.fromstring(z.read(info));ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
   text='\n'.join(''.join(t.text or '' for t in p.findall('.//w:t',ns)) for p in root.findall('.//w:p',ns))
  if len(text.strip())<40:raise RuntimeError('EMPTY_DOCUMENT')
  return '[[PAGE:1]]\n'+text,0,0
 if name.lower().endswith('.doc'):
  temp=DATA/'legacy.doc';temp.write_bytes(data)
  try:r=subprocess.run(['/usr/bin/textutil','-convert','txt','-stdout',str(temp)],capture_output=True,timeout=30)
  finally:temp.unlink(missing_ok=True)
  if r.returncode or len(r.stdout.strip())<40:raise RuntimeError('LEGACY_DOC_FAILED')
  return '[[PAGE:1]]\n'+r.stdout.decode('utf8'),0,0
 raise RuntimeError('UNSUPPORTED_DOCUMENT')

def unpack(data,name,depth=0):
 if depth>3:raise RuntimeError('NESTED_ARCHIVE_LIMIT')
 if name.lower().endswith('.docx') or data.startswith(b'%PDF-') or name.lower().endswith('.doc'):
  yield name,data;return
 if zipfile.is_zipfile(io.BytesIO(data)):
  with zipfile.ZipFile(io.BytesIO(data)) as z:
   total=0
   for i in z.infolist():
    if i.is_dir():continue
    if PRIVATE.search(norm(i.filename)):continue
    if not re.search(r'\.(pdf|docx?|zip|rar)$',i.filename,re.I):continue
    total+=i.file_size
    if i.file_size>MAX_MEMBER or total>MAX_EXPANDED or i.file_size/max(1,i.compress_size)>300:raise RuntimeError('ARCHIVE_SIZE_REJECTED')
    yield from unpack(z.read(i),name+' / '+i.filename,depth+1)
  return
 if data.startswith(b'Rar!') or re.search(r'\.(tar|gz|tgz)$',name,re.I):
  target=DATA/('archive-'+hashlib.sha256(data).hexdigest()[:16]+'.bin');target.write_bytes(data)
  listing=subprocess.run(['/usr/bin/bsdtar','-tf',str(target)],capture_output=True,timeout=30)
  if listing.returncode:raise RuntimeError('ARCHIVE_FORMAT_UNSUPPORTED')
  total=0
  for member in listing.stdout.decode('utf8',errors='replace').splitlines():
   if PRIVATE.search(norm(member)) or not re.search(r'\.(pdf|docx?|zip|rar)$',member,re.I):continue
   with subprocess.Popen(['/usr/bin/bsdtar','-xOf',str(target),'--',member],stdout=subprocess.PIPE,stderr=subprocess.DEVNULL) as p:
    value=p.stdout.read(MAX_MEMBER+1)
    if len(value)>MAX_MEMBER:p.kill();raise RuntimeError('ARCHIVE_SIZE_REJECTED')
    if p.wait(timeout=30):raise RuntimeError('ARCHIVE_READ_FAILED')
   total+=len(value)
   if total>MAX_EXPANDED:raise RuntimeError('ARCHIVE_SIZE_REJECTED')
   yield from unpack(value,name+' / '+member,depth+1)
  target.unlink(missing_ok=True);return
 raise RuntimeError('UNSUPPORTED_ARCHIVE')

def add_document(c,data,name,seed,url):
 sha=hashlib.sha256(data).hexdigest()
 existing=c.execute('SELECT status,error FROM docs WHERE sha=?',(sha,)).fetchone()
 if existing:
  if existing['error']=='PERSONAL_RESULTS_EXCLUDED':c.execute('DELETE FROM docs WHERE sha=?',(sha,));c.commit()
  else:return
 uid='competition-'+sha[:24]
 try:
  text,pages,readable=text_document(data,name)
  if re.search(r'rezultate (?:finale|initiale|olimpiadei)|lista (?:candidat|participant|elev)',norm(text[:12000])):raise RuntimeError('PERSONAL_RESULTS_EXCLUDED')
  m=metadata(name,text,seed,url);m.update(pages=pages,readablePages=readable,pageLocator='pdf' if pages else 'fragment')
  path=DATA/'text'/f'{uid}.txt';path.parent.mkdir(exist_ok=True)
  path.write_text('Material educațional: '+m['title']+'\nTip: '+m['category']+'\nDisciplina: '+m['subject']+'\nOriginal: '+url+'\nMembru în arhivă: '+name+'\nPaginile sunt poziții PDF; pentru DOC/DOCX PAGE:1 indică fragment, nu pagina fizică.\n\n'+text)
  c.execute('INSERT INTO docs(uid,metadata,sha,path) VALUES(?,?,?,?)',(uid,json.dumps(m,ensure_ascii=False),sha,str(path)))
 except Exception as e:
  code=str(e) if isinstance(e,RuntimeError) else type(e).__name__
  m={'title':seed['title']+' — '+name,'url':url,'archiveId':seed['id'],'category':seed['category'],'archiveMember':name}
  c.execute('INSERT INTO docs(uid,metadata,sha,status,error) VALUES(?,?,?,"failed",?)',(uid,json.dumps(m),sha,code))
 c.commit()

def export_unlocked(c):
 docs=[dict(r) for r in c.execute('SELECT uid,metadata,status,error FROM docs ORDER BY uid')]
 catalog={d['uid']:json.loads(d['metadata']) for d in docs if d['status'] in ('extracted','uploaded','indexing','indexed')}
 # Public metadata lives in vector-store attributes; no rebuild-time catalog needed.
 counts=dict(c.execute('SELECT status,count(*) FROM docs GROUP BY status').fetchall())
 urlcounts=dict(c.execute('SELECT status,count(*) FROM urls GROUP BY status').fetchall())
 report={'updatedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'documents':len(docs),'counts':counts,'discovery':urlcounts,'excluded':dict(c.execute('SELECT reason,count(*) FROM skips GROUP BY reason').fetchall()),'items':[{**json.loads(d['metadata']),'uid':d['uid'],'status':d['status'],'error':d['error']} for d in docs],'archiveErrors':[dict(r) for r in c.execute('SELECT url,seed,error FROM urls WHERE status="failed"')]}
 (ROOT/'catalog/competition-import-status.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 (DATA/'progress.json').write_text(json.dumps({k:v for k,v in report.items() if k not in ('items','archiveErrors')},ensure_ascii=False,indent=2)+'\n')
 return report

def export(c):
 with EXPORT_LOCK:return export_unlocked(c)

def discover(c,seeds,batch_size=0):
 for seed in seeds:c.execute('INSERT OR IGNORE INTO urls(url,seed,depth,label) VALUES(?,?,0,?)',(canonical(seed['url']),seed['id'],seed['title']))
 c.commit()
 processed=0
 while not STOP:
  if batch_size and processed>=batch_size:break
  processed+=1
  row=c.execute("""SELECT * FROM urls q WHERE q.status="pending" ORDER BY (SELECT count(*) FROM urls done WHERE done.seed=q.seed AND done.status="done"),q.depth,q.rowid LIMIT 1""").fetchone()
  if not row:break
  seed=next(s for s in seeds if s['id']==row['seed'])
  try:
   if shutil.disk_usage(DATA).free<1024**3:raise RuntimeError('DISK_SPACE_LOW')
   url,data,ctype=fetch(row['url'])
   if 'html' in ctype and not data.startswith((b'%PDF-',b'PK',b'Rar!')):
    p=Links();p.feed(data.decode('utf8',errors='replace'))
    if re.search(r'/(?:problema|problem|task)/',urlsplit(url).path) and row['depth']>0:
     add_document(c,data,row['label']+'.html',seed,row['url'])
    for href,label in p.links:
     child=canonical(urljoin(url,href))
     drive=re.match(r'https://drive\.google\.com/file/d/([^/?]+)',child)
     if drive:child='https://drive.google.com/uc?export=download&id='+drive.group(1)
     ok,reason=eligible(child,label,seed,url)
     if ok:c.execute('INSERT OR IGNORE INTO urls(url,seed,depth,label) VALUES(?,?,?,?)',(child,seed['id'],row['depth']+1,label[:250]))
     else:c.execute('INSERT OR IGNORE INTO skips VALUES(?,?)',(child,reason))
   else:
    name=unquote(urlsplit(url).path.split('/')[-1]) or row['label'] or 'document'
    if 'file=' in url:
     from urllib.parse import parse_qs
     name=parse_qs(urlsplit(url).query).get('file',[name])[0]
    if 'pdf' in ctype and not name.lower().endswith('.pdf'):name+='.pdf'
    found=False
    for member,value in unpack(data,name):add_document(c,value,member,seed,row['url']);found=True
    if not found:raise RuntimeError('NO_EDUCATIONAL_FILES')
   c.execute('UPDATE urls SET status="done",error=NULL WHERE url=?',(row['url'],))
  except Exception as e:
   code=str(e) if isinstance(e,RuntimeError) else type(e).__name__
   c.execute('UPDATE urls SET status="failed",error=? WHERE url=?',(code,row['url']))
   if code=='DISK_SPACE_LOW':raise
  c.commit();r=export(c);print(json.dumps({k:r[k] for k in ('documents','counts','discovery')},ensure_ascii=False),flush=True)
  time.sleep(.15)

def attributes(uid,m):
 source=m['url']
 if len(source)>512:source=next(r['url'] for r in json.loads((ROOT/'catalog/competition-archives.json').read_text()) if r['id']==m['archiveId'])
 return {'uid':uid,'category':m['category'],'subject':m['subject'][:256],'title':m['title'][:256],'source_url':source,'publisher':m['publisher'][:256],'stages':','.join(m['stages']),'class':m.get('schoolClass',''),'page_locator':m.get('pageLocator','pdf')}

def enrich(c):
 store=json.loads((OPERATIONAL/'data/rag/store.json').read_text())['vector_store_id']
 for row in c.execute('SELECT * FROM docs WHERE status="indexed"').fetchall():
  m=json.loads(row['metadata'])
  api('POST',f'/vector_stores/{store}/files/{row["file_id"]}',json={'attributes':attributes(row['uid'],m)})

def index(c,only_uid=None):
 store=json.loads((OPERATIONAL/'data/rag/store.json').read_text())['vector_store_id']
 for row in c.execute('SELECT * FROM docs WHERE status IN ("extracted","uploaded","indexing")'+(' AND uid=?' if only_uid else ''),((only_uid,) if only_uid else ())).fetchall():
  if STOP:break
  try:
   m=json.loads(row['metadata']);file_id=row['file_id']
   if not file_id:
    with open(row['path'],'rb') as f:file_id=api('POST','/files',data={'purpose':'assistants'},files={'file':(row['uid']+'.txt',f,'text/plain')})['id']
    c.execute('UPDATE docs SET file_id=?,status="uploaded" WHERE uid=?',(file_id,row['uid']));c.commit()
   if not row['attached']:
    api('POST',f'/vector_stores/{store}/files',json={'file_id':file_id,'attributes':attributes(row['uid'],m),'chunking_strategy':{'type':'static','static':{'max_chunk_size_tokens':500,'chunk_overlap_tokens':100}}})
    c.execute('UPDATE docs SET attached=1,status="indexing" WHERE uid=?',(row['uid'],));c.commit()
   if row['attached']:
    api('POST',f'/vector_stores/{store}/files/{file_id}',json={'attributes':attributes(row['uid'],m)})
   for _ in range(60):
    item=api('GET',f'/vector_stores/{store}/files/{file_id}')
    if item['status']=='completed':c.execute('UPDATE docs SET status="indexed",error=NULL WHERE uid=?',(row['uid'],));break
    if item['status'] in ('failed','cancelled'):raise RuntimeError('REMOTE_INDEX_FAILED')
    time.sleep(2)
  except Exception as e:
   code=str(e) if isinstance(e,RuntimeError) else type(e).__name__
   c.execute('UPDATE docs SET error=? WHERE uid=?',(code,row['uid']))
  c.commit();r=export(c);print(json.dumps({'uid':row['uid'],'counts':r['counts']}),flush=True)

def main():
 import fcntl
 parser=argparse.ArgumentParser();parser.add_argument('--discover',action='store_true');parser.add_argument('--index',action='store_true');parser.add_argument('--status',action='store_true');parser.add_argument('--enrich',action='store_true');parser.add_argument('--batch-size',type=int,default=0);a=parser.parse_args()
 c=db()
 with (DATA/'import.lock').open('a') as lock:
  fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
  if a.enrich:enrich(c)
  if a.discover:discover(c,json.loads((ROOT/'catalog/competition-archives.json').read_text()),a.batch_size)
  if a.index:
   def worker(uid):
    conn=db()
    try:index(conn,uid)
    finally:conn.close()
   pending=[r['uid'] for r in c.execute('SELECT uid FROM docs WHERE status IN ("extracted","uploaded","indexing")')]
   with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:list(pool.map(worker,pending))
  export(c)
 c.close()
 if STOP:raise RuntimeError("API_STOPPED")
if __name__=='__main__':
 try:main()
 except Exception as e:
  DATA.mkdir(parents=True,exist_ok=True);code=str(e) if isinstance(e,RuntimeError) else type(e).__name__
  (DATA/'last-error.json').write_text(json.dumps({'error':code,'at':time.time()}));print('Import error: '+code,flush=True);sys.exit(2)
