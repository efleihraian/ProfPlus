// P-087: anunțuri de meditații — validare, proprietar, contact doar pentru conectați, limite, raportări, ștergerea contului.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const uri=s=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const strip=s=>s.replace(/^import [\s\S]*?;\s*$/gm,'');
const tutUri=uri(await readFile('lib/tutoring.ts','utf8')),t=await import(tutUri);
const good={displayName:'Prof. Ana',title:'Matematică pentru Evaluarea Națională',subject:'Matematică',levels:['gimnaziu','evaluare'],formats:['online','sediu'],city:'Cluj-Napoca',price:'80',description:'Pregătire pe teme din programa clasei a VIII-a, cu teste săptămânale și feedback.',contactEmail:'Ana@Example.RO',contactPhone:'0722 123 456'};
let r=t.validateTutoring(good);assert.ok(r.ok);assert.equal(r.input.price,80);assert.equal(r.input.contactEmail,'ana@example.ro');assert.equal(r.input.contactPhone,'0722123456');
const bad=(patch,field)=>{const x=t.validateTutoring({...good,...patch});assert.ok(!x.ok,JSON.stringify(patch));assert.equal(x.error.field,field);};
bad({description:'Detalii pe www.site-meu.ro, cu exerciții și teste pentru elevi.'},'description');bad({description:'Scrie-mi la ana@gmail.com pentru detalii despre program și teste.'},'description');
bad({city:'',formats:['domiciliu']},'city');bad({price:1500},'price');bad({price:12.5},'price');bad({levels:['facultate']},'levels');bad({formats:[]},'formats');
bad({contactEmail:'',contactPhone:''},'contactEmail');bad({contactPhone:'12'},'contactPhone');bad({contactEmail:'nu-e-mail'},'contactEmail');bad({title:'Mate'},'title');
assert.ok(t.validateTutoring({...good,formats:['online'],city:'',price:''}).ok,'online ads need no city; price on request');
console.log('PASS: validation — no links or contacts in text, city for face-to-face, price range, levels/formats, contact required and normalized.');

// PostgREST simulat: înregistrează cererile și aplică filtrele folosite.
const S={ads:[],reports:[],calls:[],tableMissing:false,fail:false};globalThis.__S=S;
const match=(row,params)=>{for(const [k,v] of params){if(['select','order','limit','offset','or'].includes(k))continue;
 if(v.startsWith('eq.')&&String(row[k])!==v.slice(3))return false;if(v.startsWith('gt.')&&!(row[k]>v.slice(3)))return false;
 if(v.startsWith('in.(')&&!v.slice(4,-1).split(',').includes(row[k]))return false;if(v.startsWith('cs.{')&&!row[k].includes(v.slice(4,-1)))return false;}return true;};
globalThis.fetch=async(url,init={})=>{const u=new URL(url),table=u.pathname.split('/').pop(),method=init.method||'GET',params=[...u.searchParams];S.calls.push({table,method,params:Object.fromEntries(params),body:init.body?JSON.parse(init.body):null});
 if(S.tableMissing)return new Response('{"code":"PGRST205"}',{status:404});if(S.fail)return new Response('{}',{status:500});
 const rows=table==='profplus_tutoring_ads'?S.ads:S.reports;
 if(method==='GET'){const sel=u.searchParams.get('select').split(',');return Response.json(rows.filter(r=>match(r,params)).map(r=>Object.fromEntries(sel.map(k=>[k,r[k]]))));}
 if(method==='POST'){const b=JSON.parse(init.body);if(table==='profplus_tutoring_reports'&&S.reports.some(x=>x.ad_id===b.ad_id&&x.reporter===b.reporter))return new Response('{}',{status:409});rows.push(b);return new Response('',{status:201});}
 if(method==='PATCH'){for(const r of rows.filter(r=>match(r,params)))Object.assign(r,JSON.parse(init.body));return new Response(null,{status:204});}
 if(method==='DELETE'){const keep=rows.filter(r=>!match(r,params));rows.length=0;rows.push(...keep);return new Response(null,{status:204});}};
const env=`const env={DATA_BACKEND:'supabase',SUPABASE_URL:'https://x.supabase.co',SUPABASE_SECRET_KEY:'k'};`;
const storeUri=uri(`import {AD_DAYS,AUTO_HIDE_REPORTS,MAX_ACTIVE_ADS} from ${JSON.stringify(tutUri)};`+env+strip(await readFile('lib/tutoring-store.ts','utf8')));
const store=await import(storeUri);
const input=r.input,NOW=new Date('2026-10-15T12:00:00Z');
const id1=await store.createAd('supabase:u1',input,NOW);
const row=S.ads[0];assert.equal(row.user_id,'supabase:u1');assert.equal(row.status,'published');assert.equal(row.consent_at,NOW.toISOString());assert.equal(Date.parse(row.expires_at)-NOW.getTime(),60*86400000);
await store.createAd('supabase:u1',input,NOW);await store.createAd('supabase:u1',input,NOW);
await assert.rejects(store.createAd('supabase:u1',input,NOW),e=>e.status===409,'at most three active ads');
const pub=await store.listPublicAds({},NOW);assert.equal(pub.ads.length,3);
const listCall=S.calls.filter(c=>c.method==='GET'&&c.table==='profplus_tutoring_ads').at(-1);
assert.ok(!/contact_/.test(listCall.params.select),'public list never selects contact data');assert.equal(listCall.params.status,'eq.published');assert.match(listCall.params.expires_at,/^gt\./);
await assert.rejects(store.changeAd('supabase:u2',id1,{action:'pause'},NOW),e=>e.status===404,'other accounts cannot change the ad');
await assert.rejects(store.deleteAd('supabase:u2',id1),e=>e.status===404,'other accounts cannot delete the ad');
await store.changeAd('supabase:u1',id1,{action:'pause'},NOW);assert.equal(S.ads.find(a=>a.id===id1).status,'paused');
assert.equal((await store.listPublicAds({},NOW)).ads.length,2,'paused ads are hidden');
await assert.rejects(store.adContact(id1,NOW),e=>e.status===404,'no contact for paused ads');
await store.changeAd('supabase:u1',id1,{action:'publish'},NOW);assert.deepEqual(await store.adContact(id1,NOW),{email:'ana@example.ro',phone:'0722123456'});
const later=new Date(NOW.getTime()+61*86400000);assert.equal((await store.listPublicAds({},later)).ads.length,0,'expired ads disappear');
await assert.rejects(store.reportAd('supabase:u1',id1,'x',NOW),e=>e.status===400,'no self-report');
await store.reportAd('supabase:r1',id1,'spam',NOW);await assert.rejects(store.reportAd('supabase:r1',id1,'spam',NOW),e=>e.status===409,'one report per account');
await store.reportAd('supabase:r2',id1,'',NOW);const third=await store.reportAd('supabase:r3',id1,'date false',NOW);
assert.equal(third.hidden,true);assert.equal(S.ads.find(a=>a.id===id1).status,'hidden','three reports hide the ad');
await assert.rejects(store.changeAd('supabase:u1',id1,{action:'publish'},NOW),e=>e.status===409,'owner cannot republish a hidden ad');
const queue=await store.moderationQueue();assert.ok(queue.some(a=>a.id===id1&&a.reports.includes('spam')));
await store.moderateAd(id1,'restore');assert.equal(S.ads.find(a=>a.id===id1).status,'published');assert.ok(!S.reports.some(x=>x.ad_id===id1),'restore clears reports');
await store.reportAd('supabase:u1',S.ads[1].id,'test',NOW).catch(()=>{});
await store.eraseTutoring('supabase:u1');assert.ok(!S.ads.some(a=>a.user_id==='supabase:u1'));assert.ok(!S.reports.some(x=>x.reporter==='supabase:u1'));
S.tableMissing=true;await store.eraseTutoring('supabase:u9');await assert.rejects(store.listPublicAds({},NOW),e=>e.status===503&&/în curând/.test(e.message));S.tableMissing=false;
S.fail=true;await assert.rejects(store.eraseTutoring('supabase:u9'),'real outages block account deletion');S.fail=false;
console.log('PASS: store — server-owned rows, 3 active ads, no contact in public list, owner-only changes, contact only for active ads, expiry, reports (one per account, auto-hide, moderation), account erasure.');

// Rute: autentificare, profil didactic, acord, Origin.
globalThis.__user=null;
const routeStubs=`import * as T from ${JSON.stringify(tutUri)};const {TUTORING_FORMATS,TUTORING_LEVELS,validateTutoring}=T;import * as St from ${JSON.stringify(storeUri)};const {createAd,listPublicAds,adContact,changeAd,deleteAd,reportAd,TutoringError}=St;
const accountJson=(b,s=200)=>Response.json(b,{status:s});const accountIdentity=async()=>globalThis.__user;const sameOrigin=r=>r.headers.get('origin')==='http://localhost';
async function readJson(request){return JSON.parse(await request.text());}function tutoringFailure(e){return e instanceof TutoringError?accountJson({error:e.message},e.status):accountJson({error:'x'},503);}`;
const list=await import(uri(routeStubs+strip(await readFile('app/api/tutoring/route.ts','utf8'))));
const contact=await import(uri(routeStubs+strip(await readFile('app/api/tutoring/[id]/contact/route.ts','utf8'))));
const post=(body,origin='http://localhost')=>new Request('http://localhost/api/tutoring',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
assert.equal((await list.POST(post({ad:good,consent:true}))).status,401);
globalThis.__user={id:'supabase:u5',provider:'supabase'};assert.equal((await list.POST(post({ad:good,consent:true}))).status,403,'teaching profile required');
globalThis.__user={id:'supabase:u5',provider:'supabase',teaching:{subject:'Matematică'}};
assert.equal((await list.POST(post({ad:good}))).status,400,'consent required');
assert.equal((await list.POST(post({ad:good,consent:true},'https://evil.example'))).status,403,'origin checked');
let res=await list.POST(post({ad:{...good,description:'scurt'},consent:true}));assert.equal(res.status,400);assert.equal((await res.json()).field,'description');
res=await list.POST(post({ad:good,consent:true}));assert.equal(res.status,201);const newId=(await res.json()).id;
assert.equal((await list.GET(new Request('http://localhost/api/tutoring?level=facultate'))).status,400);
globalThis.__user=null;assert.equal((await contact.GET(new Request('http://localhost/x'),{params:Promise.resolve({id:newId})})).status,401,'guests do not see contact data');
const guestList=await (await list.GET(new Request('http://localhost/api/tutoring'))).json();assert.ok(guestList.ads.length>=1&&guestList.ads.every(a=>!('contactEmail' in a)&&!('contactPhone' in a)));
console.log('PASS: routes — sign-in, teaching profile, explicit consent and Origin required; field errors; guests get ads without contacts.');
