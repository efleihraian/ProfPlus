import {accountIdentity, accountJson} from "../../../lib/account-auth";
import {sameOrigin} from "../../../lib/document-store";
import {TUTORING_FORMATS, TUTORING_LEVELS, validateTutoring} from "../../../lib/tutoring";
import {createAd, listPublicAds} from "../../../lib/tutoring-store";
import {readJson, tutoringFailure} from "../../../lib/tutoring-http";
/** Lista publică: fără date de contact. */
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams, page = Number(p.get("page") || 1);
  const f = {q: p.get("q") || "", subject: p.get("subject") || "", level: p.get("level") || "", format: p.get("format") || "", city: p.get("city") || "", page};
  if (!Number.isInteger(page) || page < 1 || page > 200 || f.q.length > 80 || f.subject.length > 80 || f.city.length > 60 || (f.level && !TUTORING_LEVELS.some(l => l.id === f.level)) || (f.format && !TUTORING_FORMATS.some(x => x.id === f.format))) return accountJson({error: "Filtre invalide."}, 400);
  try { return accountJson(await listPublicAds(f)); } catch (e) { return tutoringFailure(e); }
}
/** Publicare: cont ProfPlus cu profil didactic, acord explicit pentru publicarea datelor de contact. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return accountJson({error: "Origine nepermisă."}, 403);
  try {
    const user = await accountIdentity(request);
    if (!user || user.deleting) return accountJson({error: "Conectează-te ca să publici un anunț."}, 401);
    if (user.provider === "supabase" && !user.teaching) return accountJson({error: "Completează profilul didactic din Cont înainte să publici."}, 403);
    const body = await readJson(request) as {ad?: unknown; consent?: unknown};
    if (body?.consent !== true) return accountJson({error: "Confirmă că ești de acord cu publicarea anunțului și a datelor de contact.", field: "consent"}, 400);
    const result = validateTutoring(body.ad);
    if (!result.ok) return accountJson({error: result.error.message, field: result.error.field}, 400);
    return accountJson({id: await createAd(user.id, result.input)}, 201);
  } catch (e) { return tutoringFailure(e); }
}
