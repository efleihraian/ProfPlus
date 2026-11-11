// P-199 — pașii reali ai unei generări (P-198), pentru aplicația mobilă: același format ca pe site.
// Copia părții de client din web/lib/chat-progress.ts (care rămâne fără importuri, fiindcă testele serverului o încarcă singură);
// tests/mobile-chat-progress.mjs verifică să citească fluxul la fel și să aibă aceleași etichete ca site-ul.
export type ChatStage = "sources" | "writing" | "checking" | "saving";
export const CHAT_STAGES: ChatStage[] = ["sources", "writing", "checking", "saving"];
export type ChatEvent = {type: "stage"; stage: ChatStage} | {type: "ping"} | {type: "result"; status: number; body: unknown};

/** Pașii afișați: „prepare” e pasul clientului (pregătirea și salvarea cererii), restul vin de la server. */
export type ProgressStage = "prepare" | ChatStage;
export const PROGRESS_STEPS: {id: ProgressStage; label: string}[] = [
  {id: "prepare", label: "Pregătesc și salvez cererea"},
  {id: "sources", label: "Caut în manuale și în documentele tale"},
  {id: "writing", label: "Scriu răspunsul"},
  {id: "checking", label: "Verific și corectez"},
  {id: "saving", label: "Salvez în conversație"},
];
export const elapsed = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
};

/** Citește răspunsul /api/chat (flux NDJSON sau JSON simplu) și raportează pașii pe măsură ce sosesc. */
export async function readChatResponse<T>(response: Response, onStage: (stage: ChatStage) => void): Promise<{ok: boolean; status: number; data: T; streamed: boolean}> {
  if (!response.headers.get("content-type")?.includes("application/x-ndjson") || !response.body) {
    const data = (await response.json().catch(() => ({error: "Răspunsul nu a putut fi citit. Încearcă din nou."}))) as T;
    return {ok: response.ok, status: response.status, data, streamed: false};
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const handle = (line: string): {status: number; data: T} | null => {
    if (!line.trim()) return null;
    let event: ChatEvent;
    try { event = JSON.parse(line); } catch { return null; }
    if (event.type === "stage" && CHAT_STAGES.includes(event.stage)) onStage(event.stage);
    return event.type === "result" ? {status: event.status, data: event.body as T} : null;
  };
  for (;;) {
    const {value, done} = await reader.read();
    buffer += decoder.decode(value, {stream: !done});
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const result = handle(line);
      if (result) { void reader.cancel().catch(() => {}); return {ok: result.status >= 200 && result.status < 300, ...result, streamed: true}; }
    }
    if (done) {
      const result = handle(buffer);
      if (result) return {ok: result.status >= 200 && result.status < 300, ...result, streamed: true};
      throw new Error("Conexiunea s-a întrerupt înainte de răspuns. Reîncearcă: dacă răspunsul a fost salvat, îl recuperăm.");
    }
  }
}
