/**
 * P-210: partajarea materialelor din biblioteca personală cu toți utilizatorii ProfPlus, cu acordul profesorului
 * și după verificarea unui administrator. Modul pur, folosit de site, aplicație și server.
 */
/** Versiunea textului de acord. Se schimbă când se schimbă textul; rândul păstrează versiunea acceptată. */
export const SHARING_CONSENT_VERSION = "2026-11-10";
export type SharingStatus = "pending" | "approved" | "rejected";
export type DocumentSharing = {status: SharingStatus; note?: string};
/** Textul acordului, afișat înainte de confirmare (site și aplicație). */
export const SHARING_CONSENT_POINTS = [
  "Sunt autorul materialului sau am dreptul să îl partajez (de exemplu, nu este o culegere sau un manual publicat de altcineva, fără acordul acestuia).",
  "Materialul nu conține date personale ale elevilor sau ale altor persoane (nume, note, situații, fotografii).",
  "După verificarea unui administrator ProfPlus, Profi poate folosi conținutul în răspunsurile și documentele generate pentru toți utilizatorii. Numele meu nu este afișat, iar originalul nu se oferă altora spre descărcare.",
  "Pot retrage acordul oricând din biblioteca personală; din acel moment materialul nu mai este folosit pentru alții. Ștergerea documentului sau a contului retrage și ea acordul.",
] as const;
export const SHARING_CONSENT_TITLE = "Partajezi materialul cu toți profesorii ProfPlus?";

export function sharingLabel(sharing: DocumentSharing | undefined): string {
  if (!sharing) return "";
  if (sharing.status === "pending") return "Partajat · în verificare";
  if (sharing.status === "approved") return "Partajat · folosit de Profi pentru toți";
  return "Partajare respinsă" + (sharing.note ? ": " + sharing.note : "");
}
/** Poate fi propus un document gata indexat, care nu este deja în verificare sau aprobat. */
export const canShare = (status: string, sharing: DocumentSharing | undefined) => status === "ready" && (!sharing || sharing.status === "rejected");
export const canWithdraw = (sharing: DocumentSharing | undefined) => !!sharing && sharing.status !== "rejected";

/** Validarea deciziei administratorului (ruta de administrare); motivul este text simplu, maximum 500 de caractere. */
export function reviewDecision(body: unknown): {id: string; decision: "approved" | "rejected"; note: string; revision: number} | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (Object.keys(b).some(k => !["id", "decision", "note", "revision"].includes(k))) return null;
  if (typeof b.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(b.id)) return null;
  if (b.decision !== "approved" && b.decision !== "rejected") return null;
  if (!Number.isInteger(b.revision) || (b.revision as number) < 1) return null;
  const note = b.note === undefined ? "" : b.note;
  if (typeof note !== "string" || note.length > 500) return null;
  return {id: b.id, decision: b.decision, note: note.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "").trim(), revision: b.revision as number};
}
