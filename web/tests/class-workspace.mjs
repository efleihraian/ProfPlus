// P-081: Clasele mele — clase ca proiecte ale contului, documente pe secțiuni, jurnal (observații/personalizări), ștergere.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const uri=s=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const libraryUri=uri(await readFile('lib/personal-library.ts','utf8'));
const workspaceUri=uri((await readFile('lib/class-workspace.ts','utf8')).replace('"./personal-library"',JSON.stringify(libraryUri)));
const w=await import(workspaceUri);
assert.equal(w.classTitle(5,'B'),'Clasa a V-a B');assert.equal(w.classTitle(0,'A'),'Clasa pregătitoare A');assert.equal(w.classTitle(1,'C'),'Clasa I C');
assert.deepEqual(w.parseClassTitle('Clasa a XII-a J'),{g:12,l:'J'});assert.equal(w.parseClassTitle('Proiectul meu'),null);
assert.equal(w.validGrade(13,'A'),false);assert.equal(w.validGrade(4,'K'),false);assert.equal(w.validGrade(4,'A'),true);
const j1=await w.classJournalId('u1','p1'),j2=await w.classJournalId('u2','p1'),d1=await w.classDocumentsId('u1','p1','teste'),d2=await w.classDocumentsId('u1','p1','fise');
assert.equal(new Set([j1,j2,d1,d2,await w.personalLibraryId?.('u1')||'lib']).size,5);
const hidden=await w.hiddenGroupIds('u1',['p1']);assert.ok(hidden.has(j1)&&hidden.has(d1)&&hidden.has(d2)&&!hidden.has(j2));
const good={settings:{subject:' Matematică ',level:'mediu',students:26,manual:'',preferences:''},notes:[{id:'n1',date:'2026-10-15',tag:'lectie',text:' A mers bine. '}]};
assert.equal(w.validJournal(good).settings.subject,'Matematică');assert.equal(w.validJournal(good).notes[0].text,'A mers bine.');
for(const bad of [{...good,settings:{...good.settings,students:61}},{...good,settings:{...good.settings,level:'x'}},{...good,notes:[{...good.notes[0],text:'x'.repeat(1001)}]},{...good,notes:[{...good.notes[0],tag:'elev'}]},{...good,notes:[{...good.notes[0],date:'15.10.2026'}]},{...good,notes:Array.from({length:201},(_,i)=>({...good.notes[0],id:'n'+i}))}])assert.equal(w.validJournal(bad),null);
assert.equal(w.classContext('Clasa a V-a B',w.validJournal(good).settings),'Clasa a V-a B, disciplina Matematică, nivel mediu, 26 elevi');
console.log('PASS: class titles, per-account derived groups, journal validation limits and generation context.');

// Rute cu bază de date simulată: proprietar, limite, jurnal cu revizie și ștergere completă.
const state={projects:[],conversations:[],documents:{},deleted:[]};
globalThis.__state=state;globalThis.__user='supabase:u1';
const fakeDb=`const S=globalThis.__state;
const statement=sql=>({bind:(...a)=>({
 all:async()=>{if(sql.startsWith('SELECT id,name FROM projects'))return {results:S.projects.filter(p=>p.user_id===a[0])};if(sql.startsWith('SELECT id,title,project_id,revision,updated_at FROM conversations'))return {results:S.conversations.filter(c=>c.user_id===a[0]&&!c.deleted)};return {results:[]};},
 first:async()=>{if(sql.startsWith('SELECT id,title,project_id,messages'))return S.conversations.find(c=>c.id===a[0]&&c.user_id===a[1]&&!c.deleted)||null;return null;},
 run:async()=>{let changes=0;
  if(sql.startsWith('INSERT INTO projects')){S.projects.push({id:a[0],user_id:a[1],name:a[2]});changes=1;}
  else if(sql.startsWith('INSERT INTO conversations')){if(S.conversations.some(c=>c.id===a[0]))throw Error('PK');S.conversations.push({id:a[0],user_id:a[1],title:'Conversație nouă',project_id:a[2],messages:'[]',revision:0,deleted:0,updated_at:a[3]});changes=1;}
  else if(sql.startsWith('UPDATE conversations SET title=?')){const c=S.conversations.find(c=>c.id===a[5]&&c.user_id===a[6]&&c.revision===a[7]&&!c.deleted);if(c){Object.assign(c,{title:a[0],project_id:a[1],messages:a[2],revision:c.revision+1});changes=1;}}
  else if(sql.startsWith('UPDATE conversations SET deleted=1')){const c=S.conversations.find(c=>c.id===a[1]&&c.user_id===a[2]&&!c.deleted);if(c){c.deleted=1;c.messages='[]';changes=1;}}
  else if(sql.startsWith('UPDATE conversations SET project_id=NULL')){for(const c of S.conversations)if(c.project_id===a[0]&&c.user_id===a[1]){c.project_id=null;changes++;}}
  else if(sql.startsWith('DELETE FROM projects')){const n=S.projects.length;S.projects=S.projects.filter(p=>!(p.id===a[0]&&p.user_id===a[1]));changes=n-S.projects.length;}
  return {meta:{changes}};}})});
const db={prepare:statement,batch:async list=>Promise.all(list.map(s=>s.run()))};
const storage=()=>({db});const json=(b,s=200)=>Response.json(b,{status:s});const sameOrigin=()=>true;const userId=async()=>globalThis.__user;
const validChatId=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(v);`;
const strip=s=>s.replace(/^import [\s\S]*?;\s*$/gm,'');
const storeUri=uri(fakeDb+strip(await readFile('lib/class-store.ts','utf8')).replace(/^/,`import {parseClassTitle} from ${JSON.stringify(workspaceUri)};\n`));
const common=`import * as W from ${JSON.stringify(workspaceUri)};const {CLASS_SECTIONS,JOURNAL_TITLE,MAX_CLASSES,classDocumentGroups,classJournalId,classTitle,emptyJournal,validGrade,validJournal}=W;import {listClasses,ownedClass} from ${JSON.stringify(storeUri)};${fakeDb}
const parallelMap=async(r,f)=>Promise.all(r.map(f)),refreshDocument=async r=>r,publicDocument=r=>({id:r.id,name:r.name,status:r.status}),rowsForChat=async(u,g)=>(S.documents[g]||[]).filter(r=>r.user_id===u);
const deleteOwnedDocument=async(u,row)=>{S.deleted.push(row.id);for(const k in S.documents)S.documents[k]=S.documents[k].filter(r=>r.id!==row.id);};`;
const list=await import(uri(common+strip(await readFile('app/api/classes/route.ts','utf8'))));
const one=await import(uri(common+strip(await readFile('app/api/classes/[id]/route.ts','utf8'))));
const req=(url,method='GET',body)=>new Request('http://localhost'+url,{method,headers:{origin:'http://localhost','content-type':'application/json'},...(body!==undefined?{body:JSON.stringify(body)}:{})});
let r=await list.POST(req('/api/classes','POST',{g:5,l:'B'}));assert.equal(r.status,201);const cls=(await r.json()).class;
assert.equal((await list.POST(req('/api/classes','POST',{g:5,l:'B'}))).status,409);
assert.equal((await list.POST(req('/api/classes','POST',{g:14,l:'B'}))).status,400);
state.projects.push({id:'aaaaaaaa-0000-4000-8000-000000000000',user_id:'supabase:u1',name:'Proiect personal'});
assert.deepEqual((await (await list.GET(req('/api/classes'))).json()).classes.map(c=>c.name),['Clasa a V-a B'],'ordinary projects are not classes');
globalThis.__user=null;assert.equal((await list.GET(req('/api/classes'))).status,401);globalThis.__user='supabase:u2';
const ctx={params:Promise.resolve({id:cls.id})};
assert.equal((await one.GET(req('/x'),{params:Promise.resolve({id:cls.id})})).status,404,'another account cannot read the class');
assert.equal((await one.DELETE(req('/x','DELETE'),{params:Promise.resolve({id:cls.id})})).status,404,'another account cannot delete the class');
globalThis.__user='supabase:u1';
let detail=await (await one.GET(req('/x'),ctx)).json();assert.equal(detail.revision,null);assert.equal(detail.journal.notes.length,0);
assert.equal((await one.PUT(req('/x','PUT',{journal:{...good,notes:[{...good.notes[0],text:''}]},revision:null}),ctx)).status,400);
r=await one.PUT(req('/x','PUT',{journal:good,revision:null}),ctx);assert.equal(r.status,200);const rev=(await r.json()).revision;
assert.equal((await one.PUT(req('/x','PUT',{journal:good,revision:null}),ctx)).status,409,'concurrent first save conflicts');
assert.equal((await one.PUT(req('/x','PUT',{journal:good,revision:rev-1}),ctx)).status,409,'stale revision conflicts');
const journalId=await w.classJournalId('supabase:u1',cls.id);
state.conversations.push({id:'chat-1',user_id:'supabase:u1',title:'Test fracții',project_id:cls.id,messages:'[]',revision:1,deleted:0,updated_at:2});
detail=await (await one.GET(req('/x'),ctx)).json();assert.equal(detail.journal.settings.students,26);assert.deepEqual(detail.conversations.map(c=>c.id),['chat-1'],'journal is not listed as a conversation');
assert.equal(state.conversations.find(c=>c.id===journalId).title,w.JOURNAL_TITLE);
const groups=await w.classDocumentGroups('supabase:u1',cls.id);state.documents[groups.teste]=[{id:'doc-1',user_id:'supabase:u1',name:'test.pdf',status:'ready',created_at:0}];
detail=await (await one.GET(req('/x'),ctx)).json();assert.equal(detail.documents.teste[0].name,'test.pdf');assert.equal(detail.documents.fise.length,0);
r=await one.DELETE(req('/x','DELETE'),ctx);assert.equal(r.status,200);assert.deepEqual(state.deleted,['doc-1']);
assert.ok(state.conversations.find(c=>c.id===journalId).deleted,'journal content removed');assert.equal(state.conversations.find(c=>c.id==='chat-1').project_id,null,'class conversations stay in history');
assert.ok(!state.projects.some(p=>p.id===cls.id));
console.log('PASS: classes are account-owned projects (401/404 for others), duplicates/invalid rejected, journal saved with revision control, deletion removes class documents and journal and keeps conversations.');

// Încărcare în secțiunea clasei: grup derivat din clasa deținută, fără etichete de profil.
const calls=[];globalThis.__calls=calls;globalThis.__labels=0;
const classId='bbbbbbbb-0000-4000-8000-000000000000';
const docStubs=`import {PERSONAL_LIBRARY_LIMIT,personalLibraryId} from ${JSON.stringify(libraryUri)};import {classDocumentsId,hiddenGroupIds,isClassSection} from ${JSON.stringify(workspaceUri)};
const ownedClass=async(u,id)=>id===${JSON.stringify(classId)}&&u==='supabase:u1'?{id,name:'Clasa a V-a B',g:5,l:'B'}:null,userProjectIds=async()=>[${JSON.stringify(classId)}];
const json=(b,s=200)=>Response.json(b,{status:s});const sameOrigin=()=>true;const userId=async()=>globalThis.__user;const validChatId=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(v);
const accountIdentity=async()=>({teaching:{subject:'Matematică',stages:['middle']}});const resourceMetadata=v=>v;const saveDocumentLabels=async()=>{globalThis.__labels++;return true;};
const statement=sql=>({bind:(...args)=>({run:async()=>{globalThis.__calls.push({sql,args});return {meta:{changes:1}};},first:async()=>null})});
const storage=()=>({db:{prepare:statement},bucket:{put:async()=>{}},key:'k'});const openai=async(k,path)=>({json:async()=>({id:path==='/files'?'file-1':'vs-1'})});`;
const docs=await import(uri(docStubs+strip(await readFile('app/api/documents/route.ts','utf8'))));
const upload=fields=>{const form=new FormData();form.append('file',new File(['Fișă'],'fisa.txt',{type:'text/plain'}));for(const [k,v] of Object.entries(fields))form.append(k,v);return new Request('http://localhost/api/documents',{method:'POST',headers:{origin:'http://localhost'},body:form});};
globalThis.__user='supabase:u1';
r=await docs.POST(upload({scope:'class',classId,section:'teste'}));assert.equal(r.status,202);
assert.equal(calls.find(c=>c.sql.startsWith('INSERT INTO documents')).args[2],await w.classDocumentsId('supabase:u1',classId,'teste'));assert.equal(globalThis.__labels,0,'class documents get no profile labels');
assert.equal((await docs.POST(upload({scope:'class',classId,section:'catalog'}))).status,400);
globalThis.__user='supabase:u2';assert.equal((await docs.POST(upload({scope:'class',classId,section:'teste'}))).status,400,'foreign class rejected');
globalThis.__user='supabase:u1';assert.equal((await docs.POST(upload({chatId:await w.classJournalId('supabase:u1',classId)}))).status,400,'journal cannot receive chat uploads');
r=await docs.POST(upload({chatId:'11111111-1111-4111-8111-111111111111'}));assert.equal(r.status,404);
console.log('PASS: class uploads use the owned class section group without profile labels; foreign classes, invalid sections and internal groups are rejected.');
const optionsUri=uri(await readFile('lib/exercise-options.ts','utf8'));
const sel=await import(uri((await readFile('lib/source-selection.ts','utf8')).replace(/import[^;]+from '\.\/teaching-profile';/,'const matchesTeaching=()=>false;').replace("'./exercise-options'",JSON.stringify(optionsUri))));
const items=[{id:'c1',kind:'document',status:'ready',classId:'P1'},{id:'c2',kind:'document',status:'ready',classId:'P2'},{id:'c3',kind:'document',status:'indexing',classId:'P1'}];
assert.deepEqual(sel.automaticSources(items,null,'chat','P1').documentIds,['c1']);assert.deepEqual(sel.automaticSources(items,null,'chat',undefined).documentIds,[]);
console.log('PASS: ready class documents are automatic sources only in conversations of that class.');
