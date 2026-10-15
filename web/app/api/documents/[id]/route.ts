import { json, ownedDocument, sameOrigin, storage, userId } from "../../../../lib/document-store";
import { deleteOwnedDocument } from "../../../../lib/document-delete";
import {resourceMetadata} from '../../../../lib/resource-metadata';
import {saveDocumentLabels} from '../../../../lib/document-labels';
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
    await deleteOwnedDocument(user, row);
    return json({ deleted: true });
  } catch { return json({ error: "Ștergerea nu a fost finalizată. Reîncearcă." }, 503); }
}

export async function PATCH(request:Request,context:Context){
 if(!sameOrigin(request)||!request.headers.get('origin'))return json({error:'Origine nepermisă.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Format neacceptat.'},415);
 const user=await userId(request);if(!user)return json({error:'Autentificare necesară.'},401);
 try{const raw=await request.text();if(raw.length>2000)return json({error:'Cerere prea mare.'},413);const metadata=resourceMetadata(JSON.parse(raw));if(!metadata)return json({error:'Alege tipul, materia și clasele materialului.'},400);
  if(!await saveDocumentLabels(user,(await context.params).id,metadata))return json({error:'Document indisponibil.'},404);
  return json({saved:true});
 }catch{return json({error:'Clasificarea nu a putut fi salvată.'},503);}
}
