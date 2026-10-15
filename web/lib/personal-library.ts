/**
 * Biblioteca personală: documentele contului care nu aparțin unei conversații.
 * Folosește tabelul și operațiile existente `documents`; identificatorul de grup este derivat
 * din contul verificat pe server, nu este primit de la client și nu este o conversație afișată.
 */
export const PERSONAL_LIBRARY_LIMIT = 10;
const PREFIX = "profplus:personal-library:v1:";

/** UUID determinist (format v8) pentru grupul de documente al bibliotecii personale. */
export async function personalLibraryId(user: string): Promise<string> {
  if (!user) throw new Error("INVALID_USER");
  return derivedGroupId(PREFIX + user);
}

/** UUID determinist pentru un grup intern al contului (bibliotecă, documente sau jurnal de clasă). */
export async function derivedGroupId(label: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(label))).slice(0, 16);
  digest[6] = (digest[6] & 0x0f) | 0x80; // versiunea 8: identificator definit de aplicație
  digest[8] = (digest[8] & 0x3f) | 0x80; // varianta RFC 9562
  const hex = [...digest].map(b => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Elimină grupul bibliotecii din lista de conversații returnată clientului. */
export function withoutPersonalLibrary<T extends {id: unknown}>(chats: T[], libraryId: string): T[] {
  return chats.filter(chat => chat.id !== libraryId);
}
