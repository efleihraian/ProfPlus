import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const uri=s=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const {validNews,validNewsSettings,safeNewsUrl}=await import(uri(await readFile('lib/news.ts','utf8')));
const article={id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',title:'Synthetic news',summary:'Fixture',body:'<script>text only</script>',category:'QA',image_url:'',source_url:'https://example.org/news',slot:0,status:'draft',published_at:null,revision:0};
assert.ok(validNews(article));assert.ok(validNews({...article,status:'published',published_at:new Date().toISOString()}));
for(const patch of [{slot:5},{title:''},{title:'x'.repeat(201)},{body:'x'.repeat(20001)},{source_url:'javascript:alert(1)'},{image_url:'http://example.org/a'},{source_url:'https://u:p@example.org'},{revision:-1},{status:'published'},{admin:true}])assert.equal(validNews({...article,...patch}),false);
assert.ok(validNewsSettings({title:'Știri',intro:'Intro'}));assert.equal(validNewsSettings({title:'Știri',intro:'Intro',admin:true}),false);assert.equal(safeNewsUrl('data:text/html,a'),false);
let calls=[],member=false;const uid='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
globalThis.__newsUser={id:'supabase:'+uid,provider:'supabase',emailVerified:true};
globalThis.__newsFetch=async(url,init)=>{calls.push({url,init});return Response.json(member?[{user_id:uid}]:[]);};
let store=await readFile('lib/admin-store.ts','utf8');store=store.replace(/^import .*;\s*$/gm,'');store="const env={SUPABASE_URL:'https://fixture.supabase.co',SUPABASE_SECRET_KEY:'synthetic-only'};const accountIdentity=async()=>globalThis.__newsUser;const fetch=globalThis.__newsFetch;\n"+store;
const {isAdministrator}=await import(uri(store));
assert.equal(await isAdministrator(null),false);assert.equal(await isAdministrator({...globalThis.__newsUser,provider:'sites'}),false);assert.equal(await isAdministrator({...globalThis.__newsUser,deleting:true}),false);assert.equal(await isAdministrator({...globalThis.__newsUser,emailVerified:false}),false);assert.equal(calls.length,0);
assert.equal(await isAdministrator({...globalThis.__newsUser,admin:true,user_metadata:{role:'admin'}}),false);member=true;assert.equal(await isAdministrator(globalThis.__newsUser),true);assert.ok(calls.every(c=>c.url.includes('user_id=eq.'+uid)&&!c.url.includes('email')));
let allowed=false,payload=[];
globalThis.__newsAllowed=()=>allowed;globalThis.__newsPayload=payload;
let route=await readFile('app/api/admin/news/route.ts','utf8');route=route.replace(/^import .*;\s*$/gm,'');route="import {validNews,validNewsSettings} from "+JSON.stringify(uri(await readFile('lib/news.ts','utf8')))+";const accountJson=(b,status=200)=>Response.json(b,{status});const sameOrigin=r=>r.headers.get('origin')===new URL(r.url).origin;const requireAdministrator=async()=>globalThis.__newsAllowed()?{id:'supabase:"+uid+"'}:null;const adminRequest=async(path,init)=>{globalThis.__newsPayload.push(JSON.parse(init.body));return {revision:1};};\n"+route;
const {POST}=await import(uri(route));const request=(body,origin='http://localhost')=>new Request('http://localhost/api/admin/news',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
assert.equal((await POST(request({article}))).status,403);allowed=true;
assert.equal((await POST(request({article},'http://evil.test'))).status,403);
assert.equal((await POST(request({article:{...article,slot:5}}))).status,400);
assert.equal((await POST(request({article,actor:'other-user'}))).status,400);
assert.equal((await POST(request({article,settings:{title:'a',intro:''}}))).status,400);
assert.equal((await POST(request({article:{...article,body:'x'.repeat(30000)}}))).status,413);
assert.equal(payload.length,0);
assert.equal((await POST(request({article}))).status,200);assert.equal(payload[0].actor,uid);assert.equal(payload[0].article.body,article.body);
assert.equal((await POST(request({settings:{title:'Știri',intro:'Intro'}}))).status,200);
// Public reads impose published + current-time filters; no drafts or internal audit fields.
const source=await readFile('lib/admin-store.ts','utf8');assert.match(source,/query.set\('status','eq.published'\)/);assert.match(source,/query.set\('published_at','lte.'/);assert.ok(!(await readFile('app/news/page.tsx','utf8')).includes('dangerouslySetInnerHTML'));
console.log('PASS: stored admin membership, metadata impersonation denial, CSRF/limits/input validation, server-bound actor, public publication filters and plain-text rendering.');

const news=await import(uri(await readFile('lib/news.ts','utf8')));assert.equal(news.nextNewsPosition([]),0);assert.equal(news.nextNewsPosition([0,1,2,3].map(slot=>({...article,slot,status:'published'}))),4);assert.equal(news.nextNewsPosition([{...article,status:'draft',slot:0}]),0);assert.equal(news.newsReadingMinutes('word '.repeat(401)),3);assert.deepEqual(news.newsParagraphs('First\n\nSecond'),['First','Second']);assert.ok(validNews({...article,slot:4,status:'published',published_at:new Date().toISOString()}));assert.equal(validNews({...article,status:'published',summary:'',published_at:new Date().toISOString()}),false);assert.equal(validNews({...article,status:'published',body:'',source_url:'',published_at:new Date().toISOString()}),false);

let queries=[];globalThis.__readNewsFetch=async(url)=>{queries.push(new URL(url));return Response.json(url.includes('profplus_news_settings')?[{title:'Știri',intro:'Intro'}]:Array.from({length:21},(_,i)=>({...article,id:String(i)})));};
let readSource=await readFile('lib/admin-store.ts','utf8');readSource=readSource.replace(/^import .*;\s*$/gm,'');readSource="const env={SUPABASE_URL:'https://fixture.supabase.co',SUPABASE_SECRET_KEY:'synthetic-only'};const accountIdentity=async()=>null;const fetch=globalThis.__readNewsFetch;\n"+readSource;const reader=await import(uri(readSource));
let pageData=await reader.readNews(false,undefined,{page:2,search:'Test,*()'});assert.equal(pageData.articles.length,20);assert.equal(pageData.hasMore,true);let params=queries.find(q=>q.pathname.endsWith('/profplus_news')).searchParams;assert.equal(params.get('offset'),'20');assert.equal(params.get('status'),'eq.published');assert.match(params.get('published_at'),/^lte\./);assert.equal(params.get('title'),'ilike.*Test*');
queries=[];await reader.readNews(false,undefined,{home:true});params=queries.find(q=>q.pathname.endsWith('/profplus_news')).searchParams;assert.equal(params.get('slot'),'lt.4');assert.equal(params.get('limit'),'4');
console.log('PASS: complete publication fields, homepage positions, retained list-only news, reading helpers, title search and public pagination.');

queries=[];await reader.readNews(true,undefined,{page:2,paged:true,status:'draft'});params=queries.find(q=>q.pathname.endsWith('/profplus_news')).searchParams;assert.equal(params.get('status'),'eq.draft');assert.equal(params.get('offset'),'20');assert.equal(params.get('limit'),'21');assert.equal(params.get('published_at'),null);
const adminRoute=await import(uri(route.replace("const adminRequest=", "const readNews=async(admin,id,options)=>({articles:[],hasMore:false,options});const adminRequest=")));allowed=false;assert.equal((await adminRoute.GET(new Request('http://localhost/api/admin/news'))).status,403);allowed=true;assert.equal((await adminRoute.GET(new Request('http://localhost/api/admin/news?status=invalid'))).status,400);const adminRead=await adminRoute.GET(new Request('http://localhost/api/admin/news?status=draft&page=2&q=test'));assert.equal(adminRead.status,200);assert.deepEqual((await adminRead.json()).options,{page:2,search:'test',status:'draft',paged:true});console.log('PASS: protected admin search/status pagination; drafts remain discoverable beyond the dashboard snapshot.');
