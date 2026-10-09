/** Temporary, narrowly scoped migration capability; disabled without lock, secret and expiry. */
import {env} from 'cloudflare:workers';
import {cloudBucket} from '../../../../lib/supabase-storage';
import {sameOrigin,json} from '../../../../lib/document-store';
type Configuration={DB?:D1Database;DOCUMENTS?:R2Bucket;SUPABASE_URL?:string;SUPABASE_SECRET_KEY?:string;DATA_MIGRATION_LOCK?:string;STORAGE_MIGRATION_KEY?:string;STORAGE_MIGRATION_EXPIRES?:string};
const specs={documents:['id','user_id','chat_id','name','mime','size','store_id','file_id','status','created_at'],projects:['id','user_id','name','created_at'],conversations:['id','user_id','title','project_id','deleted','messages','selection','revision','created_at','updated_at'],document_labels:['document_id','user_id','metadata'],account_deletions:['user_id','started_at'],guest_chat_budget:['bucket','used','expires']} as const;
function equalSecret(a:string,b:string){if(a.length!==b.length)return false;let difference=0;for(let i=0;i<a.length;i++)difference|=a.charCodeAt(i)^b.charCodeAt(i);return difference===0;}
async function cloudRequest(c:Configuration,path:string,init:RequestInit={}){
 const url=new URL(c.SUPABASE_URL!);if(url.protocol!=='https:'||!url.hostname.endsWith('.supabase.co'))throw new Error('MIGRATION_CONFIGURATION');
 const headers=new Headers(init.headers);headers.set('apikey',c.SUPABASE_SECRET_KEY!);const result=await fetch(url.origin+'/rest/v1/'+path,{...init,headers,signal:AbortSignal.timeout(30000)});
 if(!result.ok)throw new Error('MIGRATION_PROVIDER');return result.json() as Promise<Record<string,unknown>[]>;
}
export async function POST(request:Request){
 const c=env as unknown as Configuration;
 if(!sameOrigin(request)||c.DATA_MIGRATION_LOCK!=='true'||!c.STORAGE_MIGRATION_KEY||c.STORAGE_MIGRATION_KEY.length<40||!equalSecret(request.headers.get('x-profplus-migration')||'',c.STORAGE_MIGRATION_KEY)||!Number.isFinite(Number(c.STORAGE_MIGRATION_EXPIRES))||Date.now()>Number(c.STORAGE_MIGRATION_EXPIRES))return json({error:'Acces nepermis.'},403);
 if(!c.DB||!c.DOCUMENTS||!c.SUPABASE_URL||!c.SUPABASE_SECRET_KEY)return json({error:'Migrarea nu este configurată.'},503);
 try{
  // Source database is deliberately D1 even when the destination flag is set.
  const schemaSql="SELECT name FROM sqlite_master WHERE type='table'";
  const existing=new Set((await c.DB.prepare(schemaSql).all<{name:string}>()).results.map(t=>t.name));const counts:Record<string,number>={};
  for(const [name,columns] of Object.entries(specs)){
   if(!existing.has(name)){counts[name]=0;continue;}
   const sourceSql='SELECT * FROM '+name;const rows=(await c.DB.prepare(sourceSql).all<Record<string,unknown>>()).results;
   if(rows.length>500)throw new Error('MIGRATION_REQUIRES_BATCHING');
   for(const source of rows){
    const row=Object.fromEntries(columns.map(k=>[k,source[k]??null]));
    if(name==='documents'){
     const object=await c.DOCUMENTS.get(String(row.id));if(!object)throw new Error('MIGRATION_ORIGINAL_MISSING');
     await cloudBucket({...c,DATA_BACKEND:'supabase'}).put(String(row.id),new Uint8Array(await object.arrayBuffer()),{httpMetadata:{contentType:String(row.mime)}});
    }
    const idColumn=columns[0];const params=new URLSearchParams({[idColumn]:'eq.'+String(row[idColumn]),select:'*'});
    let target=await cloudRequest(c,name+'?'+params);
    if(!target.length){await cloudRequest(c,name,{method:'POST',headers:{'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify(row)});target=await cloudRequest(c,name+'?'+params);}
    if(target.length!==1||columns.some(k=>target[0][k]!==row[k]))throw new Error('MIGRATION_RECORD_MISMATCH');
   }
   counts[name]=rows.length;
  }
  return json({verified:true,counts,sourcePreserved:true});
 }catch{return json({error:'Migrarea nu a fost confirmată. Datele sursă au fost păstrate.'},503);}
}
