import {storage, validChatId} from "./document-store";
import {parseClassTitle} from "./class-workspace";
export type OwnedClass = {id: string; name: string; g: number; l: string};
/** Clasele contului: proiectele cu numele standard al unei clase, filtrate pe user_id. */
export async function listClasses(user: string): Promise<OwnedClass[]> {
  const projects = (await storage().db.prepare("SELECT id,name FROM projects WHERE user_id=? ORDER BY created_at DESC").bind(user).all<{id: string; name: string}>()).results;
  return projects.flatMap(p => { const parsed = parseClassTitle(p.name); return parsed ? [{id: p.id, name: p.name, ...parsed}] : []; });
}
export async function ownedClass(user: string, id: unknown): Promise<OwnedClass | null> {
  if (!validChatId(id)) return null;
  return (await listClasses(user)).find(c => c.id === id) || null;
}
export async function userProjectIds(user: string): Promise<string[]> {
  return (await storage().db.prepare("SELECT id,name FROM projects WHERE user_id=? ORDER BY created_at DESC").bind(user).all<{id: string}>()).results.map(p => p.id);
}
