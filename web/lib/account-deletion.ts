import {env} from 'cloudflare:workers';
import {accountStateDb} from './account-state';
import {storage,type DocumentRow} from './document-store';
import {eraseAccount} from './account-erasure';
export class DeletionError extends Error {constructor(public status:number,message:string){super(message);}}
export function deletionEnabled(){const c=env as unknown as {SUPABASE_SECRET_KEY?:string;AUTH_PROVIDER?:string;DB?:D1Database;DOCUMENTS?:R2Bucket;OPENAI_API_KEY?:string};return c.AUTH_PROVIDER==='supabase'&&!!c.SUPABASE_SECRET_KEY&&!!c.DB&&!!c.DOCUMENTS&&!!c.OPENAI_API_KEY;}
async function eraseOpenAI(key:string,path:string){
 const response=await fetch('https://api.openai.com/v1'+path,{method:'DELETE',headers:{Authorization:`Bearer ${key}`},signal:AbortSignal.timeout(20000)});
 if(!response.ok&&response.status!==404)throw new Error('ERASURE_PROVIDER_UNAVAILABLE');
}
// Only a remotely verified identity is passed here. The request cannot supply a target UID.
export async function deleteOwnAccount(user:string,supabaseUrl:string){
 if(!deletionEnabled())throw new DeletionError(503,'La ștergerea contului lipsește configurația serverului. Datele nu au fost modificate.');
 if(!/^supabase:[0-9a-f-]{36}$/i.test(user))throw new DeletionError(400,'Cont invalid.');
 const db=await accountStateDb(),{bucket,key}=storage();
 if(await db.prepare("SELECT id FROM documents WHERE user_id=? AND status='uploading' AND created_at>?").bind(user,Date.now()-120000).first())throw new DeletionError(409,'O încărcare este în curs. Așteaptă finalizarea și reîncearcă.');
 const secret=(env as unknown as {SUPABASE_SECRET_KEY:string}).SUPABASE_SECRET_KEY;
 await eraseAccount(user,{
  lock:async owner=>{
   // One SQL statement orders the erasure lock against upload reservations.
   const locked=await db.prepare("INSERT OR IGNORE INTO account_deletions (user_id,started_at) SELECT ?,? WHERE NOT EXISTS (SELECT 1 FROM documents WHERE user_id=? AND status='uploading' AND created_at>?)").bind(owner,Date.now(),owner,Date.now()-120000).run();
   if(!locked.meta.changes&&!await db.prepare('SELECT user_id FROM account_deletions WHERE user_id=?').bind(owner).first())throw new DeletionError(409,'O încărcare este în curs. Așteaptă finalizarea și reîncearcă.');
  },
  documents:async owner=>(await db.prepare('SELECT * FROM documents WHERE user_id=?').bind(owner).all<DocumentRow>()).results,
  mark:async(owner,id)=>{await db.prepare("UPDATE documents SET status='deleting' WHERE id=? AND user_id=?").bind(id,owner).run();},
  eraseIndex:id=>eraseOpenAI(key,'/vector_stores/'+encodeURIComponent(id)),
  eraseFile:id=>eraseOpenAI(key,'/files/'+encodeURIComponent(id)),
  eraseOriginal:async id=>{await bucket.delete(id);},
  eraseRow:async(owner,id)=>{await db.prepare('DELETE FROM documents WHERE id=? AND user_id=?').bind(id,owner).run();},
  eraseAppData:async owner=>{await db.batch([db.prepare('DELETE FROM conversations WHERE user_id=?').bind(owner),db.prepare('DELETE FROM projects WHERE user_id=?').bind(owner)]);},
  eraseIdentity:async owner=>{
   const response=await fetch(supabaseUrl+'/auth/v1/admin/users/'+encodeURIComponent(owner.slice(9)),{method:'DELETE',headers:{apikey:secret,Authorization:`Bearer ${secret}`,'Content-Type':'application/json'},body:JSON.stringify({should_soft_delete:false}),signal:AbortSignal.timeout(20000)});
   if(!response.ok&&response.status!==404)throw new Error('AUTH_ERASURE_UNAVAILABLE');
  },
  finish:async owner=>{await db.prepare('DELETE FROM account_deletions WHERE user_id=?').bind(owner).run();},
 });
}
