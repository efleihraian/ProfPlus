import fs from 'node:fs';import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';
if(!process.env.PGLITE_MODULE_PATH)throw new Error('Set PGLITE_MODULE_PATH to a temporary @electric-sql/pglite installation; no production dependency needed.');
const {PGlite}=await import(pathToFileURL(process.env.PGLITE_MODULE_PATH).href);const db=new PGlite();
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE SCHEMA auth; CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;`);
const root=new URL('../',import.meta.url);const migration=fs.readdirSync(new URL('supabase/migrations/',root)).find(s=>s.endsWith('_profplus_cloud_library.sql'));
await db.exec(fs.readFileSync(new URL('supabase/migrations/'+migration,root),'utf8'));
const operations=JSON.parse(fs.readFileSync(new URL('scripts/cloud/app-operations.json',root),'utf8'));const query=sql=>operations.find(o=>o.sql===sql);
const call=async items=>(await db.query('SELECT public.profplus_app_ops($1::jsonb) AS result',[JSON.stringify(items)])).rows[0].result;
for(const item of operations){
 await db.exec('RESET ROLE; TRUNCATE documents,document_labels,conversations,projects,account_deletions,guest_chat_budget; SET ROLE service_role;');
 const args=Array(item.count).fill('fixture');for(const match of (item.postgres||'').matchAll(/\$1->>(\d+)\)::bigint/g))args[Number(match[1])]=1;
 // Every fixed statement must plan and execute, even when no matching rows exist.
 await call([{op:item.op,args}]);
}
await db.exec('RESET ROLE; TRUNCATE documents,document_labels,conversations,projects,account_deletions,guest_chat_budget;');
const userA='supabase:11111111-1111-4111-8111-111111111111',userB='supabase:22222222-2222-4222-8222-222222222222';
await db.query('INSERT INTO documents(id,user_id,chat_id,name,mime,size,status,created_at) VALUES ($1,$2,$3,$4,$5,1,$6,1)',['document-a',userA,'chat-a','private-a','text/plain','ready']);
await db.query('INSERT INTO documents(id,user_id,chat_id,name,mime,size,status,created_at) VALUES ($1,$2,$3,$4,$5,1,$6,1)',['document-b',userB,'chat-b','private-b','text/plain','ready']);
await db.exec('SET ROLE service_role');const owned=query('SELECT * FROM documents WHERE id = ? AND user_id = ?');
assert.equal((await call([{op:owned.op,args:['document-a',userA]}]))[0].results.length,1);
assert.equal((await call([{op:owned.op,args:['document-a',userB]}]))[0].results.length,0);
assert.equal((await call([{op:owned.op,args:["document-a'; DELETE FROM documents; --",userA]}]))[0].results.length,0);
await assert.rejects(call([{op:'SELECT * FROM documents',args:[]}]),/UNKNOWN_OPERATION/);
const project=query('INSERT INTO projects(id,user_id,name,created_at) SELECT ?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM account_deletions WHERE user_id=?)');
await assert.rejects(call([{op:project.op,args:['project-rollback',userA,'test',1,userA]},{op:'unknown',args:[]}]),/UNKNOWN_OPERATION/);
assert.equal((await db.query("SELECT count(*)::int AS n FROM projects WHERE id='project-rollback'")).rows[0].n,0);
const reservation=operations.find(o=>o.sql.startsWith('INSERT INTO documents'));const reserve=id=>({op:reservation.op,args:[id,userA,'chat-a','test','text/plain',1,Date.now(),userA,'chat-a',userA,userA]});
for(let i=0;i<9;i++)assert.equal((await call([reserve('quota-'+i)]))[0].meta.changes,1);
assert.equal((await call([reserve('quota-over')]))[0].meta.changes,0);
await db.exec('RESET ROLE; GRANT SELECT ON documents TO authenticated;');
await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)",[userA.slice(9)]);await db.exec('SET ROLE authenticated');
const rows=(await db.query('SELECT user_id FROM documents')).rows;assert.ok(rows.length);assert.ok(rows.every(r=>r.user_id===userA));
await assert.rejects(call([{op:owned.op,args:['document-a',userA]}]),/permission denied/);
await db.exec('RESET ROLE; SET ROLE anon');await assert.rejects(db.query('SELECT * FROM documents'),/permission denied/);await assert.rejects(call([{op:owned.op,args:['document-a',userA]}]),/permission denied/);
await db.close();console.log('Postgres WASM: all 43 operations, numeric bindings, owner isolation/RLS, anon denial, SQL injection, atomic rollback and upload quota passed. Live Supabase verification still required.');
