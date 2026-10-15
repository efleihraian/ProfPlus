// P-082: flux automat de știri — parsare RSS, filtrare educație, extras scurt, id determinist, recomandări pe profil.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const uri=s=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const f=await import(uri(await readFile('lib/news-feed.ts','utf8')));
const NOW=Date.parse('2026-10-15T12:00:00Z');
const rss=`<?xml version="1.0"?><rss><channel><title>T</title>
<item><title><![CDATA[Olimpiada de Matematică 2027: calendarul etapelor pentru clasele a V-a – a VIII-a]]></title><link>https://example.ro/olimpiada?utm_source=rss&amp;id=1</link><pubDate>Wed, 14 Oct 2026 10:00:00 +0000</pubDate><description><![CDATA[<div id="featured-image-url">https://cdn.example.ro/a.jpg</div><p>Ministerul Educației a publicat calendarul &#8222;Olimpiadei&#8221; de matematică pentru elevii de gimnaziu.</p>]]></description></item>
<item><title>Examenul de medic specialist este contestat de rezidenți</title><link>https://example.ro/medic</link><pubDate>Wed, 14 Oct 2026 09:00:00 +0000</pubDate><description>Rezidenții cer reluarea examenului.</description></item>
<item><title>Fără link valid</title><link>http://example.ro/x</link><pubDate>Wed, 14 Oct 2026 09:00:00 +0000</pubDate></item>
<item><title>Fără dată</title><link>https://example.ro/y</link></item>
</channel></rss>`;
const items=f.parseFeed(rss);
assert.equal(items.length,2);assert.equal(items[0].link,'https://example.ro/olimpiada?id=1','tracking parameters removed');
assert.match(items[0].description,/^Ministerul Educației a publicat calendarul „Olimpiadei” de matematică/);assert.ok(!items[0].description.includes('cdn.example'),'image URLs dropped');
assert.equal(f.isEducationNews(items[0]),true);assert.equal(f.isEducationNews(items[1]),false,'medical residency news excluded');assert.equal(f.isEducationNews(items[1],true),true,'official source accepted');
const long='Profesorii '+'primesc informații noi despre program '.repeat(20);
const ex=f.excerpt(long,'Titlu');assert.ok(ex.length<=280&&ex.endsWith('…'));assert.equal(f.excerpt('Titlu identic','Titlu identic'),'Titlu identic');
assert.equal(f.newsCategory('Calendarul olimpiadei'),'Examene');assert.equal(f.newsCategory('Ordin privind salariile'),'Legislație');assert.equal(f.newsCategory('Manuale noi digitale'),'Resurse');
const a=await f.feedArticle(items[0]),b=await f.feedArticle({...items[0],link:'https://example.ro/olimpiada?id=1&utm_medium=x'});
assert.equal(a.id,b.id,'same article from tracking variants is not duplicated');assert.ok(f.isAutoNews(a.id));assert.ok(!f.isAutoNews(crypto.randomUUID()));
assert.deepEqual([a.body,a.image_url,a.slot,a.status],['',  '',4,'published']);assert.ok(a.summary.length<=280);
const news=await import(uri(await readFile('lib/news.ts','utf8')));assert.ok(news.validNews(a),'automatic articles satisfy the editorial validator');
console.log('PASS: RSS parsing (CDATA/entities/tracking), education filter, short excerpt only, deterministic automatic ids, categories.');

const math8={role:'teacher',subject:'Matematică',stages:['middle']};
const art=(title,days,summary='',id=crypto.randomUUID())=>({id,title,summary,body:'',category:'',image_url:'',source_url:'https://example.ro/'+id,slot:4,status:'published',published_at:new Date(NOW-days*86400000).toISOString(),revision:1});
const olymp=art('Olimpiada de Matematică: calendarul pentru clasa a VIII-a',1),salary=art('Majorare salarială pentru profesori din ianuarie',2),bac=art('Bacalaureat 2027: calendarul probelor la liceu',1),misc=art('Un festival de lectură în Cluj',0),romania=art('România are cele mai multe școli renovate',0);
assert.ok(f.scoreNews(olymp,math8,NOW).score>f.scoreNews(bac,math8,NOW).score,'math middle-school teacher sees the olympiad before high-school news');
assert.deepEqual(f.scoreNews(olymp,math8,NOW).reasons,['Matematică','gimnaziu']);
assert.equal(f.scoreNews(salary,null,NOW).important,true);
assert.deepEqual(f.scoreNews(romania,{role:'teacher',subject:'Limba și literatura română',stages:['high']},NOW).reasons,[],'Romanian subject does not match the word România');
let home=f.homeSelection([],[misc,bac,salary,olymp],math8,NOW);
assert.equal(home.length,4);assert.equal(home[0].id,olymp.id);assert.equal(home[0].slot,0);assert.match(home[0].reason,/^Pentru tine: Matematică · gimnaziu/);
assert.deepEqual(home.map(n=>n.slot),[0,1,2,3]);assert.ok(home.some(n=>n.id===salary.id&&n.reason==='Important'),'major news stays visible');
const guest=f.homeSelection([],[misc,bac,salary,olymp],null,NOW);assert.equal(guest[0].id,salary.id,'without a profile the most important news leads');
const pin={...art('Anunț fixat de editor',3),slot:1},stalePin={...art('Anunț vechi fixat',30),slot:0};
home=f.homeSelection([pin,stalePin],[misc,bac,salary,olymp],math8,NOW);
assert.equal(home.find(n=>n.slot===1).id,pin.id,'fresh editor pins keep their position');assert.ok(!home.some(n=>n.id===stalePin.id),'stale pins are replaced');assert.equal(home.length,4);
assert.ok(!f.homeSelection([],[art('Veche',40)],math8,NOW).length,'old news are not recommended');
console.log('PASS: recommendations — profile matches (subject, stage, olympiad) lead, important news for everyone, fresh editor pins kept, layout main + 3 secondary.');

// Colectare cu surse simulate: vechi/viitor filtrate, dubluri eliminate, sursă căzută raportată.
const ingestSrc=(await readFile('lib/news-ingest.ts','utf8')).replace(/^import .*;\s*$/gm,'');
const feedUri=uri(await readFile('lib/news-feed.ts','utf8')),newsUri=uri(await readFile('lib/news.ts','utf8'));
const ing=await import(uri(`import {NEWS_SOURCES,feedArticle,isEducationNews,parseFeed} from ${JSON.stringify(feedUri)};import {validNews} from ${JSON.stringify(newsUri)};const adminWrite=async()=>{};`+ingestSrc));
const old=rss.replaceAll('Wed, 14 Oct 2026','Mon, 01 Sep 2026');
const result=await ing.collectNews(NOW,async source=>{if(source.id==='digi24')throw Error('down');return source.id==='edu'?old:rss;});
assert.equal(result.articles.length,1,'one education article, deduplicated across sources; old and non-education items skipped');
assert.deepEqual(result.sources.map(s=>[s.id,s.ok]),[['edu',true],['edupedu',true],['digi24',false],['educatieprivata',true]]);
console.log('PASS: collection skips old/irrelevant items, deduplicates across sources and reports failing sources without stopping.');
