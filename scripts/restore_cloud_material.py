"""Restore one verified material/checkpoint into an explicitly selected new file."""
import argparse,os
from pathlib import Path
from cloud_library import CloudLibrary
def main():
 p=argparse.ArgumentParser();p.add_argument('--operational-root',required=True,type=Path);p.add_argument('--family',required=True,choices=['manuals','competitions','references','checkpoints']);p.add_argument('--uid',required=True);p.add_argument('--kind',required=True,choices=['text','original','reference']);p.add_argument('--output',required=True,type=Path);a=p.parse_args()
 if a.output.exists() or a.output.is_symlink():p.error('Output must be a new file; existing files are preserved.')
 os.environ['PROFPLUS_OPERATIONAL_ROOT']=str(a.operational_root)
 if not CloudLibrary().restore(a.output,a.family,a.uid,a.kind):raise RuntimeError('CLOUD_MATERIAL_NOT_FOUND')
 print('Restored and verified.')
if __name__=='__main__':
 try:main()
 except RuntimeError as e:print(str(e));raise SystemExit(2)
