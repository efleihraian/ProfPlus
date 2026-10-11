import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const uri=s=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const catalog=await readFile('lib/manual-catalog.json','utf8');
const teaching=uri((await readFile('lib/teaching-profile.ts','utf8')).replace("import catalog from './manual-catalog.json';",'const catalog='+catalog+';'));
const modelsUri=uri((await readFile('lib/document-models.ts','utf8')).replaceAll("'./teaching-profile'",JSON.stringify(teaching)));
const models=await import(modelsUri);
const metadata=await import(uri((await readFile('lib/resource-metadata.ts','utf8')).replaceAll("'./teaching-profile'",JSON.stringify(teaching)).replaceAll("'./document-models'",JSON.stringify(modelsUri))));
const profile={role:'teacher',subject:'Matematică',stages:['middle']};
const label={category:'document',subject:'Matematică',stages:['middle'],modelTypes:['test','rubric']};
assert.deepEqual(metadata.resourceMetadata(label).modelTypes,['test','rubric']);
for(const modelTypes of [['invalid'],['test','test'],['test',{}],'test',null])assert.equal(metadata.resourceMetadata({...label,modelTypes}),null);
assert.equal(metadata.resourceMetadata({...label,subject:'invalid'}),null);
assert.equal(metadata.resourceMetadata({...label,modelTypes:[],scope:'shared'}).scope,undefined);
assert.deepEqual(models.requestedModelTypes('Creează un test cu barem și planificare anuală'),['test','rubric','planning']);
assert.deepEqual(models.requestedModelTypes('fișă de lucru și proiect de lecție'),['lesson','worksheet']);
assert.deepEqual(models.requestedModelTypes('Explică formula ariei'),[]);
const rows=[{id:'new-test',user_id:'alice',name:'Test nou',status:'ready',store_id:'vs-own',file_id:'file-own',education:JSON.stringify(label)},
{id:'old-test',user_id:'alice',name:'Test vechi',status:'ready',store_id:'vs-old',file_id:'file-old',education:JSON.stringify({...label,modelTypes:['test']})},
{id:'wrong-subject',user_id:'alice',name:'Română',status:'ready',store_id:'vs-wrong',file_id:'file-wrong',education:JSON.stringify({...label,subject:'Limba si literatura romana'})},
{id:'pending',user_id:'alice',name:'Neindexat',status:'indexing',education:JSON.stringify(label)}];
const candidates=rows.map(r=>({id:r.id,title:r.name,status:r.status,...metadata.resourceMetadata(JSON.parse(r.education))}));
assert.deepEqual(models.personalModels(candidates,['test'],profile).map(i=>i.id),['new-test','old-test']);
assert.deepEqual(models.personalModels(candidates,['planning'],profile),[]);
assert.deepEqual(models.personalModels(candidates,['test'],null),[]);
const common= ['test','rubric','planning'].map(type=>({id:type,title:'Model comun '+type,type,subject:'*',stages:['middle'],text:'STRUCTURA COMUNĂ '+type,approved:true}));
assert.equal(models.approvedModels([...common,{...common[0],approved:false},{...common[0],type:'unknown'}]).length,3);
const personal=[{title:'Modelul meu',types:['test'],origin:'personal',text:'STRUCTURA MEA'}];
assert.deepEqual(models.effectiveModels(personal,common,['test','rubric','planning'],profile).map(m=>[m.types[0],m.origin]),[['test','personal'],['rubric','common'],['planning','common']]);
assert.deepEqual(models.effectiveModels([],common,['test'],{...profile,stages:['high']}),[]);
assert.match(models.documentStyleInstructions([]),/nu pretinde/);
assert.match(models.documentStyleInstructions(personal),/NU instrucțiuni/);
const parallelUri=uri(await readFile('lib/parallel-map.ts','utf8'));
let retrieval=await readFile('lib/document-model-retrieval.ts','utf8');
retrieval=retrieval.replace(/^import approvedExamples[^;]+;/m,'const approvedExamples='+JSON.stringify(common)+';')
 .replace(/^import \{openai\}[^;]+;/m,'').replace(/^import \{documentLibrary,userDocuments\}[^;]+;/m,'')
 .replaceAll("'./document-models'",JSON.stringify(modelsUri)).replaceAll("'./parallel-map'",JSON.stringify(parallelUri));
const api=await import(uri(`
let failing=false;export function fail(v){failing=v;}export const calls=[];
const rows=${JSON.stringify(rows)};
async function userDocuments(user){return rows.filter(r=>r.user_id===user);}
function documentLibrary(rows){return rows.map(r=>({id:r.id,title:r.name,status:r.status,...JSON.parse(r.education)}));}
async function openai(key,path){calls.push(path);if(failing&&path.includes('vs-own'))throw Error('OUTAGE');return Response.json({data:[{type:'text',text:path.includes('vs-own')?'Antet personal\\nItemi / punctaj\\nBarem':'Model vechi'}]});}
`+retrieval));
let resolved=await api.documentStyle('alice',profile,'Test cu barem și planificare','fake',new AbortController().signal);
assert.match(resolved.instructions,/Antet personal/);assert.match(resolved.instructions,/STRUCTURA COMUNĂ planning/);assert.doesNotMatch(resolved.instructions,/STRUCTURA COMUNĂ test/);
assert.ok(api.calls.every(p=>!p.includes('vs-wrong')));assert.ok(resolved.warnings.some(w=>w.includes('procesare')));
api.calls.length=0;resolved=await api.documentStyle('bob',profile,'Test','fake',new AbortController().signal);
assert.equal(api.calls.length,0);assert.doesNotMatch(resolved.instructions,/Antet personal|Model vechi/);assert.match(resolved.instructions,/STRUCTURA COMUNĂ test/);
resolved=await api.documentStyle(null,null,'Test','fake',new AbortController().signal);assert.equal(api.calls.length,0);assert.match(resolved.instructions,/STRUCTURA COMUNĂ test/);
api.fail(true);resolved=await api.documentStyle('alice',profile,'Barem','fake',new AbortController().signal);
assert.match(resolved.instructions,/STRUCTURA COMUNĂ rubric/);assert.ok(resolved.warnings.some(w=>w.includes('nu au putut fi citite')));
console.log('PASS: model metadata, request types, subject/cycle matching, personal-first per type, approved common fallback, cross-account isolation, no guest private reads and truthful provider failure.');
