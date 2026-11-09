// Formatul jurnalelor ProfPlus, comun serverului (web/lib/log.ts) și aplicației mobile (mobile/src/lib/log.ts).
// Un jurnal spune ce a eșuat și de ce, nu ce a scris utilizatorul: fără conținutul mesajelor sau al documentelor,
// fără parole, tokenuri, chei sau adrese de email. Fișierul nu importă nimic.

export type LogLevel = "info" | "warn" | "error";
export type LogFields = Record<string, string | number | boolean | null | undefined>;

// Tot ce seamănă cu un secret sau cu o adresă este înlocuit înainte de scriere.
const PATTERNS: [RegExp, string][] = [
  [/Bearer\s+[\w.~+/=-]+/gi, "Bearer [ascuns]"],
  [/\beyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[jwt]"],
  [/\b(?:sk|rk|sb_secret|sb_publishable|pk|whsec)[-_][\w-]{8,}/g, "[cheie]"],
  [/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, "[email]"],
  [/([?&#](?:token|code|key|apikey|access_token|refresh_token|password)=)[^&\s]+/gi, "$1[ascuns]"],
];

export function redact(text: string, max = 300) {
  let out = text;
  for (const [pattern, replacement] of PATTERNS) out = out.replace(pattern, replacement);
  return out.length > max ? out.slice(0, max) + "…" : out;
}

// Câmpurile cu aceste nume nu se scriu niciodată, chiar dacă un apel le trimite din greșeală.
const BLOCKED = /pass|token|secret|cookie|authorization|email|content|prompt|body|text|message/i;
// Identificatorii (conversații, documente) devin :id; jurnalul păstrează ruta, nu cine a deschis ce.
export const safePath = (path: string) =>
  path.split("?")[0].replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ":id");

/** Tipul erorii, mesajul tehnic (fără secrete) și primele cadre din stivă: de ce a eșuat. */
export function errorFields(error: unknown): LogFields {
  if (error instanceof Error) {
    const status = (error as {status?: unknown}).status;
    return {
      errorName: error.name,
      errorMessage: redact(error.message),
      errorStatus: typeof status === "number" ? status : undefined,
      errorAt: error.stack ? redact(error.stack.split("\n").slice(1, 3).map((l) => l.trim()).join(" | "), 240) : undefined,
    };
  }
  return {errorName: typeof error, errorMessage: redact(String(error))};
}

/** O linie JSON: nivel, eveniment, câmpurile permise și, la nevoie, cauza erorii. */
export function formatLog(level: LogLevel, event: string, fields: LogFields = {}, error?: unknown) {
  const entry: Record<string, string | number | boolean | null> = {level, event};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || BLOCKED.test(key)) continue;
    entry[key] = typeof value === "string" ? redact(value, 200) : value;
  }
  if (error !== undefined) for (const [key, value] of Object.entries(errorFields(error))) if (value !== undefined) entry[key] = value;
  return JSON.stringify(entry);
}
