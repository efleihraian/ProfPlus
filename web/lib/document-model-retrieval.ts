import approvedExamples from './common-document-models.json';
import {openai} from './document-store';
import {documentLibrary,userDocuments} from './library';
import {approvedModels,documentStyleInstructions,effectiveModels,personalModels,requestedModelTypes,type StyleReference} from './document-models';
import type {TeachingProfile} from './teaching-profile';
import {parallelMap} from './parallel-map';

async function modelText(response:Response):Promise<string>{
  const reader=response.body?.getReader();if(!reader)throw Error('EMPTY_MODEL');
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;
    if(size>1024*1024){await reader.cancel();throw Error('MODEL_TOO_LARGE');}chunks.push(value);
  }
  const result=JSON.parse(await new Blob(chunks as BlobPart[]).text()) as {data?:{type?:string;text?:string}[]};
  const text=(result.data||[]).filter(c=>c.type==='text'&&typeof c.text==='string').map(c=>c.text).join('\n').trim();
  if(!text)throw Error('EMPTY_MODEL');
  return text.length<=6000?text:text.slice(0,4800)+'\n[… fragment omis …]\n'+text.slice(-1200);
}
export async function documentStyle(user:string|null,profile:TeachingProfile|null,query:string,key:string,signal:AbortSignal){
  const types=requestedModelTypes(query),warnings:string[]=[],loaded:StyleReference[]=[];
  if(!types.length)return {instructions:documentStyleInstructions([]),warnings};
  if(user){
    try{
      const rows=await userDocuments(user),items=documentLibrary(rows);
      const selected=personalModels(items,types,profile);
      if(items.some(i=>i.modelTypes?.some(t=>types.includes(t))&&i.status!=='ready'&&i.status!=='deleting'))warnings.push('Unele modele personale sunt încă în procesare sau indisponibile. Vor fi folosite după indexare.');
      const results=await parallelMap(selected,async candidate=>{try{
        const row=rows.find(r=>r.id===candidate.id&&r.user_id===user);
        if(!row?.store_id||!row.file_id)throw Error('MODEL_UNAVAILABLE');
        const response=await openai(key,`/vector_stores/${encodeURIComponent(row.store_id)}/files/${encodeURIComponent(row.file_id)}/content`,{signal});
        return {title:row.name,types:candidate.modelTypes!,origin:'personal' as const,text:await modelText(response)};
      }catch{return null;}},2);
      loaded.push(...results.filter((r):r is NonNullable<typeof r>=>r!==null));
      if(results.some(r=>!r))warnings.push('Unele modele personale nu au putut fi citite. Pentru tipurile respective sunt folosite modelele comune disponibile sau formatul standard; reîncearcă pentru a folosi modelele tale.');
    }catch{warnings.push('Modelele personale nu au putut fi verificate. Reîncearcă pentru a le folosi.');}
  }
  const models=effectiveModels(loaded,approvedModels(approvedExamples),types,profile,query);
  return {instructions:documentStyleInstructions(models,types,profile,query),warnings};
}
