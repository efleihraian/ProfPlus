/**
 * P-082: flux automat de știri din surse RSS publice despre educație.
 * Se păstrează doar titlul, un extras scurt (≤ 280 caractere), data și linkul către sursă:
 * fără text integral, imagini sau date personale. Clasificarea și recomandarea sunt reguli
 * deterministe, verificabile, fără apeluri AI.
 */
import type {NewsArticle} from "./news";
import type {Stage, TeachingProfile} from "./teaching-profile";

export type NewsSource = {id: string; name: string; url: string; official?: boolean};
export const NEWS_SOURCES: NewsSource[] = [
  {id: "edu", name: "Ministerul Educației", url: "https://www.edu.ro/rss.xml", official: true},
  {id: "edupedu", name: "Edupedu.ro", url: "https://www.edupedu.ro/feed/"},
  {id: "digi24", name: "Digi24 · Educație", url: "https://www.digi24.ro/rss/stiri/actualitate/educatie"},
  {id: "educatieprivata", name: "Educație Privată", url: "https://www.educatieprivata.ro/feed/"},
];
export type FeedItem = {title: string; link: string; date: string; description: string};

const ENTITIES: Record<string, string> = {amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "„", bdquo: "„"};
export function decodeText(value: string): string {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]*>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
    .replace(/https?:\/\/\S+\.(?:jpe?g|png|webp|gif)\b/gi, " ").replace(/\s+/g, " ").trim();
}
const tag = (block: string, name: string) => block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"))?.[1] ?? "";
/** Parser RSS minimal, fără DOM (rulează în Worker). Ignoră itemii fără titlu, link https sau dată validă. */
export function parseFeed(xml: string, limit = 60): FeedItem[] {
  const items: FeedItem[] = [];
  for (const match of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)) {
    const block = match[0], title = decodeText(tag(block, "title")).slice(0, 200), link = decodeText(tag(block, "link")), date = Date.parse(decodeText(tag(block, "pubDate")) || decodeText(tag(block, "dc:date")));
    if (!title || !Number.isFinite(date) || !/^https:\/\/[^\s]+$/.test(link)) continue;
    items.push({title, link: cleanLink(link), date: new Date(date).toISOString(), description: decodeText(tag(block, "description"))});
    if (items.length >= limit) break;
  }
  return items;
}
export function cleanLink(link: string): string {
  try { const u = new URL(link); for (const key of [...u.searchParams.keys()]) if (/^utm_|^fbclid$|^gclid$/i.test(key)) u.searchParams.delete(key); u.hash = ""; return u.toString().slice(0, 2048); } catch { return link; }
}
export function excerpt(text: string, title: string, max = 280): string {
  let t = text.replace(/\s*The post .*$/i, "").replace(/\s*Articolul .* a apărut prima dată pe .*$/i, "").trim();
  if (!t || t.toLowerCase() === title.toLowerCase()) return title.slice(0, max);
  if (t.toLowerCase().startsWith(title.toLowerCase())) t = t.slice(title.length).replace(/^[\s.:–-]+/, "") || title;
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1), space = cut.lastIndexOf(" ");
  return (space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:–-]+$/, "") + "…";
}

export const norm = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const has = (text: string, words: (string | RegExp)[]) => words.filter(w => typeof w === "string" ? text.includes(w) : w.test(text));
const SCHOOL = ["profesor", "elev", "scoal", "scoli", "liceu", "licee", "gimnazi", "bacalaureat", "evaluarea nationala", "evaluare nationala", "olimpiad", "ministerul educatiei", "ministrul educatiei", "inspectorat", "manual", "titularizare", "definitivat", "cadre didactice", "cadrelor didactice", "an scolar", "anul scolar", "invatamant", "invatator", "gradinit", "prescolar", "director", "catedr", "programa", "curriculum", "clasa a ", "clasele ", "examen", "vacant", "burs", "sindicat"];
const NOT_SCHOOL = ["rezident", "medic specialist", "spital", "facultatea de medicina"];
/** Doar știrile despre profesori, elevi și școală intră în flux. Sursa oficială este acceptată integral. */
export function isEducationNews(item: Pick<FeedItem, "title" | "description">, official = false): boolean {
  const text = norm(item.title + " " + item.description);
  if (official) return true;
  const school = has(text, SCHOOL).length;
  return school > 0 && (has(norm(item.title), NOT_SCHOOL).length === 0 || school >= 3);
}
export function newsCategory(text: string): string {
  const t = norm(text);
  if (has(t, ["bacalaureat", "evaluarea nationala", "evaluare nationala", "examen", "olimpiad", "concurs", "titularizare", "definitivat", "simulare"]).length) return "Examene";
  if (has(t, ["ordin", "lege", "hotarare", "metodologi", "ordonant", "proiect de act", "ministrul", "guvern", "salari", "buget"]).length) return "Legislație";
  if (has(t, ["manual", "resurs", "ghid", "platform", "curs ", "cursuri", "programa", "curriculum"]).length) return "Resurse";
  if (has(t, ["conferint", "festival", "eveniment", "inscrier", "program "]).length) return "Evenimente";
  return "Altele";
}

/** Identificator determinist: aceeași sursă nu se publică de două ori. Versiunea 8 marchează știrile automate. */
export async function feedNewsId(link: string): Promise<string> {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("profplus:news:v1:" + cleanLink(link)))).slice(0, 16);
  d[6] = (d[6] & 0x0f) | 0x80; d[8] = (d[8] & 0x3f) | 0x80;
  const h = [...d].map(b => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
export const isAutoNews = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-/i.test(id);
export const sourceName = (url: string) => { try { const host = new URL(url).hostname.replace(/^www\./, ""); return NEWS_SOURCES.find(s => new URL(s.url).hostname.replace(/^www\./, "") === host)?.name || host; } catch { return ""; } };
export async function feedArticle(item: FeedItem): Promise<NewsArticle> {
  return {id: await feedNewsId(item.link), title: item.title, summary: excerpt(item.description, item.title), body: "", category: newsCategory(item.title + " " + item.description), image_url: "", source_url: item.link, slot: 4, status: "published", published_at: item.date, revision: 1};
}

// Recomandări: „cele mai importante” pentru toți și „te afectează” după profilul didactic.
const IMPORTANT: [string | RegExp, number][] = [[/salari|salarial/, 5], [/mariri?|majorar|crester/, 2], [/grev|protest/, 4], [/spor|prima de|prime |bonus|indemniza/, 2], [/titularizare|definitivat|grade didactice|gradatii? de merit/, 3], [/evaluarea nationala|evaluare nationala|bacalaureat/, 2], [/structura anului scolar|calendar(ul)? scolar|vacant/, 2], [/ordin|lege |legea |hotarare|ministrul/, 1], [/norma didactica|ore pe saptamana|plan(uri)?-cadru/, 3], [/urgent|oficial|anunt/, 1]];
const STAGE_WORDS: Record<Stage, RegExp> = {
  primary: /invatamant(ul)? primar|clasa pregatitoare|clasele? (a )?(i|ii|iii|iv)\b|clasele i-iv|invatator/,
  middle: /gimnazi|evaluarea nationala|evaluare nationala|clasa a (v|vi|vii|viii)-a|clasele (a )?v-viii|clasa a viii/,
  high: /liceu|licee|bacalaureat|clasa a (ix|x|xi|xii)-a|clasele (a )?ix-xii/,
};
const STOP = new Set(["limba", "literatura", "si", "comunicare", "moderna", "educatie", "educatia", "pentru", "tehnologia", "informatiei", "comunicatiei", "religie", "cultura", "stiinte"]);
export function subjectStems(subject: string): string[] {
  const key = norm(subject);
  // „română” ar potrivi „România” în orice știre: se caută expresiile disciplinei.
  if (/\bromana\b/.test(key)) return ["limba romana", "literatura romana", "limba si literatura romana"];
  const words = key.split(/[^a-z]+/).filter(w => w.length >= 5 && !STOP.has(w));
  return [...new Set(words.map(w => w.slice(0, Math.max(5, w.length - 2))))];
}
export type NewsScore = {score: number; important: boolean; reasons: string[]; topic: number};
export function scoreNews(article: Pick<NewsArticle, "title" | "summary" | "published_at">, profile: TeachingProfile | null, now = Date.now()): NewsScore {
  const text = norm(article.title + " " + article.title + " " + article.summary);
  const matched = IMPORTANT.map(([w]) => typeof w === "string" ? text.includes(w) : w.test(text));
  const importance = Math.min(10, IMPORTANT.reduce((sum, [, p], i) => sum + (matched[i] ? p : 0), 0));
  // Subiectul dominant (ex. salarii) evită ca Acasă să fie ocupată de aceeași temă.
  const topic = IMPORTANT.reduce((best, [, p], i) => matched[i] && (best < 0 || p > IMPORTANT[best][1]) ? i : best, -1);
  const reasons: string[] = []; let relevance = 0;
  if (profile) {
    const subject = profile.subject && subjectStems(profile.subject).some(s => text.includes(s));
    const stages = profile.stages.filter(s => STAGE_WORDS[s].test(text));
    if (subject) { relevance += 4; reasons.push(profile.subject); }
    if (stages.length) { relevance += 3; reasons.push(stages.map(s => s === "primary" ? "primar" : s === "middle" ? "gimnaziu" : "liceu").join(", ")); }
    if (subject && /olimpiad|concurs/.test(text)) relevance += 4;
    if (subject && stages.length) relevance += 2;
  }
  const ageDays = Math.max(0, (now - Date.parse(article.published_at || "")) / 86400000) || 0;
  return {score: importance + relevance - ageDays * 0.35, important: importance >= 5, reasons, topic};
}
export type RankedNews = NewsArticle & {reason?: string};
/** Alege știrea principală și cele trei secundare: fixările recente ale editorului rămân, restul după scor. */
export function homeSelection(pinned: NewsArticle[], candidates: NewsArticle[], profile: TeachingProfile | null, now = Date.now()): RankedNews[] {
  const fresh = (n: NewsArticle) => now - Date.parse(n.published_at || "") <= 14 * 86400000;
  const slots: (RankedNews | undefined)[] = [0, 1, 2, 3].map(slot => pinned.find(n => n.slot === slot && fresh(n)));
  const used = new Set(slots.filter(Boolean).map(n => n!.id));
  const ranked = candidates.filter(n => !used.has(n.id) && now - Date.parse(n.published_at || "") <= 21 * 86400000)
    .map(n => ({n, s: scoreNews(n, profile, now)})).sort((a, b) => b.s.score - a.s.score);
  const topics = new Map<number, number>(), hosts = new Map<string, number>();
  const host = (n: NewsArticle) => { try { return new URL(n.source_url).hostname; } catch { return ""; } };
  for (const n of slots) if (n) { const t = scoreNews(n, profile, now).topic; if (t >= 0) topics.set(t, (topics.get(t) || 0) + 1); }
  for (let slot = 0; slot < 4; slot++) {
    if (slots[slot]) continue;
    // Alegere lacomă cu penalizare pentru o temă deja prezentă (diversitate pe Acasă).
    const adjusted = (r: typeof ranked[number]) => r.s.score - (r.s.topic >= 0 ? (topics.get(r.s.topic) || 0) * 5 : 0) - (hosts.get(host(r.n)) || 0) * 0.75;
    let best = -1; ranked.forEach((r, i) => { if (best < 0 || adjusted(r) > adjusted(ranked[best])) best = i; });
    if (best < 0) break;
    const [next] = ranked.splice(best, 1);
    if (next.s.topic >= 0) topics.set(next.s.topic, (topics.get(next.s.topic) || 0) + 1);
    if (host(next.n)) hosts.set(host(next.n), (hosts.get(host(next.n)) || 0) + 1);
    const reason = next.s.reasons.length ? "Pentru tine: " + next.s.reasons.join(" · ") : next.s.important ? "Important" : undefined;
    slots[slot] = {...next.n, slot, ...(reason ? {reason} : {})};
  }
  return slots.filter((n): n is RankedNews => !!n);
}
