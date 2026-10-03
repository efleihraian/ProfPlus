import { env } from "cloudflare:workers";
import { collectionIds } from "../../../../lib/rag";
export async function GET() {
  const config = env as unknown as { OPENAI_API_KEY?: string; OPENAI_VECTOR_STORE_ID?: string };
  if (!config.OPENAI_API_KEY || !config.OPENAI_VECTOR_STORE_ID) return Response.json({ available: false }, { status: 503 });
  try {
    let after = "", indexed = 0, processing = 0;
    const signal = AbortSignal.timeout(10000);
    do {
      const params = new URLSearchParams({ limit: "100" });
      if (after) params.set("after", after);
      const response = await fetch(`https://api.openai.com/v1/vector_stores/${encodeURIComponent(config.OPENAI_VECTOR_STORE_ID)}/files?${params}`, { headers: { Authorization: `Bearer ${config.OPENAI_API_KEY}` }, signal });
      if (!response.ok) return Response.json({ available: false }, { status: 503 });
      const data = await response.json() as { data: { status: string; attributes?: { uid?: string } }[]; has_more: boolean; last_id: string };
      for (const file of data.data) if (file.attributes?.uid && collectionIds.includes(file.attributes.uid)) {
        if (file.status === "completed") indexed++;
        if (file.status === "in_progress") processing++;
      }
      after = data.has_more ? data.last_id : "";
    } while (after);
    return Response.json({ available: true, indexed, processing, catalogTotal: collectionIds.length }, { headers: { "Cache-Control": "private, max-age=30" } });
  } catch { return Response.json({ available: false }, { status: 503 }); }
}
