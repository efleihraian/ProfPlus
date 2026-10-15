import {accountIdentity, accountJson} from "../../../../../lib/account-auth";
import {adContact} from "../../../../../lib/tutoring-store";
import {tutoringFailure} from "../../../../../lib/tutoring-http";
/** Contactul profesorului: numai pentru utilizatori conectați (protecție împotriva colectării automate). */
export async function GET(request: Request, context: {params: Promise<{id: string}>}) {
  try { const user = await accountIdentity(request); if (!user || user.deleting) return accountJson({error: "Conectează-te ca să vezi datele de contact."}, 401); return accountJson(await adContact((await context.params).id)); }
  catch (e) { return tutoringFailure(e); }
}
