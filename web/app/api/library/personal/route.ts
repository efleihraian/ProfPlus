import { json, publicDocument, refreshDocument, rowsForChat, userId } from "../../../../lib/document-store";
import { PERSONAL_LIBRARY_LIMIT, personalLibraryId } from "../../../../lib/personal-library";
import { parallelMap } from "../../../../lib/parallel-map";
// Lista documentelor din biblioteca personală a contului autentificat. Încărcarea și ștergerea
// folosesc /api/documents (scope=library) și /api/documents/[id], cu aceleași controale ca în conversații.
export async function GET(request: Request) {
  const user = await userId(request); if (!user) return json({ error: "Autentifică-te pentru biblioteca personală." }, 401);
  try {
    const rows = await parallelMap(await rowsForChat(user, await personalLibraryId(user)), refreshDocument);
    return json({ documents: rows.filter(r => r.status !== "deleting").map(publicDocument), limit: PERSONAL_LIBRARY_LIMIT });
  } catch { return json({ error: "Biblioteca personală este temporar indisponibilă. Reîncearcă." }, 503); }
}
