import {accountIdentity, accountJson} from "../../../../../lib/account-auth";
import {sameOrigin} from "../../../../../lib/document-store";
import {reportAd} from "../../../../../lib/tutoring-store";
import {readJson, tutoringFailure} from "../../../../../lib/tutoring-http";
export async function POST(request: Request, context: {params: Promise<{id: string}>}) {
  if (!sameOrigin(request)) return accountJson({error: "Origine nepermisă."}, 403);
  try {
    const user = await accountIdentity(request); if (!user || user.deleting) return accountJson({error: "Conectează-te ca să raportezi un anunț."}, 401);
    const body = await readJson(request, 1000) as {reason?: unknown};
    const reason = typeof body?.reason === "string" ? body.reason.replace(/[\u0000-\u001f\u007f]/g, " ").trim() : "";
    return accountJson(await reportAd(user.id, (await context.params).id, reason));
  } catch (e) { return tutoringFailure(e); }
}
