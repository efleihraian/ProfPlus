import {env} from 'cloudflare:workers';
import type {ResourceMetadata} from './resource-metadata';
let initialized:Promise<unknown>|undefined;
export async function labelsDb(){
 const db=(env as unknown as {DB:D1Database}).DB;
 initialized??=db.prepare('CREATE TABLE IF NOT EXISTS document_labels (document_id TEXT PRIMARY KEY NOT NULL,user_id TEXT NOT NULL,metadata TEXT NOT NULL)').run().catch(e=>{initialized=undefined;throw e;});
 await initialized;return db;
}
export async function saveDocumentLabels(user:string,id:string,metadata:ResourceMetadata){
 const db=await labelsDb();
 const result=await db.prepare("INSERT INTO document_labels(document_id,user_id,metadata) SELECT id,user_id,? FROM documents WHERE id=? AND user_id=? AND status!='deleting' AND NOT EXISTS (SELECT 1 FROM account_deletions WHERE user_id=?) ON CONFLICT(document_id) DO UPDATE SET metadata=excluded.metadata WHERE document_labels.user_id=excluded.user_id").bind(JSON.stringify(metadata),id,user,user).run();
 return !!result.meta.changes;
}
