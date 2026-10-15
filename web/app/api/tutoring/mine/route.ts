import {accountIdentity, accountJson} from "../../../../lib/account-auth";
import {listOwnAds} from "../../../../lib/tutoring-store";
import {tutoringFailure} from "../../../../lib/tutoring-http";
export async function GET(request: Request) {
  try { const user = await accountIdentity(request); if (!user || user.deleting) return accountJson({error: "Autentificare necesară."}, 401); return accountJson({ads: await listOwnAds(user.id)}); }
  catch (e) { return tutoringFailure(e); }
}
