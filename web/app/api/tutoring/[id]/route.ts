import {accountIdentity, accountJson} from "../../../../lib/account-auth";
import {sameOrigin} from "../../../../lib/document-store";
import {validateTutoring} from "../../../../lib/tutoring";
import {changeAd, deleteAd} from "../../../../lib/tutoring-store";
import {readJson, tutoringFailure} from "../../../../lib/tutoring-http";
type Context = {params: Promise<{id: string}>};
/** Proprietarul editează, pune pe pauză, republică sau prelungește anunțul. */
export async function PATCH(request: Request, context: Context) {
  if (!sameOrigin(request)) return accountJson({error: "Origine nepermisă."}, 403);
  try {
    const user = await accountIdentity(request); if (!user || user.deleting) return accountJson({error: "Autentificare necesară."}, 401);
    const body = await readJson(request) as {action?: string; ad?: unknown};
    const id = (await context.params).id;
    if (body?.action === "update") { const r = validateTutoring(body.ad); if (!r.ok) return accountJson({error: r.error.message, field: r.error.field}, 400); await changeAd(user.id, id, {action: "update", input: r.input}); }
    else if (body?.action === "pause" || body?.action === "publish" || body?.action === "renew") await changeAd(user.id, id, {action: body.action});
    else return accountJson({error: "Acțiune invalidă."}, 400);
    return accountJson({saved: true});
  } catch (e) { return tutoringFailure(e); }
}
export async function DELETE(request: Request, context: Context) {
  if (!sameOrigin(request)) return accountJson({error: "Origine nepermisă."}, 403);
  try { const user = await accountIdentity(request); if (!user || user.deleting) return accountJson({error: "Autentificare necesară."}, 401); await deleteAd(user.id, (await context.params).id); return accountJson({deleted: true}); }
  catch (e) { return tutoringFailure(e); }
}
