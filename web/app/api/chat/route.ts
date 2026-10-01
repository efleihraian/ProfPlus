import { env } from "cloudflare:workers";
type Message = { role: "user" | "assistant"; content: string };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "Origine nepermisă." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return json({ error: "Trimite un mesaj valid." }, 415);
  let body: { messages?: unknown };
  try { const text = await request.text(); if (text.length > 65000) return json({ error: "Conversația este prea lungă. Începe una nouă." }, 413); body = JSON.parse(text); }
  catch { return json({ error: "Mesaj invalid." }, 400); }
  const messages = body?.messages;
  if (!Array.isArray(messages) || !messages.length || messages.length > 80 || messages.some((m: unknown) => !m || typeof m !== "object" || !("role" in m) || !("content" in m) || !["user", "assistant"].includes(String(m.role)) || typeof m.content !== "string" || !m.content.trim() || m.content.length > 6000) || messages.at(-1)?.role !== "user") return json({ error: "Mesaj invalid sau conversație prea lungă. Începe una nouă." }, 400);
  const config = env as unknown as { OPENAI_API_KEY?: string; OPENAI_MODEL?: string };
  if (!config.OPENAI_API_KEY) return json({ error: "Conexiunea AI nu este configurată încă." }, 503);
  const abort = new AbortController(); const timeout = setTimeout(() => abort.abort(), 45000);
  const onAbort = () => abort.abort(); request.signal.addEventListener("abort", onAbort, { once: true });
  try {
    const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "Authorization": `Bearer ${config.OPENAI_API_KEY}`, "Content-Type": "application/json" }, signal: abort.signal, body: JSON.stringify({ model: config.OPENAI_MODEL || "gpt-4.1-mini", instructions: "Ești asistentul ProfOS. Răspunde clar, util și în limba utilizatorului. Nu pretinde că ai acces la documente, internet sau instrumente. Dacă nu știi, spune asta.", input: (messages as Message[]).slice(-20), max_output_tokens: 1500, store: false }) });
    if (!response.ok) { const status = response.status; return json({ error: status === 429 ? "Serviciul AI a atins o limită. Încearcă mai târziu." : status === 401 || status === 403 ? "Conexiunea AI necesită verificarea configurării." : "Serviciul AI este temporar indisponibil. Încearcă din nou." }, status === 429 ? 429 : 502); }
    const data = await response.json() as { status?: string; output?: { type: string; content?: { type: string; text?: string }[] }[] };
    const reply = data.output?.filter(item => item.type === "message").flatMap(item => item.content || []).filter(part => part.type === "output_text").map(part => part.text || "").join("\n");
    if (!reply || data.status !== "completed") return json({ error: "Răspunsul nu a putut fi finalizat. Încearcă din nou sau scurtează întrebarea." }, 502);
    return json({ reply });
  } catch { return json({ error: abort.signal.aborted ? "Răspunsul a durat prea mult sau a fost oprit. Reîncearcă." : "Conexiunea cu AI a eșuat. Încearcă din nou." }, 504); }
  finally { clearTimeout(timeout); request.signal.removeEventListener("abort", onAbort); }
}
