import {accountJson} from "./account-auth";
import {TutoringError} from "./tutoring-store";
/** Corp JSON limitat; răspuns uniform pentru erorile de anunțuri. */
export async function readJson(request: Request, max = 8000): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new TutoringError(415, "Cerere invalidă.");
  const raw = await request.text(); if (raw.length > max) throw new TutoringError(413, "Cerere prea mare.");
  try { return JSON.parse(raw); } catch { throw new TutoringError(400, "Cerere invalidă."); }
}
export function tutoringFailure(e: unknown) {
  return e instanceof TutoringError ? accountJson({error: e.message}, e.status) : accountJson({error: "Anunțurile nu sunt disponibile momentan. Reîncearcă."}, 503);
}
