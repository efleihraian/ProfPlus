/** Server-only: preia periodic sursele RSS și publică idempotent știrile noi în lista completă (poziția 4). */
import {adminWrite} from "./admin-store";
import {NEWS_SOURCES, feedArticle, isEducationNews, parseFeed, type NewsSource} from "./news-feed";
import {validNews, type NewsArticle} from "./news";

const INTERVAL = 30 * 60 * 1000, MAX_BYTES = 2 * 1024 * 1024, MAX_AGE = 14 * 86400000;
let lastRun = 0, running: Promise<IngestResult> | null = null;
export type IngestResult = {sources: {id: string; ok: boolean; items: number}[]; candidates: number};

async function readFeed(source: NewsSource, signal: AbortSignal): Promise<string> {
  const response = await fetch(source.url, {headers: {"User-Agent": "ProfPlusNewsBot/1.0 (RSS reader for teachers; title, short excerpt and link only)", Accept: "application/rss+xml, application/xml, text/xml"}, redirect: "follow", signal});
  if (!response.ok || !response.body) throw new Error("FEED_" + response.status);
  const reader = response.body.getReader(), chunks: Uint8Array[] = []; let size = 0;
  for (;;) { const {done, value} = await reader.read(); if (done) break; size += value.byteLength; if (size > MAX_BYTES) { await reader.cancel(); throw new Error("FEED_TOO_LARGE"); } chunks.push(value); }
  const all = new Uint8Array(size); let offset = 0; for (const c of chunks) { all.set(c, offset); offset += c.byteLength; }
  return new TextDecoder().decode(all);
}
export async function collectNews(now = Date.now(), fetchFeed: typeof readFeed = readFeed): Promise<{articles: NewsArticle[]; sources: IngestResult["sources"]}> {
  const results = await Promise.all(NEWS_SOURCES.map(async source => {
    try {
      const items = parseFeed(await fetchFeed(source, AbortSignal.timeout(10000))).filter(i => now - Date.parse(i.date) <= MAX_AGE && Date.parse(i.date) <= now + 3600000 && isEducationNews(i, source.official));
      return {source, articles: (await Promise.all(items.map(feedArticle))).filter(validNews)};
    } catch { return {source, articles: [] as NewsArticle[], failed: true}; }
  }));
  const seen = new Set<string>(), articles: NewsArticle[] = [];
  for (const r of results) for (const a of r.articles) if (!seen.has(a.id)) { seen.add(a.id); articles.push({...a, published_at: new Date(Math.min(Date.parse(a.published_at!), now)).toISOString()}); }
  return {articles, sources: results.map(r => ({id: r.source.id, ok: !("failed" in r), items: r.articles.length}))};
}
/** Inserare idempotentă: id-ul derivat din link împiedică dublurile; știrile existente (inclusiv arhivate de editor) nu sunt rescrise. */
export async function ingestNews(now = Date.now()): Promise<IngestResult> {
  const {articles, sources} = await collectNews(now);
  if (articles.length) await adminWrite("profplus_news?on_conflict=id", {method: "POST", headers: {Prefer: "resolution=ignore-duplicates,return=minimal"}, body: JSON.stringify(articles.map(({id, title, summary, body, category, image_url, source_url, slot, status, published_at, revision}) => ({id, title, summary, body, category, image_url, source_url, slot, status, published_at, revision})))});
  lastRun = now;
  return {sources, candidates: articles.length};
}
/** Declanșare la cerere, cel mult o dată la 30 de minute pe instanță; nu blochează răspunsul. */
export function maybeIngest(waitUntil?: (p: Promise<unknown>) => void) {
  if (running || Date.now() - lastRun < INTERVAL) return;
  lastRun = Date.now();
  running = ingestNews().catch(() => ({sources: [], candidates: 0})).finally(() => { running = null; });
  waitUntil?.(running);
}
