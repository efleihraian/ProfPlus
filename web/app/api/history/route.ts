import {isAIModel} from '../../../lib/ai-models';
import {validSelection,savedSelection} from '../../../lib/source-selection';
import {validGeneratedDocument} from '../../../lib/generated-document';
import { json, sameOrigin, storage, userId, validChatId } from '../../../lib/document-store';
import {hiddenGroupIds} from '../../../lib/class-workspace';
import {listClasses,userProjectIds} from '../../../lib/class-store';
// Grupurile interne (bibliotecă personală, documente și jurnal de clasă) nu sunt conversații.
const hidden=async(user:string)=>hiddenGroupIds(user,await userProjectIds(user));
export async function GET(request: Request) {
  const user = await userId(request); if (!user) return json({error:'Autentificare necesară.'},401);
  try {
    const db = storage().db, id = new URL(request.url).searchParams.get('id');
    const hiddenIds = await hidden(user);
    if (id && hiddenIds.has(id)) return json({error:'Conversație indisponibilă.'},404);
    if (id) { const chat = await db.prepare('SELECT id,title,project_id,messages,selection,revision,created_at,updated_at FROM conversations WHERE id=? AND user_id=? AND deleted=0').bind(id,user).first(); if (!chat) return json({error:'Conversație indisponibilă.'},404); return json({chat:{...chat,messages:JSON.parse(String(chat.messages)),selection:JSON.parse(String(chat.selection))}}); }
    // Adopt previous document-only conversations without inventing missing messages.
    await db.prepare("INSERT OR IGNORE INTO conversations (id,user_id,title,messages,selection,revision,created_at,updated_at) SELECT chat_id,user_id,'Documente anterioare','[]','null',0,MIN(created_at),MAX(created_at) FROM documents WHERE user_id=? AND NOT EXISTS (SELECT 1 FROM account_deletions WHERE user_id=?) GROUP BY chat_id,user_id").bind(user,user).run();
    const [projects,chats] = await Promise.all([db.prepare('SELECT id,name FROM projects WHERE user_id=? ORDER BY created_at DESC').bind(user).all(),db.prepare('SELECT id,title,project_id,revision,updated_at FROM conversations WHERE user_id=? AND deleted=0 ORDER BY updated_at DESC').bind(user).all()]);
    return json({projects:projects.results,chats:(chats.results as {id:string}[]).filter(c=>!hiddenIds.has(c.id))});
  } catch { return json({error:'Istoricul nu este disponibil momentan.'},503); }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({error:'Origine nepermisă.'},403);
  const user = await userId(request); if (!user) return json({error:'Autentificare necesară.'},401);
  try { const raw=await request.text(); if(raw.length>2000)return json({error:'Cerere prea mare.'},413); const b=JSON.parse(raw) as {kind?:string;name?:string;projectId?:string|null}; const db=storage().db;
    if (b.kind==='project') { if(typeof b.name!=='string'||!b.name.trim()||b.name.length>100) return json({error:'Numele proiectului trebuie să aibă 1–100 caractere.'},400); const id=crypto.randomUUID(); const inserted=await db.prepare('INSERT INTO projects(id,user_id,name,created_at) SELECT ?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM account_deletions WHERE user_id=?)').bind(id,user,b.name.trim(),Date.now(),user).run(); if(!inserted.meta.changes)return json({error:'Ștergerea contului este în curs.'},409); return json({id},201); }
    if(b.projectId && !await db.prepare('SELECT id FROM projects WHERE id=? AND user_id=?').bind(b.projectId,user).first()) return json({error:'Proiect indisponibil.'},404);
    const id=crypto.randomUUID(), now=Date.now(); const inserted=await db.prepare("INSERT INTO conversations(id,user_id,title,project_id,messages,selection,revision,created_at,updated_at) SELECT ?,?,'Conversație nouă',?,'[]','null',0,?,? WHERE NOT EXISTS (SELECT 1 FROM account_deletions WHERE user_id=?)").bind(id,user,b.projectId||null,now,now,user).run(); if(!inserted.meta.changes)return json({error:'Ștergerea contului este în curs.'},409); return json({id},201);
  } catch { return json({error:'Nu am putut crea elementul.'},503); }
}
export async function PUT(request: Request) {
  if (!sameOrigin(request)) return json({error:'Origine nepermisă.'},403);
  const user=await userId(request); if(!user) return json({error:'Autentificare necesară.'},401);
  try { const raw=await request.text(); if(raw.length>1000000) return json({error:'Conversația este prea mare.'},413);
    const b=JSON.parse(raw); if((await hidden(user)).has(b.id))return json({error:'Conversație invalidă.'},400); if(!validChatId(b.id)||!Number.isInteger(b.revision)||!Array.isArray(b.messages)||b.messages.length>1000||b.messages.some((m: {role?:string;content?:string;sources?:unknown[];warnings?:unknown[]})=>!m||!['user','assistant'].includes(m.role||'')||typeof m.content!=='string'||m.content.length>20000|| (m.sources!==undefined&&!Array.isArray(m.sources)) || (m.warnings!==undefined&&!Array.isArray(m.warnings)))) return json({error:'Conversație invalidă.'},400);
    for (const message of b.messages) {
      if(message.model!==undefined&&!isAIModel(message.model))return json({error:"Model AI invalid."},400);
      if(message.document!==undefined&&!validGeneratedDocument(message.document))return json({error:"Document generat invalid."},400);
      if (message.warnings?.some((w:unknown)=>typeof w!=='string') || message.sources?.some((source:{url?:unknown;id?:unknown;title?:unknown})=>!source||typeof source.url!=='string'||! /^(https?:\/\/|\/api\/documents\/)/.test(source.url)||typeof source.title!=='string'||typeof source.id!=='number')) return json({error:'Surse invalide.'},400);
    }
    if(b.selection!==null&&!validSelection(b.selection))return json({error:'Selecție invalidă.'},400);
    const db=storage().db;
    if(b.projectId && !await db.prepare('SELECT id FROM projects WHERE id=? AND user_id=?').bind(b.projectId,user).first()) return json({error:'Proiect indisponibil.'},404);
    const title=typeof b.title==='string'&&b.title.trim()?b.title.trim().slice(0,100):String(b.messages.find((m:{role:string})=>m.role==='user')?.content||'Conversație nouă').slice(0,80);
    const result=await db.prepare('UPDATE conversations SET title=?,project_id=?,messages=?,selection=?,revision=revision+1,updated_at=? WHERE id=? AND user_id=? AND revision=? AND deleted=0').bind(title,b.projectId||null,JSON.stringify(b.messages),JSON.stringify(savedSelection(b.selection)),Date.now(),b.id,user,b.revision).run();
    if(!result.meta.changes) return json({error:'Conversația a fost modificată în altă fereastră. Redeschide-o din istoric.'},409);
    return json({revision:b.revision+1});
  } catch { return json({error:'Salvarea a eșuat. Reîncearcă înainte să schimbi conversația.'},503); }
}

export async function DELETE(request: Request) {
  if(!sameOrigin(request))return json({error:'Origine nepermisă.'},403);
  const user=await userId(request);if(!user)return json({error:'Autentificare necesară.'},401);
  const url=new URL(request.url),id=url.searchParams.get('id'),kind=url.searchParams.get('kind');
  if(!validChatId(id)||!['chat','project'].includes(kind||''))return json({error:'Element invalid.'},400);
  if(kind==='chat'&&(await hidden(user)).has(id!))return json({error:'Element invalid.'},400);
  if(kind==='project'&&(await listClasses(user)).some(c=>c.id===id))return json({error:'Clasele se șterg din „Clasele mele”.'},400);
  try {
    const db=storage().db;
    if(kind==='chat') {
      const result=await db.prepare("UPDATE conversations SET deleted=1,messages='[]',selection='null',title='Conversație ștearsă',revision=revision+1,updated_at=? WHERE id=? AND user_id=? AND deleted=0").bind(Date.now(),id,user).run();
      if(!result.meta.changes)return json({error:'Conversație indisponibilă.'},404);
    } else {
      if(!await db.prepare('SELECT id FROM projects WHERE id=? AND user_id=?').bind(id,user).first())return json({error:'Proiect indisponibil.'},404);
      await db.batch([
        db.prepare('UPDATE conversations SET project_id=NULL,revision=revision+1 WHERE project_id=? AND user_id=?').bind(id,user),
        db.prepare('DELETE FROM projects WHERE id=? AND user_id=?').bind(id,user),
      ]);
    }
    return json({deleted:true});
  }catch{return json({error:'Ștergerea a eșuat. Reîncearcă.'},503);}
}
