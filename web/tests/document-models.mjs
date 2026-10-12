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
const supplied=JSON.parse(await readFile('lib/common-document-models.json','utf8'));
const references=models.approvedModels(supplied);
assert.equal(references.length,10);
assert.equal(new Set(references.map(m=>m.id)).size,10);
assert.deepEqual(models.requestedModelTypes('Proiectarea unităților de învățare și fișă recapitulativă'),['unit','worksheet']);
assert.deepEqual(models.requestedModelTypes('Proiect al unității de învățare'),['unit']);
assert.deepEqual(models.requestedModelTypes('Proiectarea unei unități de învățare'),['unit']);
for(const [query,grade] of [['clasa a VII-a',7],['clasa VI',6],['clasa 5',5],['clasa a XII-a',12],['clasa 99',null]])assert.equal(models.requestedSchoolClass(query),grade);
for(const type of ['planning','unit'])for(const grade of [5,6,7]){
 const chosen=models.effectiveModels([],references,[type],profile,'clasa '+grade);
 assert.equal(chosen.length,1);assert.ok(chosen[0].title.includes(String(grade)));
}
assert.equal(models.effectiveModels([],references,['test'],profile,'clasa 6').length,2);
assert.deepEqual(models.effectiveModels([],references,['unit'],{...profile,subject:'Limba si literatura romana'},'clasa 6'),[]);
const ownUnit={title:'Unitatea mea',types:['unit'],origin:'personal',text:'Format personal'};
assert.deepEqual(models.effectiveModels([ownUnit],references,['unit'],profile,'clasa 6'),[ownUnit]);
assert.deepEqual(metadata.resourceMetadata({...label,modelTypes:['unit']}).modelTypes,['unit']);
assert.equal(models.approvedModels([{...supplied[0],schoolClass:6.5},{...supplied[0],schoolClass:99}]).length,0);
const schedule=models.documentStyleInstructions([ownUnit],['unit'],profile,'Proiectarea unității de matematică');
assert.match(schedule,/2 ore de algebră și 2 ore de geometrie/);assert.match(schedule,/14 ore/);
assert.ok(schedule.indexOf('REGULĂ PEDAGOGICĂ')<schedule.indexOf('MODELE DE REFERINȚĂ'));
assert.equal(models.planningStyleRules(['test'],profile,'Test de matematică'), '');
assert.equal(models.planningStyleRules(['planning'],{...profile,subject:'Limba engleza'},'Planificare de limba engleză'), '');
assert.match(models.documentStyleInstructions(models.effectiveModels([],references,['planning'],null,'matematică clasa VI'),['planning'],null,'matematică clasa VI'),/2 ore de algebră/);
assert.deepEqual(models.effectiveModels([],references,['planning'],null,'Planificare de limba engleză, clasa VI'),[]);
assert.deepEqual(models.effectiveModels([],references,['planning'],null,'Planificare clasa VI'),[]);
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
const defaultTest=models.effectiveModels([],references,['test'],profile,'clasa 6');
assert.match(models.documentStyleInstructions(defaultTest,['test'],profile,'clasa 6'),/40 de minute, 90 de puncte.*10 din oficiu/);
assert.match(models.documentStyleInstructions(defaultTest,['test'],profile,'clasa 6'),/Partea I grilă 30p/);
assert.doesNotMatch(models.documentStyleInstructions(personal,['test'],profile,'clasa 6'),/aplică efectiv valorile implicite/);
assert.doesNotMatch(models.documentStyleInstructions([],['lesson'],profile,'clasa 6'),/STRUCTURA TESTULUI/);
console.log('Approved default assessment structure and totals are explicit; personal models and other document types retain their own format.');
const planningModels=models.effectiveModels([],references,['planning'],profile,'clasa 6');
const headers=models.modelTableHeaders(planningModels,['planning']);assert.equal(headers.length,1);assert.equal(headers[0].length,6);
const goodTable='| '+headers[0].join(' | ')+' |\n| '+headers[0].map(()=> '---').join(' | ')+' |\n| Unitatea | C1 | Conținut | 2 | S1 | Observație |';
assert.equal(models.matchesModelTables(goodTable,headers),true);
assert.equal(models.matchesModelTables(goodTable.replace('NUMĂR ORE ALOCATE','ORE'),headers),false);
assert.equal(models.matchesModelTables(goodTable.replace(' | Observație |',' |'),headers),false);
assert.equal(models.matchesModelTables('Planificare în listă',headers),false);
assert.equal(models.matchesModelTables(goodTable.split('\n').slice(0,2).join('\n'),headers),false);
assert.deepEqual(models.modelTableHeaders(planningModels,['planning'],'Adaugă o coloană cu metode'),[]);
assert.match(models.documentStyleInstructions(planningModels,['planning'],profile,'clasa 6'),/ȘABLON FIX/);
console.log('Planning template exact column names/order and complete rows checked; explicit structure changes remain allowed.');
assert.equal(models.matchesModelLayout(goodTable,planningModels,['planning']),false);
const planningHeader='Unitatea de învățământ: [de completat]\nDisciplina: Matematică\nClasa: VI\nAnul școlar: [de completat]\nNr. ore/săptămână: 4\nManual: [verificat]\nProfesor: [de completat]\n';
assert.equal(models.matchesModelLayout(planningHeader+goodTable,planningModels,['planning']),true);
