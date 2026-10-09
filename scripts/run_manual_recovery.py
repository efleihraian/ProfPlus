"""Finite recovery continuation after the active pass; no scheduler or recurring job."""
import argparse, fcntl, json, os, subprocess, sys, time
from pathlib import Path

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--operational-root',type=Path,required=True);args=parser.parse_args()
    root=args.operational_root.resolve();data=root/'data/rag/original-recovery';data.mkdir(parents=True,exist_ok=True)
    def state(**fields):
        target=data/'controller.json';temp=target.with_suffix('.tmp')
        temp.write_text(json.dumps({'pid':os.getpid(),'updated_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),**fields},indent=2));temp.replace(target)
    with (data/'controller.lock').open('a') as controller:
        fcntl.flock(controller,fcntl.LOCK_EX|fcntl.LOCK_NB)
        state(state='waiting_for_active_pass')
        with (data/'recovery.lock').open('a') as existing:
            fcntl.flock(existing,fcntl.LOCK_EX)
        state(state='running',phase='retry_and_complete')
        result=subprocess.run([sys.executable,str(root/'scripts/recover_manual_originals.py'),'--operational-root',str(root),'--file-limit-mb','50'],cwd=root)
        state(state='finished_with_report' if result.returncode==0 else 'stopped',exit_code=result.returncode)
        return result.returncode

if __name__=='__main__':raise SystemExit(main())
