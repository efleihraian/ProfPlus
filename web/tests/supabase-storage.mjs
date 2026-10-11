import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const map=JSON.parse(fs.readFileSync(new URL('../lib/supabase-operations.json',import.meta.url),'utf8'));
const input=fs.readFileSync(new URL('../lib/supabase-storage.ts',import.meta.url),'utf8').replace("import operations from './supabase-operations.json';",'const operations='+JSON.stringify(map)+';');
const output=ts.transpileModule(input,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const m=await import('data:text/javascript;base64,'+Buffer.from(output).toString('base64'));
const config={DATA_BACKEND:'supabase',SUPABASE_URL:'https://test.supabase.co',SUPABASE_SECRET_KEY:'server-test-only'};
const db=m.cloudDatabase(config);let requests=[];
globalThis.fetch=async(url,options)=>{
 requests.push({url,options});assert.equal(new Headers(options.headers).get('apikey'),config.SUPABASE_SECRET_KEY);
 const {operations}=JSON.parse(options.body);assert.ok(!options.body.includes('server-test-only'));assert.ok(operations.every(o=>!Object.hasOwn(o,'sql')));
 return Response.json(operations.map(o=>({success:true,results:o.args[1]==='owner-a'?[{id:o.args[0],user_id:'owner-a'}]:[],meta:{changes:o.args[1]==='owner-a'?1:0}})));
};
const sql='SELECT * FROM documents WHERE id = ? AND user_id = ?';
assert.equal((await db.prepare(sql).bind('document-a','owner-a').first()).user_id,'owner-a');
assert.equal(await db.prepare(sql).bind('document-a','owner-b').first(),null);
assert.throws(()=>db.prepare('SELECT * FROM documents; DROP TABLE documents'),/UNSUPPORTED/);
await assert.rejects(db.prepare(sql).bind('document-a').all(),/INVALID_BINDINGS/);
requests=[];await db.batch([db.prepare(sql).bind('document-a','owner-a'),db.prepare(sql).bind('document-b','owner-b')]);assert.equal(requests.length,1);
globalThis.fetch=async()=>new Response('',{status:503});await assert.rejects(db.prepare(sql).bind('document-a','owner-a').all(),/SUPABASE_DATABASE_503/);
const bucket=m.cloudBucket(config);await assert.rejects(bucket.get('../private-id'),/INVALID_DOCUMENT_ID/);
let uploaded;globalThis.fetch=async(url,options)=>{if(options.method==='POST'){uploaded=new Uint8Array(options.body);return Response.json({});}return new Response(uploaded);};
await bucket.put('11111111-1111-4111-8111-111111111111',new Uint8Array([1,2,3]));
globalThis.fetch=async(url,options)=>options.method==='POST'?Response.json({}):new Response(new Uint8Array([1,2,4]));
await assert.rejects(bucket.put('11111111-1111-4111-8111-111111111111',new Uint8Array([1,2,3])),/HASH_MISMATCH/);
const pages=[];
globalThis.fetch=async(url,options)=>{
 const parsed=new URL(url);pages.push(parsed);
 assert.equal(parsed.searchParams.get('family'),'in.(manuals,competitions)');
 assert.equal(parsed.searchParams.get('order'),'family.asc,uid.asc');
 assert.equal(parsed.searchParams.get('limit'),'1000');
 assert.equal(new Headers(options.headers).get('apikey'),config.SUPABASE_SECRET_KEY);
 if(parsed.pathname.endsWith('library_import_documents')){
  assert.equal(parsed.searchParams.get('select'),'family,uid,status:state->>status,metadata:state->metadata,file_id:state->>file_id,attached:state->attached');
  return Response.json(Array.from({length:parsed.searchParams.get('offset')==='0'?1000:1},(_,i)=>({family:'manuals',uid:'1-'+(Number(parsed.searchParams.get('offset'))+i),status:'indexed',metadata:'{}',file_id:'file-test',attached:1})));
 }
 assert.equal(parsed.searchParams.get('kind'),'eq.original');
 return Response.json(Array.from({length:parsed.searchParams.get('offset')==='0'?1000:1},(_,i)=>({family:'manuals',uid:'1-'+(Number(parsed.searchParams.get('offset'))+i)})));
};
assert.equal((await m.cloudImportCatalog(config)).length,1001);
assert.equal((await m.cloudOriginals(config)).size,1001);
assert.deepEqual(pages.map(p=>p.searchParams.get('offset')),['0','1000','0','1000']);
globalThis.fetch=async()=>new Response('',{status:503});
await assert.rejects(m.cloudImportCatalog(config),/CLOUD_LIBRARY_UNAVAILABLE/);
console.log('Supabase bridge: fixed operations, owner bindings, atomic batch, no fallback, private keys and verified object upload passed.');

let active=0,peak=0;const offsets=[];const deadline=AbortSignal.timeout(1000);
globalThis.fetch=async(url,options)=>{
 assert.equal(options.signal,deadline,'All pages share one overall deadline');
 const offset=Number(new URL(url).searchParams.get('offset'));offsets.push(offset);
 active++;peak=Math.max(peak,active);await new Promise(resolve=>setTimeout(resolve,1));active--;
 return Response.json(Array.from({length:offset<2000?1000:1},(_,i)=>({family:'manuals',uid:'1-'+(offset+i)})),{headers:{'content-range':offset===0?'0-999/2001':'*/*'}});
};
assert.equal((await m.cloudImportCatalog(config,deadline)).length,2001);
assert.deepEqual(offsets,[0,1000,2000]);assert.equal(peak,2);
console.log('PASS: count-based pagination is complete and parallelism is bounded; every page shares the same deadline.');
