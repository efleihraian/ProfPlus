import {parallelMap} from './parallel-map';
import catalog from "./manual-catalog.json";
import extra from './educational-resources.json';
import {resourceMetadata,type ResourceCategory} from './resource-metadata';
import {labelsDb} from './document-labels';
import type {Stage,TeachingProfile} from './teaching-profile';
import {automaticSources} from './source-selection';
import { openai, storage, type DocumentRow } from "./document-store";
export type LibraryItem = { id: string; kind: "manual" | "document"; title: string; schoolClass?: string; subject?: string; publisher?: string; category?:ResourceCategory;stages?:Stage[];chatId?:string; url: string; status: string };
export async function manualStates(key: string, store: string) {
  const states: Record<string, string> = {}; let after = "";
  const signal = AbortSignal.timeout(30000);
  do {
    const params = new URLSearchParams({ limit: "100" }); if (after) params.set("after", after);
    const data = await (await openai(key, `/vector_stores/${store}/files?${params}`, { signal })).json() as { data: { attributes?: { uid?: string }; status: string }[]; has_more: boolean; last_id: string };
    for (const f of data.data) if (f.attributes?.uid) states[f.attributes.uid] = f.status === "completed" ? "ready" : f.status === "in_progress" ? "indexing" : "failed";
    after = data.has_more ? data.last_id : "";
  } while (after);
  return states;
}
export function manualLibrary(states: Record<string, string>): LibraryItem[] {
  return [...Object.entries(catalog).map(([id, m]) => ({ id, kind: "manual" as const, category:"manual" as const, title: m.title, schoolClass: m.class, subject: m.subject, publisher: m.publisher, url: m.url, status: states[id] || "catalog" })), ...Object.entries(extra as Record<string,{title:string;schoolClass?:string;subject:string;stages:Stage[];category:ResourceCategory;url:string;publisher?:string}>).map(([id,m])=>({...m,id,kind:"manual" as const,status:states[id]||"catalog"}))];
}
export async function userDocuments(user: string) {
  return (await (await labelsDb()).prepare("SELECT d.*,l.metadata AS education FROM documents d LEFT JOIN document_labels l ON d.id=l.document_id AND d.user_id=l.user_id WHERE d.user_id = ? ORDER BY d.created_at DESC").bind(user).all<DocumentRow>()).results;
}
export function documentLibrary(rows: DocumentRow[]): LibraryItem[] {
  return rows.map(d => {let metadata=null;try{metadata=resourceMetadata(JSON.parse(d.education||'null'));}catch{}return {...metadata,category:metadata?.category||'document',chatId:d.chat_id, id: d.id, kind: "document", title: d.name, url: `/api/documents/${d.id}`, status: d.status };});
}

export async function librarySnapshot(user:string|null,profile:TeachingProfile|null,key?:string,store?:string,chatId?:string){
 const warnings:string[]=[];let states:Record<string,string>={};let documents:DocumentRow[]=[];
 try{if(key&&store)states=await manualStates(key,store);else warnings.push('Starea surselor comune nu este disponibilă.');}catch{warnings.push('Sursele comune nu au putut fi verificate. Reîncearcă.');}
 if(user)try{const {refreshDocument}=await import('./document-store');documents=await parallelMap(await userDocuments(user),refreshDocument);}catch{warnings.push('Documentele tale nu au putut fi verificate. Reîncearcă.');}
 const items=[...manualLibrary(states),...documentLibrary(documents)];return {items,warnings,selection:automaticSources(items,profile,chatId)};
}
