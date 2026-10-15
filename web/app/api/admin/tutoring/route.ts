import {accountJson} from "../../../../lib/account-auth";
import {requireAdministrator} from "../../../../lib/admin-store";
import {sameOrigin} from "../../../../lib/document-store";
import {moderateAd, moderationQueue} from "../../../../lib/tutoring-store";
import {readJson, tutoringFailure} from "../../../../lib/tutoring-http";
export async function GET(request: Request) {
  try { if (!await requireAdministrator(request)) return accountJson({error: "Acces rezervat administratorului."}, 403); return accountJson({ads: await moderationQueue()}); }
  catch (e) { return tutoringFailure(e); }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return accountJson({error: "Origine nepermisă."}, 403);
  try {
    if (!await requireAdministrator(request)) return accountJson({error: "Acces rezervat administratorului."}, 403);
    const body = await readJson(request, 500) as {id?: unknown; action?: unknown};
    if (typeof body?.id !== "string" || (body.action !== "hide" && body.action !== "restore")) return accountJson({error: "Cerere invalidă."}, 400);
    await moderateAd(body.id, body.action); return accountJson({saved: true});
  } catch (e) { return tutoringFailure(e); }
}
