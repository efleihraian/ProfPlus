import {json, publicDocument, refreshDocument, rowsForChat, sameOrigin, storage, userId, type DocumentRow} from "../../../../lib/document-store";
import {ownedClass} from "../../../../lib/class-store";
import {deleteOwnedDocument} from "../../../../lib/document-delete";
import {parallelMap} from "../../../../lib/parallel-map";
import {CLASS_SECTIONS, JOURNAL_TITLE, classDocumentGroups, classJournalId, emptyJournal, validJournal, type ClassJournal} from "../../../../lib/class-workspace";
type Context = {params: Promise<{id: string}>};
type Conversation = {id: string; title: string; project_id: string | null; messages: string; revision: number; updated_at: number};

async function readJournal(user: string, project: string): Promise<{journal: ClassJournal; revision: number | null}> {
  const id = await classJournalId(user, project);
  const row = await storage().db.prepare("SELECT id,title,project_id,messages,selection,revision,created_at,updated_at FROM conversations WHERE id=? AND user_id=? AND deleted=0").bind(id, user).first<Conversation>();
  if (!row) return {journal: emptyJournal(), revision: null};
  try { const content = (JSON.parse(row.messages) as {content?: string}[])[0]?.content; return {journal: validJournal(JSON.parse(content || "null")) || emptyJournal(), revision: row.revision}; }
  catch { return {journal: emptyJournal(), revision: row.revision}; }
}

export async function GET(request: Request, context: Context) {
  const user = await userId(request); if (!user) return json({error: "Autentificare necesară."}, 401);
  try {
    const cls = await ownedClass(user, (await context.params).id); if (!cls) return json({error: "Clasă indisponibilă."}, 404);
    const db = storage().db, groups = await classDocumentGroups(user, cls.id), journalId = await classJournalId(user, cls.id);
    const [{journal, revision}, chats, documents] = await Promise.all([
      readJournal(user, cls.id),
      db.prepare("SELECT id,title,project_id,revision,updated_at FROM conversations WHERE user_id=? AND deleted=0 ORDER BY updated_at DESC").bind(user).all<Conversation>(),
      Promise.all(CLASS_SECTIONS.map(async s => [s.id, (await parallelMap(await rowsForChat(user, groups[s.id]), refreshDocument)).filter(r => r.status !== "deleting").map(publicDocument)] as const)),
    ]);
    return json({class: cls, journal, revision, documents: Object.fromEntries(documents), conversations: chats.results.filter(c => c.project_id === cls.id && c.id !== journalId).slice(0, 50).map(c => ({id: c.id, title: c.title, updatedAt: c.updated_at}))});
  } catch { return json({error: "Clasa este temporar indisponibilă. Reîncearcă."}, 503); }
}

/** Salvează jurnalul clasei (setări și observații) cu control de revizie. */
export async function PUT(request: Request, context: Context) {
  if (!sameOrigin(request)) return json({error: "Origine nepermisă."}, 403);
  const user = await userId(request); if (!user) return json({error: "Autentificare necesară."}, 401);
  try {
    const raw = await request.text(); if (raw.length > 250000) return json({error: "Jurnalul este prea mare."}, 413);
    const body = JSON.parse(raw) as {journal?: unknown; revision?: unknown};
    const journal = validJournal(body.journal); if (!journal) return json({error: "Date invalide: verifică lungimea observațiilor și setărilor."}, 400);
    const cls = await ownedClass(user, (await context.params).id); if (!cls) return json({error: "Clasă indisponibilă."}, 404);
    const db = storage().db, id = await classJournalId(user, cls.id), now = Date.now();
    let revision = body.revision;
    if (revision === null) {
      const created = await db.prepare("INSERT INTO conversations(id,user_id,title,project_id,messages,selection,revision,created_at,updated_at) SELECT ?,?,'Conversație nouă',?,'[]','null',0,?,? WHERE NOT EXISTS (SELECT 1 FROM account_deletions WHERE user_id=?)").bind(id, user, cls.id, now, now, user).run().catch(() => ({meta: {changes: 0}}));
      if (!created.meta.changes) return json({error: "Jurnalul a fost modificat în altă fereastră. Reîncarcă pagina."}, 409);
      revision = 0;
    }
    if (!Number.isInteger(revision)) return json({error: "Revizie invalidă."}, 400);
    const result = await db.prepare("UPDATE conversations SET title=?,project_id=?,messages=?,selection=?,revision=revision+1,updated_at=? WHERE id=? AND user_id=? AND revision=? AND deleted=0").bind(JOURNAL_TITLE, cls.id, JSON.stringify([{role: "assistant", content: JSON.stringify(journal)}]), "null", now, id, user, revision).run();
    if (!result.meta.changes) return json({error: "Jurnalul a fost modificat în altă fereastră. Reîncarcă pagina."}, 409);
    return json({revision: (revision as number) + 1});
  } catch { return json({error: "Salvarea a eșuat. Reîncearcă."}, 503); }
}

/** Șterge clasa: documentele încărcate în clasă, jurnalul și proiectul. Conversațiile clasei rămân în istoric. */
export async function DELETE(request: Request, context: Context) {
  if (!sameOrigin(request)) return json({error: "Origine nepermisă."}, 403);
  const user = await userId(request); if (!user) return json({error: "Autentificare necesară."}, 401);
  try {
    const cls = await ownedClass(user, (await context.params).id); if (!cls) return json({error: "Clasă indisponibilă."}, 404);
    const db = storage().db, groups = await classDocumentGroups(user, cls.id);
    const rows: DocumentRow[] = (await Promise.all(Object.values(groups).map(g => rowsForChat(user, g)))).flat();
    if (rows.some(r => r.status === "uploading" && Date.now() - r.created_at < 120000)) return json({error: "O încărcare este în curs. Reîncearcă după un minut."}, 409);
    for (const row of rows) await deleteOwnedDocument(user, row);
    await db.prepare("UPDATE conversations SET deleted=1,messages='[]',selection='null',title='Conversație ștearsă',revision=revision+1,updated_at=? WHERE id=? AND user_id=? AND deleted=0").bind(Date.now(), await classJournalId(user, cls.id), user).run();
    await db.batch([
      db.prepare("UPDATE conversations SET project_id=NULL,revision=revision+1 WHERE project_id=? AND user_id=?").bind(cls.id, user),
      db.prepare("DELETE FROM projects WHERE id=? AND user_id=?").bind(cls.id, user),
    ]);
    return json({deleted: true, documents: rows.length});
  } catch { return json({error: "Ștergerea nu a fost finalizată. Reîncearcă."}, 503); }
}
