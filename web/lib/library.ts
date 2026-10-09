import {env} from 'cloudflare:workers';
import {cloudEnabled,cloudOriginals,type CloudConfig} from './supabase-storage';
import {commonResource,type CommonResource} from './common-resource';
import {parallelMap} from './parallel-map';
import catalog from "./manual-catalog.json";
import extra from './educational-resources.json';
import {resourceMetadata,type ResourceCategory} from './resource-metadata';
import {labelsDb} from './document-labels';
import type {Stage,TeachingProfile} from './teaching-profile';
import {automaticSources} from './source-selection';
import { openai, storage, type DocumentRow } from "./document-store";
export type LibraryItem = { id: string; kind: "manual" | "document"; title: string; schoolClass?: string; subject?: string; publisher?: string; category?:ResourceCategory;stages?:Stage[];chatId?:string; url: string; status: string };
type CommonSnapshot={states:Record<string,string>;resources:Record<string,CommonResource>};
const commonCache=new Map<string,{key:string;expires:number;value?:CommonSnapshot;pending?:Promise<CommonSnapshot>}>();
export async function commonLibrary(key:string,store:string):Promise<CommonSnapshot>{
 let entry=commonCache.get(store);
 if(entry?.key===key){if(entry.pending)return entry.pending;if(entry.value&&entry.expires>Date.now())return entry.value;}
 entry={key,expires:0};commonCache.set(store,entry);
 // Bound server memory; only complete, public common-library snapshots are cached.
 if(commonCache.size>4)commonCache.delete(commonCache.keys().next().value!);
 const current=entry;
 const pending=loadCommonLibrary(key,store).then(value=>{current.value=value;current.expires=Date.now()+300000;return value;}).finally(()=>{current.pending=undefined;});
 current.pending=pending;
 return pending;
}
async function loadCommonLibrary(key: string, store: string) {
  const resources:Record<string,CommonResource>={};
  const states: Record<string, string> = {}; let after = ""; const cursors = new Set<string>();
  const signal = AbortSignal.timeout(120000);
  do {
    const params = new URLSearchParams({ limit: "100" }); if (after) params.set("after", after);
    const data = await (await openai(key, `/vector_stores/${store}/files?${params}`, { signal })).json() as { data: { attributes?: { uid?: string }; status: string }[]; has_more: boolean; last_id: string };
    for (const f of data.data) if (f.attributes?.uid) {states[f.attributes.uid] = f.status === "completed" ? "ready" : f.status === "in_progress" ? "indexing" : "failed";const item=commonResource(f.attributes);if(item)resources[item.uid]=item.resource;}
    after = data.has_more ? data.last_id : "";
    if(data.has_more&&(!after||cursors.has(after)))throw new Error("INVALID_LIBRARY_CURSOR");
    if(after)cursors.add(after);
  } while (after);
  return {states,resources};
}
export async function manualStates(key:string,store:string){return (await commonLibrary(key,store)).states;}
export function manualLibrary(states: Record<string, string>,dynamic:Record<string,CommonResource>={},verified=true): LibraryItem[] {
  return [...Object.entries(catalog).map(([id, m]) => ({ id, kind: "manual" as const, category:"manual" as const, title: m.title, schoolClass: m.class, subject: m.subject, publisher: m.publisher, url: m.url, status: states[id] || (verified?"catalog":"unknown") })), ...Object.entries({...extra,...dynamic} as Record<string,{title:string;schoolClass?:string;subject:string;stages:Stage[];category:ResourceCategory;url:string;publisher?:string}>).map(([id,m])=>({...m,id,kind:"manual" as const,status:states[id]||(verified?"catalog":"unknown")}))];
}
export async function userDocuments(user: string) {
  return (await (await labelsDb()).prepare("SELECT d.*,l.metadata AS education FROM documents d LEFT JOIN document_labels l ON d.id=l.document_id AND d.user_id=l.user_id WHERE d.user_id = ? ORDER BY d.created_at DESC").bind(user).all<DocumentRow>()).results;
}
export function documentLibrary(rows: DocumentRow[]): LibraryItem[] {
  return rows.map(d => {let metadata=null;try{metadata=resourceMetadata(JSON.parse(d.education||'null'));}catch{}return {...metadata,category:metadata?.category||'document',chatId:d.chat_id, id: d.id, kind: "document", title: d.name, url: `/api/documents/${d.id}`, status: d.status };});
}

export async function librarySnapshot(user:string|null,profile:TeachingProfile|null,key?:string,store?:string,chatId?:string){
 const warnings:string[]=[];let verified=false;let states:Record<string,string>={};let dynamic:Record<string,CommonResource>={};let documents:DocumentRow[]=[];
 try{if(key&&store){const common=await commonLibrary(key,store);states=common.states;dynamic=common.resources;verified=true;}else warnings.push('Starea surselor comune nu este disponibilă.');}catch{warnings.push('Sursele comune nu au putut fi verificate. Reîncearcă.');}
 if(user)try{const {refreshDocument}=await import('./document-store');documents=await parallelMap(await userDocuments(user),refreshDocument);}catch{warnings.push('Documentele tale nu au putut fi verificate. Reîncearcă.');}
 const items=[...manualLibrary(states,dynamic,verified),...documentLibrary(documents)];
 const config=env as unknown as CloudConfig;
 if(user&&cloudEnabled(config))try{const originals=await cloudOriginals(config);for(const item of items)if(item.kind==='manual'&&originals.has(item.id))item.url='/api/library/materials/'+originals.get(item.id)+'/'+encodeURIComponent(item.id);}catch{warnings.push('Copiile bibliotecii nu au putut fi verificate.');}
 return {items,warnings,selection:automaticSources(items,profile,chatId)};
}
