import {commonResource} from './common-resource';
import catalog from "./manual-catalog.json";
import extra from './educational-resources.json';
import collection from "./active-collection.json";
export const collectionIds = collection.uids;

export type Source = { id: number; kind: "manual" | "document" | "web"; title: string; schoolClass?: string; subject?: string; publisher?: string; page?: number; url: string; uid?: string; category?: "manual" | "olympiad" | "competition" | "other"; documentId?: string };
export type Evidence = { source: Source; text: string };
type Hit = { score?: number; filename?: string; attributes?: { uid?: string;[key:string]:unknown }; content?: { type: string; text?: string }[] };
const metadata = {...catalog,...extra} as Record<string, { title: string; class?: string;schoolClass?:string; subject: string; publisher: string; url: string; pageLocator?:string }>;

export async function retrieve(query: string, key: string, store: string, signal: AbortSignal, selected?:string[],priority:string[]=[],manualFirst=false): Promise<Evidence[]> {
  if (selected?.length===0) return [];
  const preferred=priority.filter(id=>selected?.includes(id));
  if(preferred.length){
    const [focused,broad]=await Promise.all([retrieve(query,key,store,signal,preferred),retrieve(query,key,store,signal,selected,[],manualFirst)]);
    const first=focused.slice(0,4),seen=new Set(first.map(e=>e.source.uid+':'+e.source.page+':'+e.text));
    return [...first,...broad.filter(e=>!seen.has(e.source.uid+':'+e.source.page+':'+e.text))].slice(0,8);
  }
  if(manualFirst){
    const manualIds=(selected||Object.keys(catalog)).filter(uid=>Object.hasOwn(catalog,uid));
    const otherIds=selected?.filter(uid=>!Object.hasOwn(catalog,uid));
    const otherFilter=otherIds?{type:"in",key:"uid",value:otherIds}:{type:"or",filters:[{type:"in",key:"uid",value:Object.keys(extra)},{type:"in",key:"category",value:["olympiad","competition"]}]};
    const [manuals,others]=await Promise.all([
      manualIds.length?searchEvidence(query,key,store,signal,manualIds,{type:"in",key:"uid",value:manualIds}):Promise.resolve([]),
      otherIds?.length===0?Promise.resolve([]):searchEvidence(query,key,store,signal,otherIds,otherFilter),
    ]);
    // Reserve curriculum evidence even when contest hits have higher similarity scores.
    const ordered=[...manuals.slice(0,6),...others,...manuals.slice(6)],seen=new Set<string>();
    return ordered.filter(e=>{const id=e.source.uid+":"+e.source.page+":"+e.text;if(seen.has(id))return false;seen.add(id);return true;}).slice(0,8);
  }
  const filters=selected?{type:"in",key:"uid",value:selected}:{type:"or",filters:[{type:"in",key:"uid",value:Object.keys(metadata)},{type:"in",key:"category",value:["olympiad","competition"]}]};
  return searchEvidence(query,key,store,signal,selected,filters);
}

async function searchEvidence(query:string,key:string,store:string,signal:AbortSignal,selected:string[]|undefined,filters:unknown):Promise<Evidence[]>{
  const response = await fetch(`https://api.openai.com/v1/vector_stores/${encodeURIComponent(store)}/search`, {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, signal,
    body: JSON.stringify({ query, filters, max_num_results: 8, rewrite_query: true, ranking_options: { score_threshold: 0.25 } }),
  });
  if (!response.ok) throw new Error("RAG_SEARCH_UNAVAILABLE");
  const data = await response.json() as { data?: Hit[] };
  const evidence: Evidence[] = [];
  const seen = new Map<string, Evidence>();
  for (const hit of data.data || []) {
    const uid = hit.attributes?.uid || hit.filename?.replace(/\.txt$/, "");
    const item = uid ? metadata[uid]||commonResource(hit.attributes)?.resource : undefined;
    if (!item || !uid || (selected&&!selected.includes(uid))) continue;
    for (const content of hit.content || []) {
      if (content.type !== "text" || !content.text) continue;
      // Ignore truncated leading text whose page cannot be determined.
      const matches = [...content.text.matchAll(/\[\[PAGE:(\d+)\]\]([\s\S]*?)(?=\[\[PAGE:\d+\]\]|$)/g)];
      for (const match of matches) {
        const page = Number(match[1]);
        const text = match[2].trim();
        if (!Number.isInteger(page) || page < 1 || text.length < 40) continue;
        const key = uid + ":" + page;
        const previous = seen.get(key);
        if (previous) {
          if (!previous.text.includes(text)) previous.text = (previous.text + "\n" + text).slice(0, 4800);
          continue;
        }
        evidence.push({ source: { id: evidence.length + 1, kind: "manual", uid, category:Object.hasOwn(catalog,uid)?"manual":commonResource(hit.attributes)?.resource.category||"other", title: item.title, schoolClass: item.class||item.schoolClass, subject: item.subject, publisher: item.publisher, page:item.pageLocator==='fragment'?undefined:page, url: item.url + (item.pageLocator==='fragment'||/\.(zip|rar|gz|tar)(\?|$)/i.test(item.url)?'':"#page=" + page) }, text: text.slice(0, 4800) });
        seen.set(key, evidence[evidence.length - 1]);
      }
    }
  }
  return evidence.slice(0, 8);
}
