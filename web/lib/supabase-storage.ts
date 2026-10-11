/** Server-only bridge to private Supabase Storage and fixed Postgres operations. */
import operations from './supabase-operations.json';
export type CloudConfig={DATA_BACKEND?:string;SUPABASE_URL?:string;SUPABASE_SECRET_KEY?:string};
export function cloudEnabled(c:CloudConfig){return c.DATA_BACKEND==='supabase';}
export function cloudReady(c:CloudConfig){return cloudEnabled(c)&&!!c.SUPABASE_URL&&!!c.SUPABASE_SECRET_KEY;}
function connection(c:CloudConfig){
 if(!cloudReady(c))throw new Error('SUPABASE_DATA_NOT_CONFIGURED');
 const url=new URL(c.SUPABASE_URL!);if(url.protocol!=='https:'||!url.hostname.endsWith('.supabase.co')||url.username||url.password)throw new Error('INVALID_SUPABASE_ORIGIN');
 return {url:url.origin,key:c.SUPABASE_SECRET_KEY!};
}
async function request(c:CloudConfig,path:string,init:RequestInit={}){
 const {url,key}=connection(c);const headers=new Headers(init.headers);headers.set('apikey',key);
 return fetch(url+path,{...init,headers,signal:init.signal||AbortSignal.timeout(30000)});
}
const normalize=(sql:string)=>sql.replace(/\s+/g,' ').trim();
class Statement{
 constructor(readonly c:CloudConfig,readonly sql:string,readonly args:unknown[]=[]){if(!Object.hasOwn(operations,normalize(sql)))throw new Error('UNSUPPORTED_DATABASE_OPERATION');}
 bind(...args:unknown[]){return new Statement(this.c,this.sql,args);}
 operation(){const item=operations[normalize(this.sql) as keyof typeof operations];if(this.args.length!==item.count)throw new Error('INVALID_BINDINGS');return {op:item.op,args:this.args};}
 async run<T=Record<string,unknown>>(){return (await batch<T>(this.c,[this]))[0];}
 async all<T=Record<string,unknown>>(){return this.run<T>();}
 async first<T=Record<string,unknown>>(column?:string):Promise<T|null>{const row=(await this.all<Record<string,unknown>>()).results[0];return (row?(column?row[column]:row):null) as T|null;}
}
async function batch<T>(c:CloudConfig,statements:Statement[]){
 if(statements.some(s=>!(s instanceof Statement)||s.c!==c))throw new Error('MIXED_DATABASE_BATCH');
 const response=await request(c,'/rest/v1/rpc/profplus_app_ops',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({operations:statements.map(s=>s.operation())})});
 if(!response.ok)throw new Error('SUPABASE_DATABASE_'+response.status);
 return await response.json() as {success:boolean;results:T[];meta:{changes:number}}[];
}
export function cloudDatabase(c:CloudConfig){return {prepare:(sql:string)=>new Statement(c,sql),batch:<T>(statements:Statement[])=>batch<T>(c,statements)} as unknown as D1Database;}
export function cloudBucket(c:CloudConfig){
 const bucket='profplus-private-documents';
 const object=(id:string)=>{if(!/^[0-9a-f-]{36}$/i.test(id))throw new Error('INVALID_DOCUMENT_ID');return '/storage/v1/object/'+bucket+'/'+id;};
 return {
  async put(id:string,value:Uint8Array,options?:{httpMetadata?:{contentType?:string}}){
   const bytes=new Uint8Array(value);const path=object(id);
   const response=await request(c,path,{method:'POST',headers:{'Content-Type':options?.httpMetadata?.contentType||'application/octet-stream','x-upsert':'false'},body:bytes});
   if(!response.ok&&response.status!==409)throw new Error('SUPABASE_UPLOAD_'+response.status);
   const check=await request(c,path);if(!check.ok)throw new Error('SUPABASE_UPLOAD_VERIFY_FAILED');
   const actual=await check.arrayBuffer();const expectedHash=await crypto.subtle.digest('SHA-256',bytes);const actualHash=await crypto.subtle.digest('SHA-256',actual);
   if(actual.byteLength!==bytes.byteLength||new Uint8Array(actualHash).some((v,i)=>v!==new Uint8Array(expectedHash)[i]))throw new Error('SUPABASE_UPLOAD_HASH_MISMATCH');
  },
  async get(id:string){const response=await request(c,object(id));if(response.status===404||response.status===400)return null;if(!response.ok)throw new Error('SUPABASE_DOWNLOAD_'+response.status);return {body:response.body,httpMetadata:{contentType:response.headers.get('content-type')||'application/octet-stream'}};},
  async delete(id:string){object(id);const response=await request(c,'/storage/v1/object/'+bucket,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefixes:[id]})});if(!response.ok&&response.status!==404)throw new Error('SUPABASE_DELETE_'+response.status);},
 } as unknown as R2Bucket;
}
export type CloudImportRow={family:string;uid:string;status:string;metadata:Record<string,unknown>|string;file_id:string|null;attached:number};
async function cloudPages<T>(c:CloudConfig,path:string,query:URLSearchParams,signal?:AbortSignal):Promise<T[]>{
 const read=async(offset:number,count=false,limit=1000)=>{
  const params=new URLSearchParams(query);params.set('offset',String(offset));params.set('limit',String(limit));
  const response=await request(c,path+'?'+params,{signal,headers:count?{Prefer:'count=exact'}:{}});
  if(!response.ok)throw new Error('CLOUD_LIBRARY_UNAVAILABLE');
  return {rows:await response.json() as T[],total:response.headers.get('content-range')?.split('/')[1]};
 };
 const first=await read(0,true);const result=[...first.rows];const total=Number(first.total);
 if(first.total&&first.total!=='*'&&Number.isSafeInteger(total)&&total>=result.length){
  const size=first.rows.length;if(!size&&total)throw new Error('INVALID_CLOUD_LIBRARY_PAGE');
  // Two pages per catalog: at most four common-library requests in flight.
  for(let offset=size;offset<total;offset+=size*2){
   const offsets=[offset,offset+size].filter(value=>value<total);
   const pages=await Promise.all(offsets.map(value=>read(value,false,size)));
   for(const page of pages){if(!page.rows.length)throw new Error('INVALID_CLOUD_LIBRARY_PAGE');result.push(...page.rows);}
  }
  return result;
 }
 // Keep pagination complete when a compatible endpoint omits the count header.
 let page=first.rows;
 while(page.length===1000){page=(await read(result.length)).rows;result.push(...page);}
 return result;
}
export async function cloudImportCatalog(c:CloudConfig,signal?:AbortSignal){
 const query=new URLSearchParams({select:'family,uid,status:state->>status,metadata:state->metadata,file_id:state->>file_id,attached:state->attached',family:'in.(manuals,competitions)',order:'family.asc,uid.asc'});
 return cloudPages<CloudImportRow>(c,'/rest/v1/library_import_documents',query,signal);
}
export async function cloudOriginals(c:CloudConfig,signal?:AbortSignal){
 const query=new URLSearchParams({select:'family,uid',kind:'eq.original',family:'in.(manuals,competitions)',order:'family.asc,uid.asc'});
 const rows=await cloudPages<{family:'manuals'|'competitions';uid:string}>(c,'/rest/v1/library_materials',query,signal);
 return new Map(rows.map(item=>[item.uid,item.family]));
}
export async function cloudOriginal(c:CloudConfig,family:string,uid:string){
 if(!['manuals','competitions'].includes(family)||!/^[a-zA-Z0-9_-]{1,160}$/.test(uid))throw new Error('INVALID_COMMON_RESOURCE');
 const query=new URLSearchParams({family:'eq.'+family,uid:'eq.'+uid,kind:'eq.original',select:'bucket,object_key,filename'});
 const response=await request(c,'/rest/v1/library_materials?'+query);if(!response.ok)throw new Error('CLOUD_LIBRARY_UNAVAILABLE');
 const items=await response.json() as {bucket:string;object_key:string;filename:string}[];const item=items[0];if(!item)return null;
 if(item.bucket!=='profplus-library'||!item.object_key.startsWith(family+'/'+uid+'/original/')||item.object_key.split('/').some(s=>s==='..'))throw new Error('INVALID_COMMON_OBJECT');
 const original=await request(c,'/storage/v1/object/'+item.bucket+'/'+item.object_key.split('/').map(encodeURIComponent).join('/'));if(!original.ok)throw new Error('CLOUD_ORIGINAL_UNAVAILABLE');return {body:original.body,mime:original.headers.get('content-type')||'application/octet-stream',name:item.filename};
}
