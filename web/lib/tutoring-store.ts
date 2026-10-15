/** Server-only: anunțuri de meditații în Supabase (PostgREST cu cheia server), filtrate explicit pe user_id. */
import {env} from "cloudflare:workers";
import {AD_DAYS, AUTO_HIDE_REPORTS, MAX_ACTIVE_ADS, type OwnTutoringAd, type TutoringAd, type TutoringInput} from "./tutoring";

type Config = {SUPABASE_URL?: string; SUPABASE_SECRET_KEY?: string; DATA_BACKEND?: string};
export class TutoringError extends Error { constructor(public status: number, message: string, public code = "") { super(message); } }
type Row = {id: string; user_id: string; display_name: string; title: string; subject: string; levels: string[]; formats: string[]; city: string; price: number | null; description: string; contact_email: string; contact_phone: string; status: OwnTutoringAd["status"]; updated_at: string; expires_at: string};
const PUBLIC = "id,display_name,title,subject,levels,formats,city,price,description,updated_at,expires_at";
const OWN = PUBLIC + ",contact_email,contact_phone,status";

export async function tutoringRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const c = env as unknown as Config;
  if (c.DATA_BACKEND !== "supabase" || !c.SUPABASE_URL || !c.SUPABASE_SECRET_KEY) throw new TutoringError(503, "Anunțurile nu sunt disponibile în această configurare.", "NOT_CONFIGURED");
  const url = new URL(c.SUPABASE_URL);
  if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co") || url.username || url.password) throw new TutoringError(503, "Anunțurile nu sunt disponibile momentan.");
  const headers = new Headers(init.headers); headers.set("apikey", c.SUPABASE_SECRET_KEY); headers.set("Content-Type", "application/json");
  const response = await fetch(url.origin + "/rest/v1/" + path, {...init, headers, signal: AbortSignal.timeout(15000)});
  // Tabelul lipsește până la aplicarea migrației P-087.
  if (response.status === 404) throw new TutoringError(503, "Anunțurile de meditații vor fi disponibile în curând.", "NOT_READY");
  if (response.status === 409) throw new TutoringError(409, "Ai raportat deja acest anunț.");
  if (!response.ok) throw new TutoringError(503, "Anunțurile nu sunt disponibile momentan. Reîncearcă.");
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}
const toPublic = (r: Row): TutoringAd => ({id: r.id, displayName: r.display_name, title: r.title, subject: r.subject, levels: r.levels as TutoringAd["levels"], formats: r.formats as TutoringAd["formats"], city: r.city, price: r.price, description: r.description, updatedAt: r.updated_at, expiresAt: r.expires_at});
const toOwn = (r: Row): OwnTutoringAd => ({...toPublic(r), contactEmail: r.contact_email, contactPhone: r.contact_phone, status: r.status});
const toRow = (i: TutoringInput) => ({display_name: i.displayName, title: i.title, subject: i.subject, levels: i.levels, formats: i.formats, city: i.city, price: i.price, description: i.description, contact_email: i.contactEmail, contact_phone: i.contactPhone});
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const like = (v: string) => v.replace(/[%_*,.()"\\]/g, " ").trim();

export type TutoringFilters = {q?: string; subject?: string; level?: string; format?: string; city?: string; page?: number};
export async function listPublicAds(f: TutoringFilters, now = new Date()) {
  const page = f.page || 1, params = new URLSearchParams([["select", PUBLIC], ["status", "eq.published"], ["expires_at", "gt." + now.toISOString()], ["order", "updated_at.desc,id.desc"], ["limit", "21"], ["offset", String((page - 1) * 20)]]);
  if (f.subject && like(f.subject)) params.set("subject", "ilike.*" + like(f.subject) + "*");
  if (f.level) params.set("levels", "cs.{" + f.level + "}");
  if (f.format) params.set("formats", "cs.{" + f.format + "}");
  if (f.city && like(f.city)) params.set("city", "ilike.*" + like(f.city) + "*");
  if (f.q && like(f.q)) params.set("or", `(title.ilike."*${like(f.q)}*",subject.ilike."*${like(f.q)}*",description.ilike."*${like(f.q)}*")`);
  const rows = await tutoringRequest<Row[]>("profplus_tutoring_ads?" + params);
  return {ads: rows.slice(0, 20).map(toPublic), hasMore: rows.length > 20};
}
export async function listOwnAds(user: string) {
  return (await tutoringRequest<Row[]>("profplus_tutoring_ads?" + new URLSearchParams([["select", OWN], ["user_id", "eq." + user], ["order", "updated_at.desc"], ["limit", "20"]]))).map(toOwn);
}
async function ownAd(user: string, id: string) {
  if (!uuid.test(id)) throw new TutoringError(404, "Anunț indisponibil.");
  const rows = await tutoringRequest<Row[]>("profplus_tutoring_ads?" + new URLSearchParams([["select", OWN], ["id", "eq." + id], ["user_id", "eq." + user], ["limit", "1"]]));
  if (!rows[0]) throw new TutoringError(404, "Anunț indisponibil.");
  return rows[0];
}
const expires = (now: Date) => new Date(now.getTime() + AD_DAYS * 86400000).toISOString();
async function activeCount(user: string, now: Date) {
  return (await tutoringRequest<{id: string}[]>("profplus_tutoring_ads?" + new URLSearchParams([["select", "id"], ["user_id", "eq." + user], ["status", "eq.published"], ["expires_at", "gt." + now.toISOString()]]))).length;
}
export async function createAd(user: string, input: TutoringInput, now = new Date()) {
  if (await activeCount(user, now) >= MAX_ACTIVE_ADS) throw new TutoringError(409, `Poți avea cel mult ${MAX_ACTIVE_ADS} anunțuri active. Pune pe pauză sau șterge unul.`);
  const id = crypto.randomUUID();
  await tutoringRequest("profplus_tutoring_ads", {method: "POST", headers: {Prefer: "return=minimal"}, body: JSON.stringify({id, user_id: user, ...toRow(input), status: "published", consent_at: now.toISOString(), created_at: now.toISOString(), updated_at: now.toISOString(), expires_at: expires(now)})});
  return id;
}
export type AdAction = {action: "update"; input: TutoringInput} | {action: "pause" | "publish" | "renew"};
export async function changeAd(user: string, id: string, change: AdAction, now = new Date()) {
  const row = await ownAd(user, id);
  if (row.status === "hidden") throw new TutoringError(409, "Anunțul a fost ascuns după raportări și este în verificare.");
  const live = row.status === "published" && Date.parse(row.expires_at) > now.getTime();
  if ((change.action === "publish" || change.action === "renew") && !live && await activeCount(user, now) >= MAX_ACTIVE_ADS) throw new TutoringError(409, `Poți avea cel mult ${MAX_ACTIVE_ADS} anunțuri active.`);
  const patch = change.action === "update" ? {...toRow(change.input), updated_at: now.toISOString()}
    : change.action === "pause" ? {status: "paused", updated_at: now.toISOString()}
    : {status: "published", updated_at: now.toISOString(), expires_at: expires(now)};
  await tutoringRequest("profplus_tutoring_ads?" + new URLSearchParams([["id", "eq." + id], ["user_id", "eq." + user]]), {method: "PATCH", headers: {Prefer: "return=minimal"}, body: JSON.stringify(patch)});
}
export async function deleteAd(user: string, id: string) {
  await ownAd(user, id);
  await tutoringRequest("profplus_tutoring_ads?" + new URLSearchParams([["id", "eq." + id], ["user_id", "eq." + user]]), {method: "DELETE"});
}
/** Datele de contact se dau numai utilizatorilor conectați și numai pentru anunțuri publicate, active. */
export async function adContact(id: string, now = new Date()) {
  if (!uuid.test(id)) throw new TutoringError(404, "Anunț indisponibil.");
  const rows = await tutoringRequest<Row[]>("profplus_tutoring_ads?" + new URLSearchParams([["select", "contact_email,contact_phone"], ["id", "eq." + id], ["status", "eq.published"], ["expires_at", "gt." + now.toISOString()], ["limit", "1"]]));
  if (!rows[0]) throw new TutoringError(404, "Anunț indisponibil.");
  return {email: rows[0].contact_email, phone: rows[0].contact_phone};
}
export async function reportAd(reporter: string, id: string, reason: string, now = new Date()) {
  if (!uuid.test(id)) throw new TutoringError(404, "Anunț indisponibil.");
  const ad = await tutoringRequest<{user_id: string}[]>("profplus_tutoring_ads?" + new URLSearchParams([["select", "user_id"], ["id", "eq." + id], ["status", "eq.published"], ["limit", "1"]]));
  if (!ad[0]) throw new TutoringError(404, "Anunț indisponibil.");
  if (ad[0].user_id === reporter) throw new TutoringError(400, "Nu îți poți raporta propriul anunț.");
  await tutoringRequest("profplus_tutoring_reports", {method: "POST", headers: {Prefer: "return=minimal"}, body: JSON.stringify({ad_id: id, reporter, reason: reason.slice(0, 300), created_at: now.toISOString()})});
  const count = (await tutoringRequest<{ad_id: string}[]>("profplus_tutoring_reports?" + new URLSearchParams([["select", "ad_id"], ["ad_id", "eq." + id]]))).length;
  // Mai multe raportări independente ascund anunțul până la verificarea administratorului.
  if (count >= AUTO_HIDE_REPORTS) await tutoringRequest("profplus_tutoring_ads?" + new URLSearchParams([["id", "eq." + id], ["status", "eq.published"]]), {method: "PATCH", headers: {Prefer: "return=minimal"}, body: JSON.stringify({status: "hidden"})});
  return {hidden: count >= AUTO_HIDE_REPORTS};
}
/** Administrare: anunțuri raportate sau ascunse; restabilire (șterge raportările) sau ascundere. */
export async function moderationQueue() {
  const reports = await tutoringRequest<{ad_id: string; reason: string; created_at: string}[]>("profplus_tutoring_reports?select=ad_id,reason,created_at&order=created_at.desc&limit=200");
  const ids = [...new Set(reports.map(r => r.ad_id))];
  const hidden = await tutoringRequest<Row[]>("profplus_tutoring_ads?" + new URLSearchParams([["select", OWN], ["status", "eq.hidden"], ["limit", "100"]]));
  const reported = ids.length ? await tutoringRequest<Row[]>("profplus_tutoring_ads?" + new URLSearchParams([["select", OWN], ["id", "in.(" + ids.slice(0, 100).join(",") + ")"]])) : [];
  const all = new Map([...hidden, ...reported].map(r => [r.id, r]));
  return [...all.values()].map(r => ({...toOwn(r), reports: reports.filter(x => x.ad_id === r.id).map(x => x.reason).filter(Boolean)}));
}
export async function moderateAd(id: string, action: "hide" | "restore") {
  if (!uuid.test(id)) throw new TutoringError(404, "Anunț indisponibil.");
  await tutoringRequest("profplus_tutoring_ads?" + new URLSearchParams([["id", "eq." + id]]), {method: "PATCH", headers: {Prefer: "return=minimal"}, body: JSON.stringify({status: action === "hide" ? "hidden" : "published"})});
  if (action === "restore") await tutoringRequest("profplus_tutoring_reports?" + new URLSearchParams([["ad_id", "eq." + id]]), {method: "DELETE"});
}
/** Ștergerea contului: anunțurile și raportările făcute de cont. Tabelul lipsă (migrație neaplicată) nu blochează ștergerea. */
export async function eraseTutoring(user: string) {
  try {
    await tutoringRequest("profplus_tutoring_reports?" + new URLSearchParams([["reporter", "eq." + user]]), {method: "DELETE"});
    await tutoringRequest("profplus_tutoring_ads?" + new URLSearchParams([["user_id", "eq." + user]]), {method: "DELETE"});
  } catch (e) { if (!(e instanceof TutoringError && (e.code === "NOT_READY" || e.code === "NOT_CONFIGURED"))) throw e; }
}
