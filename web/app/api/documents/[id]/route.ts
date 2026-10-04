import { json, openai, ownedDocument, sameOrigin, storage, userId } from "../../../../lib/document-store";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  const user = await userId(request); if (!user) return json({ error: "Autentificare necesară." }, 401);
  try {
    const row = await ownedDocument(user, (await context.params).id);
    if (!row || row.status === "deleting") return json({ error: "Document indisponibil." }, 404);
    const object = await storage().bucket.get(row.id); if (!object) return json({ error: "Document indisponibil." }, 404);
    return new Response(object.body, { headers: { "Content-Type": row.mime === "application/pdf" ? "application/pdf" : "application/octet-stream", "Content-Disposition": `${row.mime === "application/pdf" ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(row.name)}`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch { return json({ error: "Document temporar indisponibil." }, 503); }
}
export async function DELETE(request: Request, context: Context) {
  if (!sameOrigin(request)) return json({ error: "Origine nepermisă." }, 403);
  const user = await userId(request); if (!user) return json({ error: "Autentificare necesară." }, 401);
  try {
    const row = await ownedDocument(user, (await context.params).id); if (!row) return json({ error: "Document indisponibil." }, 404);
    if (row.status === "uploading" && Date.now() - row.created_at < 120000) return json({ error: "Încărcarea este în curs. Reîncearcă ștergerea după un minut." }, 409);
    const { db, bucket, key } = storage();
    await db.prepare("UPDATE documents SET status = 'deleting' WHERE id = ? AND user_id = ?").bind(row.id, user).run();
    for (const path of [row.store_id && `/vector_stores/${row.store_id}`, row.file_id && `/files/${row.file_id}`]) {
      if (!path) continue;
      try { await openai(key, path, { method: "DELETE" }); } catch (e) { if (!(e instanceof Error) || e.message !== "PROVIDER_404") throw e; }
    }
    await bucket.delete(row.id);
    await db.prepare("DELETE FROM documents WHERE id = ? AND user_id = ?").bind(row.id, user).run();
    return json({ deleted: true });
  } catch { return json({ error: "Ștergerea nu a fost finalizată. Reîncearcă." }, 503); }
}
