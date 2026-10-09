import {cloudEnabled,cloudReady,cloudDatabase,cloudBucket,type CloudConfig} from './supabase-storage';
import {accountIdentity} from "./account-auth";
import { env } from "cloudflare:workers";
export type DocumentRow = { id: string; user_id: string; chat_id: string; name: string; mime: string; size: number; store_id: string | null; file_id: string | null; status: string; created_at: number; education?:string };
export type ChatDocument = { id: string; name: string; size: number; status: string };
type Bindings = CloudConfig & { DB?: D1Database; DOCUMENTS?: R2Bucket; OPENAI_API_KEY?: string;DATA_MIGRATION_LOCK?:string };
export const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export function storage() {
  const config = env as unknown as Bindings;
  if(config.DATA_MIGRATION_LOCK==='true')throw new Error('STORAGE_MAINTENANCE');
  if(cloudEnabled(config)){if(!cloudReady(config)||!config.OPENAI_API_KEY)throw new Error('STORAGE_UNAVAILABLE');return {db:cloudDatabase(config),bucket:cloudBucket(config),key:config.OPENAI_API_KEY};}
  if (!config.DB || !config.DOCUMENTS || !config.OPENAI_API_KEY) throw new Error("STORAGE_UNAVAILABLE");
  return { db: config.DB, bucket: config.DOCUMENTS, key: config.OPENAI_API_KEY };
}
export async function userId(request: Request) { const identity=await accountIdentity(request);return identity&&!identity.deleting?identity.id:null; }
export function validChatId(value: unknown): value is string { return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(value); }
export function sameOrigin(request: Request) { const origin = request.headers.get("origin"); return !!origin && origin === new URL(request.url).origin; }
export function publicDocument(row: DocumentRow): ChatDocument { return { id: row.id, name: row.name, size: row.size, status: row.status }; }
export async function openai(key: string, path: string, init: RequestInit = {}) {
  const response = await fetch("https://api.openai.com/v1" + path, { ...init, headers: { ...init.headers, Authorization: `Bearer ${key}` }, signal: init.signal || AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error("PROVIDER_" + response.status);
  return response;
}
export async function rowsForChat(user: string, chat: string) {
  return (await storage().db.prepare("SELECT * FROM documents WHERE user_id = ? AND chat_id = ? ORDER BY created_at").bind(user, chat).all<DocumentRow>()).results;
}
export async function ownedDocument(user: string, id: string) {
  return storage().db.prepare("SELECT * FROM documents WHERE id = ? AND user_id = ?").bind(id, user).first<DocumentRow>();
}
export async function refreshDocument(row: DocumentRow): Promise<DocumentRow> {
  if (row.status === "uploading" && Date.now() - row.created_at > 120000) {
    await storage().db.prepare("UPDATE documents SET status = 'failed' WHERE id = ? AND user_id = ? AND status = 'uploading'").bind(row.id, row.user_id).run();
    return { ...row, status: "failed" };
  }
  if (row.status !== "indexing" || !row.store_id || !row.file_id) return row;
  const { key, db } = storage();
  const data = await (await openai(key, `/vector_stores/${row.store_id}/files/${row.file_id}`)).json() as { status: string };
  const status = data.status === "completed" ? "ready" : ["failed", "cancelled"].includes(data.status) ? "failed" : "indexing";
  if (status !== row.status) await db.prepare("UPDATE documents SET status = ? WHERE id = ? AND user_id = ?").bind(status, row.id, row.user_id).run();
  return { ...row, status };
}
