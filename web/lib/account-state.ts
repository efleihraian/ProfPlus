import {cloudEnabled,cloudDatabase,type CloudConfig} from './supabase-storage';
import {env} from 'cloudflare:workers';
let initialized:Promise<unknown>|undefined;
export async function accountStateDb(){
 const config=env as unknown as CloudConfig & {DB?:D1Database};const db=cloudEnabled(config)?cloudDatabase(config):config.DB;if(!db)throw new Error('ACCOUNT_STORAGE_UNAVAILABLE');
 // Idempotent initialization also supports existing local pilots before migration deploy.
 initialized??=db.prepare('CREATE TABLE IF NOT EXISTS account_deletions (user_id TEXT PRIMARY KEY NOT NULL, started_at INTEGER NOT NULL)').run().catch(e=>{initialized=undefined;throw e;});
 await initialized;return db;
}
export async function deletionPending(user:string){
 const config=env as unknown as CloudConfig & {DB?:D1Database};const db=cloudEnabled(config)?cloudDatabase(config):config.DB;
 if(!db)return false;
 return !!await (await accountStateDb()).prepare('SELECT user_id FROM account_deletions WHERE user_id=?').bind(user).first();
}
