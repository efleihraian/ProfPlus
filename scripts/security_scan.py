#!/usr/bin/env python3
"""Redacted local/CI secret scan. No match values are printed or persisted."""
import argparse, json, re, subprocess, sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
def git(*args):
    return subprocess.check_output(['git','-C',str(root),*args])
patterns={
 'private-key':re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
 'openai-key':re.compile(rb'\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{32,}\b'),
 'supabase-secret':re.compile(rb'\bsb_secret_[A-Za-z0-9_-]{20,}\b'),
 'github-token':re.compile(rb'\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b'),
 'google-api-key':re.compile(rb'\bAIza[0-9A-Za-z_-]{35}\b'),
 'google-client-secret':re.compile(rb'\bGOCSPX-[0-9A-Za-z_-]{20,}\b'),
 'aws-key':re.compile(rb'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b'),
 'resend-key':re.compile(rb'\bre_[A-Za-z0-9_]{25,}\b'),
 'assigned-secret':re.compile(rb'''(?i)(?:api_key|client_secret|service_role_key|password|access_token|refresh_token)\s*["']?\s*[:=]\s*["']([A-Za-z0-9_+/=.-]{24,})["']'''),
}
known=[]
# Compare local values without printing them. CI can run without credentials.
for file in [root/'web/.dev.vars',root/'.env',root/'web/.env.local']:
 if not file.exists():continue
 for line in file.read_text().splitlines():
  name,sep,value=line.partition('=');value=value.strip().strip('"\'')
  if sep and re.search(r'API_KEY|SECRET|TOKEN|PASSWORD|SERVICE_ROLE',name) and len(value)>=20 and not re.search(r'EXAMPLE|PLACEHOLDER',value,re.I):known.append(value.encode())
placeholder=re.compile(rb'(?i)(?:example|placeholder|synthetic|test-only|your[-_]|x{6,})')
findings=[];checked=0
sensitive_name=re.compile(r'(?:^|/)(?:\.env(?:\..*)?|\.dev\.vars(?:\..*)?|client_secret[^/]*\.json|AuthKey_[^/]*\.p8)$|\.(?:pem|p12|pfx|key)$')
def inspect(data,path,scope):
 global checked
 checked+=1
 if sensitive_name.search(path) and not path.endswith(('.example','.sample','.template')):findings.append({'scope':scope,'path':path,'rule':'sensitive-file-name'})
 for rule,pattern in patterns.items():
  for m in pattern.finditer(data):
   if placeholder.search(m.group(0)):continue
   # Quoted long words are not credentials; require mixed letter and digit content.
   if rule=='assigned-secret' and not (re.search(rb'[A-Za-z]',m.group(1)) and re.search(rb'[0-9]',m.group(1))):continue
   findings.append({'scope':scope,'path':path,'rule':rule,'line':data[:m.start()].count(b'\n')+1});break
 if any(secret in data for secret in known):findings.append({'scope':scope,'path':path,'rule':'exact-local-secret'})
parser=argparse.ArgumentParser();parser.add_argument('--history',action='store_true');parser.add_argument('--client',action='store_true');args=parser.parse_args()
for raw in git('ls-files','-z','--cached','--others','--exclude-standard').split(b'\0'):
 if raw:
  path=raw.decode();file=root/path
  if file.is_file():inspect(file.read_bytes(),path,'working-tree')
if args.history:
 objects=git('rev-list','--objects','--all').decode().splitlines()
 proc=subprocess.Popen(['git','-C',str(root),'cat-file','--batch'],stdin=subprocess.PIPE,stdout=subprocess.PIPE)
 for entry in objects:
  oid,_,path=entry.partition(' ');proc.stdin.write((oid+'\n').encode());proc.stdin.flush()
  header=proc.stdout.readline().decode().split();size=int(header[2]);data=proc.stdout.read(size);proc.stdout.read(1)
  if header[1] in ['blob','commit','tag']:inspect(data,path or '('+header[1]+')','git:'+oid[:12])
 proc.stdin.close();proc.wait()
if args.client:
 client=root/'web/dist/client'
 if not client.exists():raise SystemExit('Client build missing; run build first.')
 for file in client.rglob('*'):
  if file.is_file():inspect(file.read_bytes(),str(file.relative_to(root)),'client-build')
print(json.dumps({'checkedFilesAndBlobs':checked,'history':args.history,'client':args.client,'findings':findings,'limits':'Pattern and exact-known-secret scan; not proof that every possible secret is absent.'},ensure_ascii=False,indent=2))
sys.exit(1 if findings else 0)
