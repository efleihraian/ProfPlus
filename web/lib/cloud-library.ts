/** Shared educational metadata only; no account data enters this cache. */
import {cloudImportCatalog,cloudOriginals,type CloudConfig} from './supabase-storage';
import {commonResource,type CommonResource} from './common-resource';
export type CloudCommonSnapshot={states:Record<string,string>;resources:Record<string,CommonResource>;originals:Map<string,'manuals'|'competitions'>};
const snapshots=new Map<string,{credential:string;expires:number;staleUntil:number;retryAt:number;value?:CloudCommonSnapshot;pending?:Promise<CloudCommonSnapshot>}>();
export async function cloudCommonLibrary(config:CloudConfig,store:string,background:(promise:Promise<unknown>)=>void=()=>{}):Promise<CloudCommonSnapshot>{
 const scope=(config.SUPABASE_URL||'')+'|'+store;
 const credential=config.SUPABASE_SECRET_KEY||'';
 let entry=snapshots.get(scope);
 if(entry?.credential!==credential){entry={credential,expires:0,staleUntil:0,retryAt:0};snapshots.set(scope,entry);}
 if(snapshots.size>4)snapshots.delete(snapshots.keys().next().value!);
 const current=entry;
 const usable=current.value&&current.staleUntil>Date.now();
 if(usable&&current.expires>Date.now())return current.value!;
 if(current.pending)return usable?current.value!:current.pending;
 if(usable&&current.retryAt>Date.now())return current.value!;
 // One deadline covers every page; a slow refresh cannot hold the dialog indefinitely.
 const signal=AbortSignal.timeout(8000);
 const pending=Promise.all([cloudImportCatalog(config,signal),cloudOriginals(config,signal)]).then(([rows,originals])=>{
  const states:Record<string,string>={};const resources:Record<string,CommonResource>={};
  for(const row of rows){
   if(!['manuals','competitions'].includes(row.family)||typeof row.uid!=='string')continue;
   if(row.family==='manuals'&&!/^\d+-\d+$/.test(row.uid))continue;
   if(row.family==='competitions'&&!/^competition-[a-f0-9]{24}$/.test(row.uid))continue;
   // A URL, original, extracted text, or omission never implies AI availability.
   if(row.status==='indexed'&&row.file_id&&row.attached===1)states[row.uid]='ready';
   else if(['uploaded','indexing'].includes(row.status))states[row.uid]='indexing';
   else if(['failed','omitted','skipped'].includes(row.status))states[row.uid]='failed';
   if(row.family!=='competitions'||!states[row.uid]||['omitted','skipped'].includes(row.status))continue;
   let metadata:Record<string,unknown>;
   try{metadata=typeof row.metadata==='string'?JSON.parse(row.metadata):row.metadata;}catch{continue;}
   if(!metadata||typeof metadata!=='object')continue;
   const item=commonResource({uid:row.uid,category:metadata.category,title:metadata.title,subject:metadata.subject,publisher:metadata.publisher,source_url:metadata.url,class:metadata.schoolClass,stages:Array.isArray(metadata.stages)?metadata.stages.join(','):'',page_locator:metadata.pageLocator});
   if(item)resources[item.uid]=item.resource;
  }
  const value={states,resources,originals};current.value=value;current.expires=Date.now()+60000;current.staleUntil=Date.now()+300000;current.retryAt=0;return value;
 }).catch(error=>{current.retryAt=Date.now()+10000;throw error;
 }).finally(()=>{current.pending=undefined;});
 current.pending=pending;
 if(usable){background(pending.catch(()=>{}));return current.value!;}
 return pending;
}
