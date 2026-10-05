import catalog from "./manual-catalog.json";
import extra from './educational-resources.json';
import collection from "./active-collection.json";
export const collectionIds = collection.uids;

export type Source = { id: number; kind: "manual" | "document" | "web"; title: string; schoolClass?: string; subject?: string; publisher?: string; page?: number; url: string; uid?: string; documentId?: string };
export type Evidence = { source: Source; text: string };
type Hit = { score?: number; filename?: string; attributes?: { uid?: string }; content?: { type: string; text?: string }[] };
const metadata = {...catalog,...extra} as Record<string, { title: string; class?: string;schoolClass?:string; subject: string; publisher: string; url: string }>;

export async function retrieve(query: string, key: string, store: string, signal: AbortSignal, selected = collectionIds): Promise<Evidence[]> {
  if (!selected.length) return [];
  const response = await fetch(`https://api.openai.com/v1/vector_stores/${encodeURIComponent(store)}/search`, {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, signal,
    body: JSON.stringify({ query, filters: { type: "in", key: "uid", value: selected }, max_num_results: 8, rewrite_query: true, ranking_options: { score_threshold: 0.25 } }),
  });
  if (!response.ok) throw new Error("RAG_SEARCH_UNAVAILABLE");
  const data = await response.json() as { data?: Hit[] };
  const evidence: Evidence[] = [];
  const seen = new Map<string, Evidence>();
  for (const hit of data.data || []) {
    const uid = hit.attributes?.uid || hit.filename?.replace(/\.txt$/, "");
    const item = uid ? metadata[uid] : undefined;
    if (!item || !uid || !selected.includes(uid)) continue;
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
        evidence.push({ source: { id: evidence.length + 1, kind: "manual", uid, title: item.title, schoolClass: item.class||item.schoolClass, subject: item.subject, publisher: item.publisher, page, url: item.url + "#page=" + page }, text: text.slice(0, 4800) });
        seen.set(key, evidence[evidence.length - 1]);
      }
    }
  }
  return evidence.slice(0, 8);
}
