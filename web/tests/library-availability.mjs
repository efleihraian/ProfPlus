import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const uri=s=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const source=await readFile('lib/library.ts','utf8');
const helper=uri(await readFile('lib/common-resource.ts','utf8'));
const core=source.slice(source.indexOf('type CommonSnapshot'),source.indexOf('export async function userDocuments'));
const snapshot=source.slice(source.indexOf('export async function librarySnapshot'));
const setup=`import {commonResource} from ${JSON.stringify(helper)};
let clock=0,calls=0,mode='ok';const Date={now:()=>clock};
const AbortSignal={timeout(ms){const deadline=clock+ms;return {get aborted(){return clock>=deadline}}}};
const catalog={'1312-1':{title:'Booklet',class:'Clasa I',subject:'Română',publisher:'Booklet',url:'https://example.org/booklet.pdf'},'1313-1':{title:'Corint',class:'Clasa I',subject:'Română',publisher:'Corint',url:'https://example.org/corint.pdf'}};
const extra={};const env={};const cloudEnabled=()=>false;
const automaticSources=items=>({manualIds:items.filter(x=>x.status==='ready').map(x=>x.id),documentIds:[]});
const userDocuments=()=>{throw Error('Private documents accessed')};const documentLibrary=()=>[];
async function openai(key,path,{signal}){
 calls++;await Promise.resolve();clock+=20000;if(signal.aborted)throw Error('INDEX_DEADLINE');
 if(mode==='fail')throw Error('PROVIDER_503');
 if(mode==='bad-cursor')return {json:async()=>({data:[],has_more:true,last_id:'repeat'})};
 return {json:async()=>path.includes('after=first')?{data:[{attributes:{uid:'1313-1'},status:'completed'}],has_more:false}:{data:[{attributes:{uid:'1312-1'},status:'completed'}],has_more:true,last_id:'first'}};
}
export function control(value){mode=value;}export function stats(){return {calls,clock};}export function advance(ms){clock+=ms;}
`;
const m=await import(uri(setup+core+snapshot));
const [a,b]=await Promise.all([m.commonLibrary('key','full'),m.commonLibrary('key','full')]);
assert.equal(m.stats().calls,2);assert.equal(m.stats().clock,40000);assert.deepEqual(a,b);assert.equal(a.states['1312-1'],'ready');assert.equal(a.states['1313-1'],'ready');
await m.manualStates('key','full');assert.equal(m.stats().calls,2,'Complete snapshot must be reused');
m.advance(300001);await m.manualStates('key','full');assert.equal(m.stats().calls,4,'Expired snapshot must refresh');
await m.manualStates('other-key','full');assert.equal(m.stats().calls,6,'Credential change must not reuse old snapshot');
m.control('fail');const unavailable=await m.librarySnapshot(null,null,'key','outage');
assert.ok(unavailable.warnings.length);assert.ok(unavailable.items.every(x=>x.status==='unknown'));assert.deepEqual(unavailable.selection.manualIds,[]);
m.control('ok');const retried=await m.librarySnapshot(null,null,'key','outage');assert.ok(retried.items.every(x=>x.status==='ready'));assert.deepEqual(retried.selection.manualIds,['1312-1','1313-1']);
m.control('bad-cursor');await assert.rejects(m.commonLibrary('key','cursor'),/INVALID_LIBRARY_CURSOR/);
console.log('PASS: complete pagination beyond 30 seconds, shared/cache refresh and credentials, truthful outage/retry, no private metadata, repeated-cursor guard.');
