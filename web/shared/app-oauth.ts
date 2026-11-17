export const APP_OAUTH_PATH = "/auth/app/google";
export const APP_OAUTH_REDIRECT = "profplus://auth/callback";
const CHALLENGE = /^[A-Za-z0-9_-]{43,128}$/;

type Flow = { redirectTo: string; challenge: string };

function validFlow(redirectTo: string | null, challenge: string | null, method: string | null): Flow | null {
  if (redirectTo !== APP_OAUTH_REDIRECT || !challenge || !CHALLENGE.test(challenge)) return null;
  if ((method || "").toLowerCase() !== "s256") return null;
  return { redirectTo, challenge };
}

export function appOAuthEntry(site: string, authorizeUrl: string): string | null {
  let source: URL, base: URL;
  try { source = new URL(authorizeUrl); base = new URL(site); } catch { return null; }
  if (base.protocol !== "https:" || source.searchParams.get("provider") !== "google") return null;
  const flow = validFlow(source.searchParams.get("redirect_to"), source.searchParams.get("code_challenge"), source.searchParams.get("code_challenge_method"));
  if (!flow) return null;
  const entry = new URL(APP_OAUTH_PATH, base.origin);
  entry.searchParams.set("code_challenge", flow.challenge);
  entry.searchParams.set("code_challenge_method", "s256");
  return entry.toString();
}

export function appOAuthTarget(supabaseUrl: string, params: URLSearchParams): string | null {
  let base: URL;
  try { base = new URL(supabaseUrl); } catch { return null; }
  const local = base.protocol === "http:" && ["localhost", "127.0.0.1"].includes(base.hostname);
  if (base.protocol !== "https:" && !local) return null;
  const flow = validFlow(APP_OAUTH_REDIRECT, params.get("code_challenge"), params.get("code_challenge_method"));
  if (!flow) return null;
  const target = new URL("/auth/v1/authorize", base.origin);
  target.searchParams.set("provider", "google");
  target.searchParams.set("redirect_to", flow.redirectTo);
  target.searchParams.set("code_challenge", flow.challenge);
  target.searchParams.set("code_challenge_method", "s256");
  return target.toString();
}
