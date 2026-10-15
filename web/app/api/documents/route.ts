import { json, openai, publicDocument, refreshDocument, rowsForChat, sameOrigin, storage, userId, validChatId } from "../../../lib/document-store";
import {accountIdentity} from '../../../lib/account-auth';
import {resourceMetadata} from '../../../lib/resource-metadata';
import {saveDocumentLabels} from '../../../lib/document-labels';
import {PERSONAL_LIBRARY_LIMIT,personalLibraryId} from '../../../lib/personal-library';
import {classDocumentsId,hiddenGroupIds,isClassSection} from '../../../lib/class-workspace';
import {ownedClass,userProjectIds} from '../../../lib/class-store';
const types: Record<string, string> = { pdf: "application/pdf", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation", txt: "text/plain", md: "text/markdown", html: "text/html" };
export async function GET(request: Request) {
  const user = await userId(request); if (!user) return json({ error: "Autentifică-te pentru documentele tale." }, 401);
  const chat = new URL(request.url).searchParams.get("chatId"); if (!validChatId(chat)) return json({ error: "Conversație invalidă." }, 400);
  try { return json({ documents: await Promise.all((await rowsForChat(user, chat)).map(async r => publicDocument(await refreshDocument(r)))) }); }
  catch { return json({ error: "Documentele sunt temporar indisponibile. Reîncearcă." }, 503); }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Origine nepermisă." }, 403);
  const user = await userId(request); if (!user) return json({ error: "Autentifică-te pentru a încărca documente." }, 401);
  if (!request.headers.get("content-type")?.includes("multipart/form-data")) return json({ error: "Selectează un document." }, 415);
  if (Number(request.headers.get("content-length")) > 11 * 1024 * 1024) return json({ error: "Documentul poate avea cel mult 10 MB." }, 413);
  let id = "", fileId = "", storeId = "";
  try {
    const reader = request.body?.getReader(); if (!reader) return json({ error: "Document invalid." }, 400);
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 11 * 1024 * 1024) { await reader.cancel(); return json({ error: "Documentul poate avea cel mult 10 MB." }, 413); }
      chunks.push(value);
    }
    const payload = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { payload.set(chunk, offset); offset += chunk.byteLength; }
    const form = await new Response(payload, { headers: { "Content-Type": request.headers.get("content-type")! } }).formData(), file = form.get("file"), scope = form.get("scope");
    // Biblioteca personală: grupul este derivat din contul verificat, niciodată primit de la client.
    // Clasele: grupul pe secțiune este derivat din proiectul clasei verificat ca aparținând contului.
    const library = scope === "library", forClass = scope === "class", libraryId = await personalLibraryId(user);
    let chat: FormDataEntryValue | null = library ? libraryId : form.get("chatId");
    if (forClass) {
      const cls = await ownedClass(user, form.get("classId")), section = form.get("section");
      if (!cls || !isClassSection(section)) return json({ error: "Clasă sau secțiune invalidă." }, 400);
      chat = await classDocumentsId(user, cls.id, section);
    }
    const scoped = library || forClass;
    if ((scope !== null && !scoped) || (!scoped && (await hiddenGroupIds(user, await userProjectIds(user))).has(String(chat)))) return json({ error: "Destinație invalidă pentru document." }, 400);
    if (!validChatId(chat) || !(file instanceof File)) return json({ error: "Document sau conversație invalidă." }, 400);
    if (file.size === 0 || file.size > 10 * 1024 * 1024) return json({ error: "Alege un document nevid de cel mult 10 MB." }, 413);
    const name = file.name.replace(/[\x00-\x1f/\\]/g, "_").slice(-180), ext = name.split(".").at(-1)?.toLowerCase() || "", mime = types[ext];
    if (!mime) return json({ error: "Formate acceptate: PDF, DOC, DOCX, PPTX, TXT, MD și HTML." }, 415);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if ((ext === "pdf" && new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") || (["docx", "pptx"].includes(ext) && (bytes[0] !== 80 || bytes[1] !== 75)) || (ext === "doc" && ![208, 123].includes(bytes[0]))) return json({ error: "Fișierul nu corespunde formatului declarat." }, 415);
    const { db, bucket, key } = storage();
    if(!scoped&&!await db.prepare("SELECT id FROM conversations WHERE id=? AND user_id=? AND deleted=0").bind(chat,user).first())return json({error:"Conversație indisponibilă."},404);
    id = crypto.randomUUID();
    const reserved = await db.prepare("INSERT INTO documents (id,user_id,chat_id,name,mime,size,status,created_at) SELECT ?,?,?,?,?,?,'uploading',? WHERE (SELECT COUNT(*) FROM documents WHERE user_id = ? AND chat_id = ?) < 10 AND (SELECT COUNT(*) FROM documents WHERE user_id = ?) < 50 AND NOT EXISTS (SELECT 1 FROM account_deletions WHERE user_id = ?)").bind(id, user, chat, name, mime, file.size, Date.now(), user, chat, user, user).run();
    if (!reserved.meta.changes && forClass) return json({ error: "O secțiune a clasei poate avea cel mult 10 documente (și 50 pe cont). Șterge un document pentru a continua." }, 409);
    if (!reserved.meta.changes && library) return json({ error: `Biblioteca personală poate avea cel mult ${PERSONAL_LIBRARY_LIMIT} documente (și 50 pe cont). Șterge un document pentru a continua.` }, 409);
    if (!reserved.meta.changes) return json({ error: "Limita este de 10 documente pe conversație și 50 pe cont. Șterge un document pentru a continua." }, 409);
    const identity=await accountIdentity(request),profile=identity?.teaching;// Documentele clasei rămân surse numai în conversațiile clasei: fără etichete de profil.
    const metadata=forClass?null:resourceMetadata({category:'document',subject:profile?.subject,stages:profile?.stages});if(metadata&&!await saveDocumentLabels(user,id,metadata))throw new Error('UPLOAD_BLOCKED');
    await bucket.put(id, bytes, { httpMetadata: { contentType: mime } });
    const upload = new FormData(); upload.append("purpose", "assistants"); upload.append("file", new Blob([bytes], { type: mime }), name);
    const uploaded = await (await openai(key, "/files", { method: "POST", body: upload })).json() as { id: string }; fileId = uploaded.id;
    await db.prepare("UPDATE documents SET file_id = ? WHERE id = ? AND user_id = ?").bind(fileId, id, user).run();
    const store = await (await openai(key, "/vector_stores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "ProfPlus document " + id }) })).json() as { id: string }; storeId = store.id;
    await db.prepare("UPDATE documents SET store_id = ? WHERE id = ? AND user_id = ?").bind(storeId, id, user).run();
    await openai(key, `/vector_stores/${storeId}/files`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ file_id: fileId, attributes: { document_id: id }, chunking_strategy: { type: "static", static: { max_chunk_size_tokens: 500, chunk_overlap_tokens: 100 } } }) });
    await db.prepare("UPDATE documents SET status = 'indexing' WHERE id = ? AND user_id = ?").bind(id, user).run();
    return json({ document: { id, name, size: file.size, status: "indexing" } }, 202);
  } catch {
    if (id) {
      try { const { db } = storage(); await db.prepare("UPDATE documents SET status = 'failed' WHERE id = ? AND user_id = ?").bind(id, user).run(); } catch { /* The recoverable failure is reported below. */ }
    }
    return json({ error: "Documentul nu a putut fi procesat. Reîncearcă; dacă apare în listă cu eroare, îl poți șterge." }, 503);
  }
}
