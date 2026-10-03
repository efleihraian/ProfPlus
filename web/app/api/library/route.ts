import { env } from "cloudflare:workers";
import { json, refreshDocument, userId } from "../../../lib/document-store";
import { documentLibrary, manualLibrary, manualStates, userDocuments } from "../../../lib/library";
export async function GET(request: Request) {
  const config = env as unknown as { OPENAI_API_KEY?: string; OPENAI_VECTOR_STORE_ID?: string };
  const warnings: string[] = []; let states: Record<string, string> = {}, documents = [] as Awaited<ReturnType<typeof userDocuments>>;
  try { if (config.OPENAI_API_KEY && config.OPENAI_VECTOR_STORE_ID) states = await manualStates(config.OPENAI_API_KEY, config.OPENAI_VECTOR_STORE_ID); else warnings.push("Starea indexării manualelor nu este disponibilă."); }
  catch { warnings.push("Starea indexării manualelor nu a putut fi verificată. Reîncearcă."); }
  const user = userId(request);
  if (user) {
    try { documents = await Promise.all((await userDocuments(user)).map(refreshDocument)); }
    catch { warnings.push("Documentele încărcate nu au putut fi citite. Reîncearcă."); }
  }
  return json({ items: [...manualLibrary(states), ...documentLibrary(documents)], warnings });
}
