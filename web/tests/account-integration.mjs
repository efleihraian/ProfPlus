// Local contract tests: a synthetic Auth server, never a real Supabase project.
// Run after npm run build; ports 3098/3099 must be free. No API secrets are needed.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn,execFileSync,spawnSync} from 'node:child_process';
import {readFile,writeFile,rm,readdir} from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';
const socialOnly=process.argv.includes('--social-only');
const origin='http://127.0.0.1:3099',mockOrigin='http://127.0.0.1:3098';
const configPath='dist/server/.dev.vars';
const original=await readFile(configPath).catch(()=>null);
let worker,output='',requests=0,confirmed=true,autoConfirm=false;
const uid='44444444-4444-4444-8444-444444444444';
const token=(at)=>[{alg:'HS256',typ:'JWT'},{sub:uid,amr:[{method:'oauth',timestamp:at}],exp:Math.floor(Date.now()/1000)+3600},'test-only'].map(x=>Buffer.from(typeof x==='string'?x:JSON.stringify(x)).toString('base64url')).join('.');
let jwt=token(Math.floor(Date.now()/1000)),removed=false,failAdmin=true,deletedIds=[];
let metadata={full_name:'Profesor test'};
const user=()=>({id:uid,aud:'authenticated',role:'authenticated',email:'fixture@example.test',email_confirmed_at:confirmed?'2026-10-04T00:00:00Z':null,created_at:'2026-10-04T00:00:00Z',app_metadata:{provider:'email'},identities:[{provider:'google'},{provider:'apple'},{provider:'google'},{provider:'unsupported'}],user_metadata:metadata});
const session=()=>({access_token:jwt,token_type:'bearer',expires_in:3600,refresh_token:'synthetic-refresh',user:user()});
const server=createServer(async(req,res)=>{
 requests++;let raw='';for await(const chunk of req)raw+=chunk;
 const b=raw?JSON.parse(raw):{},url=new URL(req.url,mockOrigin);
 const send=(data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
 if(url.pathname==='/auth/v1/token')return b.password==='valid-test-password'?send(session()):send({msg:'Invalid login credentials',code:'invalid_credentials'},400);
 if(url.pathname==='/auth/v1/user'){
  if(removed||req.headers.authorization!==`Bearer ${jwt}`)return send({msg:'Invalid token',code:'bad_jwt'},401);
  if(req.method==='PUT'&&b.data)metadata={...metadata,...b.data};
  return send(user());
 }
 if(url.pathname.startsWith('/auth/v1/admin/users/')){
  assert.equal(req.method,'DELETE');assert.equal(req.headers.apikey,'synthetic-admin-key');assert.equal(b.should_soft_delete,false);deletedIds.push(url.pathname.split('/').at(-1));
  if(failAdmin)return send({msg:'Simulated admin outage'},503);removed=true;return send(user());
 }
 if(url.pathname==='/auth/v1/signup')return send(autoConfirm?session():user());
 if(url.pathname==='/auth/v1/recover'||url.pathname==='/auth/v1/resend')return send({});
 if(url.pathname==='/auth/v1/logout'){res.writeHead(204);return res.end();}
 if(url.pathname==='/auth/v1/verify')return b.token_hash==='valid-recovery'?send(session()):send({msg:'Token expired',code:'otp_expired'},403);
 return send({msg:'Unknown test endpoint'},404);
});
const cookies=new Map();
function applyCookies(response){for(const c of response.headers.getSetCookie()){const pair=c.split(';')[0],at=pair.indexOf('=');cookies.set(pair.slice(0,at),pair.slice(at+1));}}
async function call(path='/api/account',body,extra={},method=body?'POST':'GET'){
 const headers={Origin:origin,'Content-Type':'application/json',Cookie:[...cookies].map(([k,v])=>k+'='+v).join('; '),...extra};for(const key of Object.keys(headers))if(headers[key]===null)delete headers[key];
 const response=await fetch(origin+path,{method,redirect:'manual',headers,...(body?{body:JSON.stringify(body)}:{})});
 applyCookies(response);return response;
}
async function action(body,status){const r=await call('/api/account',body);assert.equal(r.status,status,JSON.stringify(body.action));return r;}
function sql(query){return JSON.parse(execFileSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--config','dist/server/wrangler.json','--local','--persist-to','.wrangler/account-test','--command',query,'--json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));}
try{
 const migrations=(await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort();
 sql((await Promise.all(migrations.map(f=>readFile('drizzle/'+f,'utf8')))).join('\n'));
 const bucket=JSON.parse(await readFile('dist/server/wrangler.json','utf8')).r2_buckets.find(b=>b.binding==='DOCUMENTS').bucket_name;
 const r2=(action,id)=>spawnSync(process.execPath,['./node_modules/wrangler/bin/wrangler.js','r2','object',action,bucket+'/'+id,'--config','dist/server/wrangler.json','--local','--persist-to','.wrangler/account-test',...(action==='put'?['--pipe']:['--pipe'])],{input:action==='put'?'synthetic private original':undefined,encoding:'utf8'});
 assert.equal(r2('put','own-doc').status,0);assert.equal(r2('get','own-doc').status,0);
 sql(`INSERT INTO projects(id,user_id,name,created_at) VALUES('own-project','supabase:${uid}','Own',1),('other-project','supabase:55555555-5555-4555-8555-555555555555','Other',1);
 INSERT INTO conversations(id,user_id,title,project_id,messages,selection,revision,created_at,updated_at,deleted) VALUES('own-chat','supabase:${uid}','Own','own-project','[]','null',0,1,1,0),('own-deleted-chat','supabase:${uid}','Old',NULL,'[]','null',0,1,1,1),('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','supabase:55555555-5555-4555-8555-555555555555','Other','other-project','[]','null',0,1,1,0);
 INSERT INTO documents(id,user_id,chat_id,name,mime,size,status,created_at) VALUES('own-doc','supabase:${uid}','own-chat','Own','text/plain',24,'ready',1),('other-doc','supabase:55555555-5555-4555-8555-555555555555','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Other','text/plain',10,'ready',1);`);
 await new Promise(resolve=>server.listen(3098,'127.0.0.1',resolve));
 await writeFile(configPath,`AUTH_PROVIDER=supabase\nSUPABASE_URL=${mockOrigin}\nSUPABASE_PUBLISHABLE_KEY=synthetic-publishable-key\nSUPABASE_SECRET_KEY=synthetic-admin-key\nOPENAI_API_KEY=synthetic-never-used\nAPP_ORIGIN=${origin}\nAUTH_GOOGLE_ENABLED=true\nAUTH_APPLE_ENABLED=${socialOnly}\nAUTH_EMAIL_ENABLED=${!socialOnly}\nAUTH_REGISTRATION_ENABLED=true\n`,{mode:0o600});
 worker=spawn(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','dev','--config','dist/server/wrangler.json','--local','--persist-to','.wrangler/account-test','--ip','127.0.0.1','--inspector-port','0','--port','3099'],{stdio:['ignore','pipe','pipe']});
 worker.stdout.on('data',b=>output+=b);worker.stderr.on('data',b=>output+=b);
 let ready=false;for(let i=0;i<80;i++){try{const r=await call();if(r.ok){ready=true;break;}}catch{}await delay(250);}
 assert.ok(ready,'Local Worker did not become ready');
 let r=await call();assert.equal((await r.json()).user,null);assert.match(r.headers.get('Cache-Control'),/no-store/);assert.equal(r.headers.get('X-Content-Type-Options'),'nosniff');assert.equal(r.headers.get('X-Frame-Options'),'DENY');assert.match(r.headers.get('Content-Security-Policy'),/object-src 'none'/);
 r=await call('/api/library');assert.equal(r.status,200);const publicLibrary=await r.json();assert.ok(publicLibrary.items.length>0);assert.ok(publicLibrary.items.every(item=>item.kind==='manual'),'Guest must never see private documents');assert.match(r.headers.get('Cache-Control'),/no-store/);assert.equal((await call('/api/library?chatId=own-chat')).status,401);assert.equal((await call('/api/documents?chatId=own-chat')).status,401);assert.equal((await call('/api/history')).status,401);assert.equal((await call('/api/library/status')).status,401);
 r=await call('/api/account',undefined,{'oai-authenticated-user-id':'spoofed'});assert.equal((await r.json()).user,null,'No fallback to Sites identity in Supabase mode');
 r=await call('/api/account',{action:'login',email:'fixture@example.test',password:'valid-test-password'},{Origin:'https://untrusted.example'});assert.equal(r.status,403);
 if(socialOnly){
  const flags=await(await call()).json();assert.equal(flags.emailEnabled,false);assert.equal(flags.registration,false);
  const before=requests;
  for(const name of ['login','register','forgot','resend','password','email'])await action({action:name,email:'fixture@example.test',password:'valid-test-password'},503);
  r=await call('/auth/callback?token_hash=valid-recovery&type=recovery');assert.match(r.headers.get('location'),/email-disabled/);
  assert.equal(requests,before,'Disabled email flows must not contact the provider');
  for(const provider of ['google','apple']){
   const result=await action({action:'oauth',provider},200);const url=new URL((await result.json()).url);
   assert.equal(url.searchParams.get('provider'),provider);assert.equal(url.searchParams.get('redirect_to'),origin+'/auth/callback');assert.ok(url.searchParams.get('code_challenge'));
  }
  console.log('PASS: social-only mode enables Google/Apple PKCE and blocks every email/password endpoint and token-hash callback without provider calls.');
 }else{
 await action({action:'register',email:'fixture@example.test',password:'short'},400);
 await action({action:'login',email:'fixture@example.test',password:'wrong'},401);
 confirmed=false;await action({action:'login',email:'fixture@example.test',password:'valid-test-password'},401);assert.equal((await(await call()).json()).user,null);
 confirmed=true;r=await action({action:'login',email:'fixture@example.test',password:'valid-test-password'},200);
 assert.ok(r.headers.getSetCookie().some(c=>c.startsWith('profos-auth=')&&/httponly/i.test(c)&&/samesite=lax/i.test(c)),'Session cookie must be HTTP-only and SameSite=Lax');
 const before=requests,identity=(await(await call()).json()).user;assert.equal(identity.id,'supabase:'+uid);assert.equal(identity.emailVerified,true);assert.deepEqual(identity.linkedProviders,['google','apple']);assert.ok(requests>before,'Identity must be checked remotely');
 await action({action:'profile',name:'Profesor test'},200);
 assert.equal((await(await call()).json()).user.teaching,null);
 await action({action:'teaching',teaching:{role:'teacher',subject:'invalid',stages:['middle']}},400);
 await action({action:'teaching',teaching:{role:'primary',subject:'irrelevant',stages:['high']}},200);
 let configured=await(await call()).json();assert.deepEqual(configured.user.teaching,{role:'primary',subject:'*',stages:['primary']});assert.deepEqual(configured.defaultManualIds,[]);
 await action({action:'teaching',teaching:{role:'teacher',subject:'Matematică',stages:['middle']}},200);
 configured=await(await call()).json();assert.equal(configured.defaultManualIds.length,9);
 await action({action:'profile',name:'Nume care nu se salvează',teaching:{role:'teacher',subject:'invalid',stages:['middle']}},400);
 assert.equal((await(await call()).json()).user.name,'Profesor test');
 await action({action:'profile',name:'Profil unificat',teaching:{role:'teacher',subject:'Matematică',stages:['middle']}},200);
 configured=await(await call()).json();assert.equal(configured.user.name,'Profil unificat');assert.equal(configured.user.teaching.subject,'Matematica');
 console.log('PASS: unified profile saves name/teaching together; invalid teaching prevents partial name update.');

 const label={category:'collection',subject:'Matematică',stages:['middle']};
 const patch=(id,data,headers={})=>call('/api/documents/'+id,data,headers,'PATCH');
 assert.equal((await patch('own-doc',label)).status,200);
 assert.equal((await patch('other-doc',label)).status,404);
 assert.equal((await patch('own-doc',{...label,category:'invalid'})).status,400);
 assert.equal((await patch('own-doc',label,{Origin:'https://untrusted.example'})).status,403);assert.equal((await patch('own-doc',label,{Origin:null})).status,403);
 assert.equal((await patch('own-doc',label,{'Content-Type':'text/plain'})).status,415);
 let library=await(await call('/api/library')).json();
 assert.ok(library.items.some(i=>i.id==='own-doc'&&i.category==='collection'&&i.subject==='Matematica'));
 assert.ok(!library.items.some(i=>i.id==='other-doc'));
 assert.deepEqual(library.selection.documentIds,['own-doc'],'Matching owned materials from any conversation are selected');
 assert.equal((await patch('own-doc',{...label,modelTypes:['test','rubric']})).status,200);
 library=await(await call('/api/library')).json();
 assert.deepEqual(library.items.find(i=>i.id==='own-doc').modelTypes,['test','rubric']);
 assert.deepEqual(library.selection.documentIds,[],'Models guide style without becoming automatic factual evidence');
 assert.equal((await patch('other-doc',{...label,modelTypes:['test']})).status,404);
 assert.equal((await patch('own-doc',{...label,modelTypes:['unit']})).status,200);
 library=await(await call('/api/library')).json();
 assert.deepEqual(library.items.find(i=>i.id==='own-doc').modelTypes,['unit']);
 assert.equal((await patch('other-doc',{...label,modelTypes:['unit']})).status,404);
 assert.equal((await patch('own-doc',{...label,modelTypes:['unit']},{Origin:'https://untrusted.example'})).status,403);
 assert.equal((await patch('own-doc',{...label,modelTypes:['unknown']})).status,400);
 assert.equal((await patch('own-doc',{...label,modelTypes:['test','test']})).status,400);
 assert.equal((await patch('own-doc',{...label,subject:'unknown'})).status,400);
 assert.equal((await patch('own-doc',{...label,modelTypes:[],scope:'shared'})).status,200);
 library=await(await call('/api/library')).json();
 assert.deepEqual(library.selection.documentIds,['own-doc']);
 assert.ok(!('scope' in library.items.find(i=>i.id==='own-doc')),'Client cannot publish private models');
 console.log('PASS: private model labels persist, foreign write denied, invalid/duplicate types rejected, automatic fact selection excludes models and unmarking restores it.');
 assert.equal((await patch('own-doc',{...label,stages:['high']})).status,200);
 library=await(await call('/api/library')).json();assert.deepEqual(library.selection.documentIds,[]);
 for(const category of ['manual','collection','olympiad','competition','document']){
  assert.equal((await patch('own-doc',{...label,category})).status,200);
  library=await(await call('/api/library')).json();assert.deepEqual(library.selection.documentIds,['own-doc']);
 }
 sql(`INSERT INTO document_labels(document_id,user_id,metadata) VALUES('other-doc','supabase:55555555-5555-4555-8555-555555555555','{"category":"competition","subject":"Matematica","stages":["middle"]}')`);
 const newChat=await(await call('/api/history',{projectId:null})).json();
 const edit={id:newChat.id,revision:0,messages:[],projectId:null,selection:{mode:'automatic',manualIds:['stale'],documentIds:['other-doc']}};
 assert.equal((await call('/api/history',edit,{},'PUT')).status,200);
 let stored=await(await call('/api/history?id='+newChat.id)).json();assert.ok(!('user_id' in stored.chat));assert.deepEqual(stored.chat.selection,{mode:'automatic',manualIds:[],documentIds:[]});
 edit.revision=1;edit.selection={mode:'manual',manualIds:[],documentIds:['own-doc']};
 assert.equal((await call('/api/history',edit,{},'PUT')).status,200);
 stored=await(await call('/api/history?id='+newChat.id)).json();assert.deepEqual(stored.chat.selection,edit.selection);
 // Generated source stays exact in owner-only history, including unsupported TeX.
 const latexDoc={title:'Test LaTeX',content:'Calculați $2^3$.',latex:String.raw`\documentclass{article}
\title{Test LaTeX}
\begin{document}Calculați $2^3$. \customlayout{kept}\end{document}`};
 edit.revision=2;edit.messages=[{role:'assistant',content:latexDoc.content,document:latexDoc}];
 assert.equal((await call('/api/history',edit,{},'PUT')).status,200);
 stored=await(await call('/api/history?id='+newChat.id)).json();assert.deepEqual(stored.chat.messages[0].document,latexDoc);
 assert.equal((await call('/api/history?id=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')).status,404);
 assert.equal((await call('/api/history',{...edit,revision:3,id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'}, {}, 'PUT')).status,409);
 for(const bad of [null,123,'x'.repeat(60001),''])assert.equal((await call('/api/history',{...edit,revision:3,messages:[{role:'assistant',content:'Text',document:{...latexDoc,latex:bad}}]}, {}, 'PUT')).status,400);
 assert.equal((await call('/api/history',{...edit,revision:3},{Origin:'https://untrusted.example'},'PUT')).status,403);
 console.log('PASS: exact private LaTeX persistence, foreign chat read/write rejection, source bounds and CSRF.');
 console.log('PASS: all resource categories, classification ownership/CSRF/validation, subject/cycle matching, automatic cross-chat selection, compact automatic persistence and preserved manual selection.');
 if(process.argv.includes('--preview')){
  await patch('own-doc',{...label,category:'document',modelTypes:['test','rubric']});
  sql("UPDATE documents SET name='Model de test — clasa V' WHERE id='own-doc'");
  console.log('UI preview ready at '+origin+'; synthetic fixture@example.test / valid-test-password. Stop with SIGINT.');
  await new Promise(resolve=>process.once('SIGINT',resolve));throw new Error('PREVIEW_FINISHED');
 }
 await action({action:'delete',confirmation:'wrong'},400);


 await action({action:'email',email:'new@example.test'},200);
 await action({action:'logout'},200);assert.equal((await(await call()).json()).user,null);
 await action({action:'register',email:'fixture@example.test',password:'valid-test-password'},200);assert.equal((await(await call()).json()).user,null);
 autoConfirm=true;await action({action:'register',email:'fixture@example.test',password:'valid-test-password'},503);assert.equal((await(await call()).json()).user,null);autoConfirm=false;
 await action({action:'forgot',email:'fixture@example.test'},200);await action({action:'resend',email:'fixture@example.test'},200);
 await action({action:'oauth',provider:'apple'},503);
 r=await action({action:'oauth',provider:'google'},200);const authUrl=new URL((await r.json()).url);assert.equal(authUrl.searchParams.get('provider'),'google');assert.equal(authUrl.searchParams.get('redirect_to'),origin+'/auth/callback');assert.ok(authUrl.searchParams.get('code_challenge'));
 r=await call('/auth/callback?token_hash=invalid&type=recovery');assert.equal(r.status,303);assert.match(r.headers.get('location'),/invalid-link/);
 r=await call('/auth/callback?token_hash=valid-recovery&type=recovery&next=https://untrusted.example');assert.equal(r.status,303);assert.equal(new URL(r.headers.get('location')).origin,origin);assert.match(r.headers.get('location'),/view=reset/);
 assert.ok((await(await call()).json()).user);
 await action({action:'password',password:'another-test-password'},200);assert.equal((await(await call()).json()).user,null);
 // A fabricated cookie must never authenticate a user.
 cookies.set('profos-auth','base64-'+Buffer.from(JSON.stringify({...session(),access_token:jwt+'tampered'})).toString('base64url'));
 assert.equal((await(await call()).json()).user,null);
 await action({action:'login',email:'fixture@example.test',password:'valid-test-password'},200);
 jwt=token(Math.floor(Date.now()/1000)-1800);await action({action:'login',email:'fixture@example.test',password:'valid-test-password'},200);
 r=await action({action:'delete',confirmation:'STERGE'},409);assert.equal((await r.json()).reauthenticate,true);assert.equal(deletedIds.length,0);
 jwt=token(Math.floor(Date.now()/1000));await action({action:'login',email:'fixture@example.test',password:'valid-test-password'},200);
 r=await action({action:'delete',confirmation:'STERGE',userId:'someone-else'},503);assert.match((await r.json()).error,/nu este completă/);
 assert.equal((await(await call()).json()).user.deleting,true);
 assert.equal((await call('/api/history')).status,401);await action({action:'profile',name:'Cannot update during deletion'},409);
 failAdmin=false;r=await action({action:'delete',confirmation:'STERGE',userId:'someone-else'},200);const erased=await r.json();assert.equal(erased.clearLocalData,true);assert.match(erased.redirect,/apple=1/);
 assert.deepEqual(deletedIds,[uid,uid],'Deletion target is always the authenticated UID');assert.equal((await(await call()).json()).user,null);
 const projects=sql('SELECT id FROM projects')[0].results,chats=sql('SELECT id FROM conversations')[0].results,documents=sql('SELECT id FROM documents')[0].results,markers=sql('SELECT * FROM account_deletions')[0].results;
 assert.deepEqual(projects,[{id:'other-project'}]);assert.deepEqual(chats,[{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'}]);assert.deepEqual(documents,[{id:'other-doc'}]);assert.deepEqual(markers,[]);assert.deepEqual(sql('SELECT document_id FROM document_labels')[0].results,[{document_id:'other-doc'}]);assert.notEqual(r2('get','own-doc').status,0,'Private R2 original is erased');
 console.log('PASS: erasure reauthentication, provider outage, inaccessible pending account, retry, authenticated target, complete own D1 cleanup (including deleted chats), other-user isolation and session invalidation.');
 console.log('PASS: configuration, CSRF, verification gate, remote identity, session cookies, register/login/logout, profile, email, password recovery, OAuth PKCE, safe redirects, tampered session.');
 }
 console.log('Provider is mocked; Google/Apple login and delivery through Resend require separate live acceptance tests.');
}catch(error){if(error.message!=='PREVIEW_FINISHED')throw error;}finally{
 if(worker){worker.kill('SIGTERM');await Promise.race([new Promise(resolve=>worker.once('exit',resolve)),delay(3000)]);}
 await new Promise(resolve=>server.close(resolve));
 if(original)await writeFile(configPath,original,{mode:0o600});else await rm(configPath,{force:true});
 await rm('.wrangler/account-test',{recursive:true,force:true});
}
