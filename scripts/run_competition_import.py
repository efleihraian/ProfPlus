"""Durable, unscheduled archive import; resume by running this controller again."""
import fcntl,json,os,subprocess,sys,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];DATA=ROOT/'data/competitions'
def state(**kw):
 target=DATA/'run.json';temp=target.with_suffix('.tmp');temp.write_text(json.dumps({'pid':os.getpid(),'updatedAt':time.time(),**kw},indent=2));temp.replace(target)
def main():
 DATA.mkdir(parents=True,exist_ok=True)
 with (DATA/'controller.lock').open('a') as lock:
  fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
  with (DATA/'import.lock').open('a') as existing:fcntl.flock(existing,fcntl.LOCK_EX)
  state(state='running',phase='resume_indexing')
  result=subprocess.run([sys.executable,str(ROOT/'scripts/import_competitions.py'),'--index'],cwd=ROOT)
  if result.returncode:state(state='stopped',error='IMPORT_CHILD_FAILED');return result.returncode
  while True:
   state(state='running',phase='discovery_and_indexing')
   result=subprocess.run([sys.executable,str(ROOT/'scripts/import_competitions.py'),'--discover','--index','--batch-size','20'],cwd=ROOT)
   if result.returncode:state(state='stopped',error='IMPORT_CHILD_FAILED');return result.returncode
   progress=json.loads((DATA/'progress.json').read_text())
   if not progress.get('discovery',{}).get('pending'):
    state(state='finished_with_report',counts=progress.get('counts'),discovery=progress.get('discovery'));return 0
if __name__=='__main__':sys.exit(main())
