"""Compile fixed application statements to an admin-only Postgres operation list."""
import hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
def normalize(sql):return re.sub(r'\s+',' ',sql).strip()
def main():
 queries={}
 for base in (ROOT/'web/lib',ROOT/'web/app/api'):
  for path in base.rglob('*.ts'):
   if '/api/admin/' in path.as_posix():continue
   for match in re.finditer(r'\.prepare\(\s*("(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\')\s*\)',path.read_text()):
    raw=match[1];sql=json.loads(raw) if raw[0]=='"' else raw[1:-1].replace("\\'","'")
    sql=normalize(sql);queries[sql]=hashlib.sha256(sql.encode()).hexdigest()[:24]
 # Numeric binding indices are explicit and reviewed; all other bindings are text/null.
 numeric={
 'UPDATE documents SET status = ?':set(),
 'INSERT INTO documents':{5,6},
 'INSERT OR IGNORE INTO account_deletions':{1,3},
 'SELECT id FROM documents WHERE user_id=':{1},
 'INSERT INTO projects':{3},
 'INSERT INTO conversations':{3,4},
 'UPDATE conversations SET title=':{4,7},
 "UPDATE conversations SET deleted=":{0},
 'UPDATE conversations SET messages=':{1,4},
 'DELETE FROM guest_chat_budget':{0},
 'INSERT INTO guest_chat_budget':{1,2},
 }
 compiled=[]
 for sql,op in sorted(queries.items()):
  if sql.startswith('CREATE TABLE'):compiled.append({'op':op,'sql':sql,'postgres':None,'count':0});continue
  numbers=next((v for prefix,v in numeric.items() if sql.startswith(prefix)),set())
  index=0
  def replace(match):
   nonlocal index
   value=f"($1->>{index})"+('::bigint' if index in numbers else '')
   index+=1;return value
  # Only placeholders outside SQL string literals are replaced.
  tokens=re.split(r"('(?:''|[^'])*')",sql)
  for i in range(0,len(tokens),2):tokens[i]=re.sub(r'\?',replace,tokens[i])
  pg=''.join(tokens)
  ignored=pg.startswith('INSERT OR IGNORE')
  pg=pg.replace('INSERT OR IGNORE','INSERT',1)
  if ignored:pg+=' ON CONFLICT DO NOTHING'
  if 'RETURNING' not in pg and not pg.startswith('SELECT'):pg+=' RETURNING 1 AS changed'
  if sql.startswith('INSERT INTO documents'):
   # Serialize per-owner reservations and erasure locks in the same transaction.
   lock=7
  elif sql.startswith('INSERT OR IGNORE INTO account_deletions'):lock=0
  else:lock=None
  compiled.append({'op':op,'sql':sql,'postgres':pg,'count':index,'ownerLock':lock})
 (ROOT/'web/lib/supabase-operations.json').write_text(json.dumps({r['sql']:{'op':r['op'],'count':r['count']} for r in compiled},ensure_ascii=False,indent=2)+'\n')
 (ROOT/'scripts/cloud/app-operations.json').write_text(json.dumps(compiled,ensure_ascii=False,indent=2)+'\n')
 print('Fixed operations:',len(compiled))
if __name__=='__main__':main()
