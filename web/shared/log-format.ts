export type LogLevel = "info" | "warn" | "error";
export type LogFields = Record<string, string | number | boolean | null | undefined>;

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

const BLOCKED = /pass|token|secret|cookie|authorization|email|content|prompt|body|text|message/i;
export const safePath = (path: string) =>
  path.split("?")[0].replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ":id");

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

export function formatLog(level: LogLevel, event: string, fields: LogFields = {}, error?: unknown) {
  const entry: Record<string, string | number | boolean | null> = {level, event};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || BLOCKED.test(key)) continue;
    entry[key] = typeof value === "string" ? redact(value, 200) : value;
  }
  if (error !== undefined) for (const [key, value] of Object.entries(errorFields(error))) if (value !== undefined) entry[key] = value;
  return JSON.stringify(entry);
}
