/** Shared educational metadata only; no account data enters this cache. */
import {cloudImportCatalog,cloudOriginals,type CloudConfig} from './supabase-storage';
import {commonResource,type CommonResource} from './common-resource';
export type CloudCommonSnapshot={states:Record<string,string>;resources:Record<string,CommonResource>;originals:Map<string,'manuals'|'competitions'>};
const snapshots=new Map<string,{credential:string;expires:number;value?:CloudCommonSnapshot;pending?:Promise<CloudCommonSnapshot>}>();
export async function cloudCommonLibrary(config:CloudConfig,store:string):Promise<CloudCommonSnapshot>{
 const scope=(config.SUPABASE_URL||'')+'|'+store;
 const credential=config.SUPABASE_SECRET_KEY||'';
 let entry=snapshots.get(scope);
 if(entry?.credential===credential){if(entry.pending)return entry.pending;if(entry.value&&entry.expires>Date.now())return entry.value;}
 entry={credential,expires:0};snapshots.set(scope,entry);
 if(snapshots.size>4)snapshots.delete(snapshots.keys().next().value!);
 const current=entry;
 const pending=Promise.all([cloudImportCatalog(config),cloudOriginals(config)]).then(([rows,originals])=>{
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
  const value={states,resources,originals};current.value=value;current.expires=Date.now()+60000;return value;
 }).finally(()=>{current.pending=undefined;});
 current.pending=pending;return pending;
}
