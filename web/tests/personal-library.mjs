// P-080: biblioteca personală — identificator derivat pe server, includere automată, rute fără conversație.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const uri=s=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const libraryUri=uri(await readFile('lib/personal-library.ts','utf8')),lib=await import(libraryUri);
const chatPattern=/^[0-9a-f]{8}-[0-9a-f-]{27}$/i;
const a=await lib.personalLibraryId('supabase:aaaa'),a2=await lib.personalLibraryId('supabase:aaaa'),b=await lib.personalLibraryId('supabase:bbbb');
assert.equal(a,a2);assert.notEqual(a,b);assert.match(a,chatPattern);assert.match(a,/^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
await assert.rejects(lib.personalLibraryId(''));
assert.deepEqual(lib.withoutPersonalLibrary([{id:a},{id:'x'}],a),[{id:'x'}]);
console.log('PASS: deterministic per-account library id, valid format, distinct accounts, hidden from conversation lists.');

const optionsUri=uri(await readFile('lib/exercise-options.ts','utf8'));
const selection=await import(uri((await readFile('lib/source-selection.ts','utf8')).replace(/import[^;]+from '\.\/teaching-profile';/,'const matchesTeaching=(item,profile)=>item.subject===profile.subject;').replace("'./exercise-options'",JSON.stringify(optionsUri))));
const items=[{id:'p-ready',kind:'document',status:'ready',personal:true,subject:'Istorie'},{id:'p-indexing',kind:'document',status:'indexing',personal:true},{id:'p-model',kind:'document',status:'ready',personal:true,modelTypes:['test']},{id:'other-chat',kind:'document',status:'ready',chatId:'c2',subject:'Istorie'},{id:'m',kind:'manual',status:'ready',subject:'Matematică'}];
const auto=selection.automaticSources(items,{role:'teacher',subject:'Matematică',stages:['middle']},'c1');
assert.deepEqual(auto.documentIds,['p-ready']);assert.deepEqual(auto.manualIds,['m']);
console.log('PASS: ready personal documents are automatic sources in every conversation; indexing/model documents and other conversations are not.');

// Upload route with fake storage: the library group comes from the verified account, never from the client.
const calls=[];let reserve=1;
const documentsRoute=(await readFile('app/api/documents/route.ts','utf8')).replace(/^import .*;\s*$/gm,'');
const stubs=`import {PERSONAL_LIBRARY_LIMIT,personalLibraryId} from ${JSON.stringify(libraryUri)};
const ownedClass=async()=>null,userProjectIds=async()=>[],isClassSection=()=>false,classDocumentsId=async()=>'x',hiddenGroupIds=async user=>new Set([await personalLibraryId(user)]);
const json=(body,status=200)=>Response.json(body,{status});const sameOrigin=()=>true;const userId=async()=>globalThis.__user;
const validChatId=v=>typeof v==='string'&&${chatPattern}.test(v);const accountIdentity=async()=>({teaching:null});const resourceMetadata=()=>null;const saveDocumentLabels=async()=>true;
const statement=sql=>({bind:(...args)=>({run:async()=>{globalThis.__calls.push({sql,args});return {meta:{changes:sql.startsWith('INSERT')?globalThis.__reserve:1}};},first:async()=>{globalThis.__calls.push({sql,args});return null;}})});
const storage=()=>({db:{prepare:statement},bucket:{put:async()=>{}},key:'k'});
const openai=async(k,path)=>({json:async()=>({id:path==='/files'?'file-1':'vs-1'})});
const publicDocument=r=>r,refreshDocument=async r=>r,rowsForChat=async()=>[];`;
globalThis.__calls=calls;globalThis.__user='supabase:aaaa';Object.defineProperty(globalThis,'__reserve',{get:()=>reserve});
const documents=await import(uri(stubs+documentsRoute));
const upload=fields=>{const form=new FormData();form.append('file',new File(['Plan de lecție'],'plan.txt',{type:'text/plain'}));for(const [k,v] of Object.entries(fields))form.append(k,v);return new Request('http://localhost/api/documents',{method:'POST',headers:{origin:'http://localhost'},body:form});};
let r=await documents.POST(upload({scope:'library'}));assert.equal(r.status,202);
const insert=calls.find(c=>c.sql.startsWith('INSERT INTO documents'));assert.equal(insert.args[2],a,'library documents use the derived group id');
assert.ok(!calls.some(c=>c.sql.includes('FROM conversations')),'library upload does not require a conversation');
calls.length=0;r=await documents.POST(upload({scope:'library',chatId:'00000000-0000-4000-8000-000000000000'}));assert.equal(r.status,202);assert.equal(calls.find(c=>c.sql.startsWith('INSERT INTO documents')).args[2],a,'client chatId cannot redirect a library upload');
r=await documents.POST(upload({scope:'other'}));assert.equal(r.status,400);
r=await documents.POST(upload({chatId:a}));assert.equal(r.status,400,'the library group cannot be used as a conversation');
calls.length=0;r=await documents.POST(upload({chatId:'11111111-1111-4111-8111-111111111111'}));assert.equal(r.status,404,'normal uploads still require an owned conversation');
reserve=0;r=await documents.POST(upload({scope:'library'}));assert.equal(r.status,409);assert.match((await r.json()).error,new RegExp('cel mult '+lib.PERSONAL_LIBRARY_LIMIT));reserve=1;
globalThis.__user=null;r=await documents.POST(upload({scope:'library'}));assert.equal(r.status,401);globalThis.__user='supabase:aaaa';
console.log('PASS: library uploads need an account, use the server-derived group, keep limits and never require or reuse a conversation.');

// History hides the library group and refuses to treat it as a conversation.
const historyRoute=(await readFile('app/api/history/route.ts','utf8')).replace(/^import .*;\s*$/gm,'');
const historyStubs=`import {personalLibraryId} from ${JSON.stringify(libraryUri)};
const hiddenGroupIds=async user=>new Set([await personalLibraryId(user)]),userProjectIds=async()=>[],listClasses=async()=>[];
const json=(body,status=200)=>Response.json(body,{status});const sameOrigin=()=>true;const userId=async()=>'supabase:aaaa';const validChatId=()=>true;const validSelection=()=>true,savedSelection=v=>v,validGeneratedDocument=()=>true;
const rows=sql=>sql.includes('FROM projects')?[]:[{id:${JSON.stringify(a)},title:'Documente anterioare'},{id:'chat-1',title:'Lecție'}];
const storage=()=>({db:{prepare:sql=>({bind:()=>({run:async()=>({meta:{changes:1}}),all:async()=>({results:rows(sql)}),first:async()=>({id:'x',messages:'[]',selection:'null'})})})}});`;
const history=await import(uri(historyStubs+historyRoute));
r=await history.GET(new Request('http://localhost/api/history'));assert.deepEqual((await r.json()).chats.map(c=>c.id),['chat-1']);
r=await history.GET(new Request('http://localhost/api/history?id='+a));assert.equal(r.status,404);
r=await history.PUT(new Request('http://localhost/api/history',{method:'PUT',headers:{origin:'http://localhost'},body:JSON.stringify({id:a,revision:0,messages:[]})}));assert.equal(r.status,400);
r=await history.DELETE(new Request('http://localhost/api/history?kind=chat&id='+a,{method:'DELETE',headers:{origin:'http://localhost'}}));assert.equal(r.status,400);
console.log('PASS: the library group is hidden from history and cannot be opened, overwritten or deleted as a conversation.');
