import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const uri=s=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const helper=uri(await readFile('lib/common-resource.ts','utf8'));
let code=await readFile('lib/cloud-library.ts','utf8');code=code.replace(/import .* from '.\/supabase-storage';/,'').replace("'./common-resource'",JSON.stringify(helper));
const uid='competition-'+ 'a'.repeat(24);
const metadata={category:'olympiad',title:'Subiecte',subject:'Matematică',publisher:'Organizator',url:'https://example.org/subiect.pdf',stages:['middle']};
const rows=[{family:'manuals',uid:'1-1',status:'indexed',file_id:'file-ready',attached:1},...Array.from({length:1200},(_,i)=>({family:'manuals',uid:(i+2)+'-1',status:'indexed',file_id:'file-'+i,attached:1})),{family:'manuals',uid:'9998-1',status:'indexed',file_id:null,attached:0},{family:'manuals',uid:'9999-1',status:'extracted',file_id:null,attached:0},{family:'competitions',uid,status:'indexed',file_id:'file-olympiad',attached:1,metadata:JSON.stringify(metadata)},{family:'competitions',uid:'competition-'+ 'b'.repeat(24),status:'skipped',metadata},{family:'private',uid:'private-document',status:'indexed',file_id:'private-file',attached:1,metadata}];
const m=await import(uri(`let clock=0,calls=0,fail=false,blocked=false,release; export function block(){blocked=true;}export function unblock(){blocked=false;release?.();}const Date={now:()=>clock};const rows=${JSON.stringify(rows)};async function cloudImportCatalog(c){calls++;await Promise.resolve();if(blocked)await new Promise(resolve=>release=resolve);if(fail)throw Error('CLOUD_DOWN');return rows;}async function cloudOriginals(){return new Map([['1-1','manuals']]);}export function control(v){fail=v;}export function stats(){return calls;}export function advance(ms){clock+=ms;}\n`+code));
const config={DATA_BACKEND:'supabase',SUPABASE_URL:'https://test.supabase.co',SUPABASE_SECRET_KEY:'test-secret'};
const [a,b]=await Promise.all([m.cloudCommonLibrary(config,'store'),m.cloudCommonLibrary(config,'store')]);assert.equal(m.stats(),1);assert.equal(a,b);assert.equal(a.states['1201-1'],'ready');assert.equal(a.states['9998-1'],undefined);assert.equal(a.states['9999-1'],undefined);assert.equal(a.states['private-document'],undefined);assert.equal(a.resources[uid].title,'Subiecte');assert.equal(a.originals.get('1-1'),'manuals');assert.equal(Object.keys(a.resources).length,1);
await m.cloudCommonLibrary(config,'store');assert.equal(m.stats(),1);
m.advance(60001);await m.cloudCommonLibrary(config,'store');assert.equal(m.stats(),2);
await m.cloudCommonLibrary({...config,SUPABASE_SECRET_KEY:'rotated'},'store');assert.equal(m.stats(),3);
m.control(true);await assert.rejects(m.cloudCommonLibrary(config,'outage'),/CLOUD_DOWN/);m.control(false);await m.cloudCommonLibrary(config,'outage');assert.equal(m.stats(),5);
const tasks=[];
const previous=await m.cloudCommonLibrary(config,'slow-refresh');
m.advance(60001);m.block();
const stale=await m.cloudCommonLibrary(config,'slow-refresh',p=>tasks.push(p));
assert.equal(stale,previous,'Expired cache must return immediately while refresh is slow');
const calls=m.stats();
assert.equal(await m.cloudCommonLibrary(config,'slow-refresh',p=>tasks.push(p)),previous);
assert.equal(m.stats(),calls,'Concurrent stale requests must not start duplicate refreshes');
assert.equal(tasks.length,1,'Background refresh is kept alive by the Worker');
m.unblock();await tasks[0];
m.advance(60001);m.control(true);
const failedRefresh=[];
assert.equal((await m.cloudCommonLibrary(config,'slow-refresh',p=>failedRefresh.push(p))).states['1-1'],'ready');
await failedRefresh[0];const failures=m.stats();
await m.cloudCommonLibrary(config,'slow-refresh');assert.equal(m.stats(),failures,'Failure must back off instead of flooding Supabase');
m.advance(300001);await assert.rejects(m.cloudCommonLibrary(config,'slow-refresh'),/CLOUD_DOWN/);
m.control(false);
console.log('PASS: shared cloud catalog, 1,200+ confirmed rows, no unindexed/private availability, resource validation, TTL/credential isolation and retry after failure.');

const library=await readFile('lib/library.ts','utf8');
const snapshot=library.slice(library.indexOf('export async function librarySnapshot')).replace("const {refreshDocument}=await import('./document-store');",'');
const api=await import(uri(`
const env={DATA_BACKEND:'supabase'};const cloudEnabled=()=>true;let cloudDown=false;export function outage(){cloudDown=true;}
async function commonLibrary(){if(cloudDown)throw Error('CLOUD_UNAVAILABLE');return {states:{'1-1':'ready'},resources:{},originals:new Map([['1-1','manuals']])};}
async function cloudOriginals(){throw Error('Originals should be reused')};
async function userDocuments(user){await Promise.resolve();return [{id:'document-'+user,title:user}];}
const refreshDocument=async row=>row;
const parallelMap=async(rows,fn)=>Promise.all(rows.map(fn));
const personalLibraryId=async user=>'library-'+user;
const listClasses=async()=>[],classDocumentGroups=async()=>({});
const manualLibrary=(states,dynamic,verified)=>[{id:'1-1',kind:'manual',status:verified?'ready':'unknown',url:'https://example.org/manual.pdf'}];
const documentLibrary=rows=>rows.map(row=>({...row,kind:'document',status:'ready'}));
const automaticSources=items=>({manualIds:items.filter(x=>x.kind==='manual').map(x=>x.id),documentIds:items.filter(x=>x.kind==='document').map(x=>x.id)});
`+snapshot));
const [ownerA,ownerB,guest]=await Promise.all([api.librarySnapshot('a',null),api.librarySnapshot('b',null),api.librarySnapshot(null,null)]);
assert.deepEqual(ownerA.selection.documentIds,['document-a']);assert.deepEqual(ownerA.warnings,[]);
assert.deepEqual(ownerB.selection.documentIds,['document-b']);
assert.deepEqual(guest.selection.documentIds,[]);
assert.equal(ownerA.items[0].url,'/api/library/materials/manuals/1-1');
assert.equal(guest.items[0].url,'https://example.org/manual.pdf');
console.log('PASS: simultaneous accounts keep documents separate, guest has no private documents, authenticated originals reuse the shared catalog.');

api.outage();const unavailable=await api.librarySnapshot('a',null);assert.equal(unavailable.items[0].status,'unknown');assert.ok(unavailable.warnings.length);assert.equal(unavailable.items[1].id,'document-a');console.log('PASS: authenticated cloud outage returns a truthful warning and own documents without retrying the original catalog.');
