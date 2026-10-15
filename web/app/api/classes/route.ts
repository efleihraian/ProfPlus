import {json, sameOrigin, storage, userId} from "../../../lib/document-store";
import {MAX_CLASSES, classTitle, validGrade} from "../../../lib/class-workspace";
import {listClasses} from "../../../lib/class-store";
export async function GET(request: Request) {
  const user = await userId(request); if (!user) return json({error: "Autentifică-te pentru clasele tale."}, 401);
  try { return json({classes: await listClasses(user)}); }
  catch { return json({error: "Clasele sunt temporar indisponibile. Reîncearcă."}, 503); }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({error: "Origine nepermisă."}, 403);
  const user = await userId(request); if (!user) return json({error: "Autentifică-te pentru a adăuga clase."}, 401);
  try {
    const raw = await request.text(); if (raw.length > 200) return json({error: "Cerere prea mare."}, 413);
    const body = JSON.parse(raw) as {g?: unknown; l?: unknown};
    if (!validGrade(body.g, body.l)) return json({error: "Alege clasa și litera."}, 400);
    const classes = await listClasses(user), name = classTitle(body.g, body.l as string);
    if (classes.some(c => c.name === name)) return json({error: "Clasa aceasta este deja în listă."}, 409);
    if (classes.length >= MAX_CLASSES) return json({error: `Poți avea cel mult ${MAX_CLASSES} clase.`}, 409);
    const id = crypto.randomUUID();
    const inserted = await storage().db.prepare("INSERT INTO projects(id,user_id,name,created_at) SELECT ?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM account_deletions WHERE user_id=?)").bind(id, user, name, Date.now(), user).run();
    if (!inserted.meta.changes) return json({error: "Ștergerea contului este în curs."}, 409);
    return json({class: {id, name, g: body.g, l: body.l}}, 201);
  } catch { return json({error: "Clasa nu a putut fi adăugată. Reîncearcă."}, 503); }
}
