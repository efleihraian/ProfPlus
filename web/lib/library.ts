import catalog from "./manual-catalog.json";
import { openai, storage, type DocumentRow } from "./document-store";
export type LibraryItem = { id: string; kind: "manual" | "document"; title: string; schoolClass?: string; subject?: string; publisher?: string; url: string; status: string };
export async function manualStates(key: string, store: string) {
  const states: Record<string, string> = {}; let after = "";
  const signal = AbortSignal.timeout(15000);
  do {
    const params = new URLSearchParams({ limit: "100" }); if (after) params.set("after", after);
    const data = await (await openai(key, `/vector_stores/${store}/files?${params}`, { signal })).json() as { data: { attributes?: { uid?: string }; status: string }[]; has_more: boolean; last_id: string };
    for (const f of data.data) if (f.attributes?.uid) states[f.attributes.uid] = f.status === "completed" ? "ready" : f.status === "in_progress" ? "indexing" : "failed";
    after = data.has_more ? data.last_id : "";
  } while (after);
  return states;
}
export function manualLibrary(states: Record<string, string>): LibraryItem[] {
  return Object.entries(catalog).map(([id, m]) => ({ id, kind: "manual", title: m.title, schoolClass: m.class, subject: m.subject, publisher: m.publisher, url: m.url, status: states[id] || "catalog" }));
}
export async function userDocuments(user: string) {
  return (await storage().db.prepare("SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC").bind(user).all<DocumentRow>()).results;
}
export function documentLibrary(rows: DocumentRow[]): LibraryItem[] {
  return rows.map(d => ({ id: d.id, kind: "document", title: d.name, url: `/api/documents/${d.id}`, status: d.status }));
}
