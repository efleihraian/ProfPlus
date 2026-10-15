import {openai, storage, type DocumentRow} from "./document-store";
import {labelsDb} from "./document-labels";
/** Șterge originalul, fișierul/indexul la furnizor, etichetele și rândul unui document deținut. */
export async function deleteOwnedDocument(user: string, row: DocumentRow) {
  if (row.user_id !== user) throw new Error("OWNERSHIP_MISMATCH");
  const {db, bucket, key} = storage();
  await db.prepare("UPDATE documents SET status = 'deleting' WHERE id = ? AND user_id = ?").bind(row.id, user).run();
  for (const path of [row.store_id && `/vector_stores/${row.store_id}`, row.file_id && `/files/${row.file_id}`]) {
    if (!path) continue;
    try { await openai(key, path, {method: "DELETE"}); } catch (e) { if (!(e instanceof Error) || e.message !== "PROVIDER_404") throw e; }
  }
  await bucket.delete(row.id);
  await (await labelsDb()).prepare("DELETE FROM document_labels WHERE document_id=? AND user_id=?").bind(row.id, user).run();
  await db.prepare("DELETE FROM documents WHERE id = ? AND user_id = ?").bind(row.id, user).run();
}
