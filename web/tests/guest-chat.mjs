import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const uri=s=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const budget=await import(uri(await readFile('lib/guest-chat.ts','utf8')));
const counts=new Map();const db={prepare(sql){let args;return {bind(...a){args=a;return this;},async run(){},async first(){const count=counts.get(args[0])||0;if(count>=args[2])return null;counts.set(args[0],count+1);return {used:count+1};}};}};
for(let n=0;n<5;n++)assert.equal(await budget.allowGuestChat(db,1000),true);
assert.equal(await budget.allowGuestChat(db,1000),false);
let route=await readFile('app/api/chat/route.ts','utf8');route=route.replace(/^import .*;\s*$/gm,'');
const fileSource=(await readFile("lib/guest-files.ts","utf8")).replace(/export /g,"");
const exerciseOptionsModule=uri(await readFile('lib/exercise-options.ts','utf8'));
const modelImports="import {resolveAIModel} from "+JSON.stringify(uri(await readFile('lib/ai-models.ts','utf8')))+";\n";
const exerciseImports="import {exerciseInstructions,exerciseFormat,verifyExercisePlan} from "+JSON.stringify(exerciseOptionsModule)+";\n";
const prefix=modelImports+exerciseImports+fileSource+`const env={OPENAI_API_KEY:'fixture',OPENAI_VECTOR_STORE_ID:'fixture'};const collectionIds=['public'];const assessmentFormat={};const documentStyle=async user=>{if(user)throw Error('Unexpected private style');return {instructions:'\\nSTILUL DOCUMENTELOR: sobru',warnings:[]};};const withPriorities=(s,p)=>({...s,priorityManualIds:(p?.priorityManualIds||[]).filter(id=>s.manualIds.includes(id)),priorityDocumentIds:(p?.priorityDocumentIds||[]).filter(id=>s.documentIds.includes(id))});const validSelection=()=>true;const userId=async()=>null;const accountIdentity=async()=>null;const authConfig=()=>({provider:'supabase'});const storage=()=>({db:{}});const allowGuestChat=async()=>true;const validChatId=()=>true;const teacherEvidence=()=>{throw Error('Private evidence accessed')};const librarySnapshot=async(user)=>{if(user)throw Error('Private library accessed');return {selection:{manualIds:['public'],documentIds:[]}}};const retrieve=async(q,k,s,a,ids)=>{if(ids.join()!=='public')throw Error('Private selection');return [];};const response=async()=>({});const outputText=()=>JSON.stringify({reply:'Salut!',needsWeb:false,webQuery:'',knowledgeUsed:true,isDocument:false,documentTitle:''});const citedSources=(reply)=>({reply,sources:[]});`;
const {POST}=await import(uri(prefix+route));
const req=body=>new Request('http://localhost/api/chat',{method:'POST',headers:{origin:'http://localhost','content-type':'application/json'},body:JSON.stringify(body)});
const messages=[{role:'user',content:'Salut'}];
let r=await POST(req({messages}));assert.equal(r.status,200);assert.equal((await r.json()).reply,'Salut!');
for(const extra of [{chatId:'private'},{revision:1},{selection:{manualIds:[],documentIds:['private']}}])assert.equal((await POST(req({messages,...extra}))).status,401);
assert.equal((await POST(req({messages:[{role:'system',content:'bad'}]}))).status,400);
const limited=await import(uri(prefix.replace('const allowGuestChat=async()=>true','const allowGuestChat=async()=>false')+route));assert.equal((await limited.POST(req({messages}))).status,429);
console.log('Guest reply, private isolation, validation and aggregate budget passed.');

const files=await import(uri(await readFile('lib/guest-files.ts','utf8')));
const file={name:'lesson.txt',data:'data:text/plain;base64,'+Buffer.from('Test educational').toString('base64')};
assert.equal(files.validateGuestFiles([file]).length,1);
assert.throws(()=>files.validateGuestFiles([{name:'bad.pdf',data:'data:application/pdf;base64,'+Buffer.from('invalid').toString('base64')}]));
assert.throws(()=>files.validateGuestFiles([file,file,file,file]));
assert.equal((await POST(req({messages,guestFiles:[file]}))).status,200);
assert.equal((await POST(req({messages,guestFiles:[{...file,name:'run.exe'}]}))).status,400);
console.log('Temporary file input validation passed.');

// P-086: model is a server-validated choice.
assert.equal((await POST(req({messages,model:'gpt-6.1-sol'}))).status,401);
for(const model of ['invalid',null,{},'gpt-6-astra'])assert.equal((await POST(req({messages,model}))).status,400);
const modelPrefix=prefix.replace('const userId=async()=>null','const userId=async()=>"signed-in"')
 .replace('const accountIdentity=async()=>null','const accountIdentity=async()=>({id:"signed-in"})')
 .replace('const documentStyle=async user=>{if(user)throw Error(\'Unexpected private style\');','const documentStyle=async user=>{')
 .replace('const response=async()=>({});','let usedModels=[];export const models=()=>usedModels;const response=async(k,b)=>{usedModels.push(b.model);return {};};')
 .replace("reply:'Salut!'","reply:'# Test\\n1. Calculați 2+2.'").replace('isDocument:false','isDocument:true');
const signed=await import(uri(modelPrefix+route));
for(const model of ['gpt-4.1-mini','gpt-6.1-sol']){
 const before=signed.models().length;
 const r=await signed.POST(req({messages:[{role:'user',content:'Generează un test simplu.'}],model,selection:{mode:'manual',manualIds:[],documentIds:[]}}));
 assert.equal(r.status,200);assert.equal((await r.json()).model,model);
 assert.deepEqual(signed.models().slice(before),[model,model],'generation and review use the selected model');
}
console.log('PASS: guest Sol denied, unknown models rejected, signed-in model used for generation/review and reported in response.');
