"use client";
import type {ChatDocument} from "../lib/document-store";

export const LIBRARY_ACCEPT = ".pdf,.doc,.docx,.pptx,.txt,.md,.html";
export const LIBRARY_PROMPT_KEY = "profplus-library-prompt";
export type LibraryState = {documents: ChatDocument[]; limit: number};

async function read<T>(response: Response, fallback: string): Promise<T> {
  let data: T & {error?: string};
  try { data = await response.json() as T & {error?: string}; } catch { throw new Error(fallback); }
  if (!response.ok) throw new Error(data.error || fallback);
  return data;
}
export async function listPersonalLibrary(signal?: AbortSignal): Promise<LibraryState> {
  return read<LibraryState>(await fetch("/api/library/personal", {cache: "no-store", signal}), "Biblioteca personală nu a putut fi încărcată.");
}
export async function uploadToPersonalLibrary(file: File, signal?: AbortSignal): Promise<ChatDocument> {
  if (!file.size || file.size > 10 * 1024 * 1024) throw new Error("Alege documente nevide de cel mult 10 MB fiecare.");
  const form = new FormData(); form.append("file", file); form.append("scope", "library");
  const data = await read<{document?: ChatDocument}>(await fetch("/api/documents", {method: "POST", body: form, signal}), "Încărcarea a eșuat.");
  if (!data.document) throw new Error("Încărcarea a eșuat.");
  return data.document;
}
export async function removeFromPersonalLibrary(id: string): Promise<void> {
  await read(await fetch("/api/documents/" + encodeURIComponent(id), {method: "DELETE"}), "Ștergerea a eșuat.");
}
export const statusLabel = (status: string) => status === "ready" ? "Gata · folosit de Plusi" : status === "indexing" ? "Se pregătește…" : status === "uploading" ? "Se încarcă…" : status === "deleting" ? "Se șterge…" : "Eroare · șterge și reîncarcă";
export const busyStatus = (status: string) => ["uploading", "indexing", "deleting"].includes(status);
/** Prima deschidere a asistentului: întrebarea apare o singură dată în acest browser (cheie ștearsă la delogare). */
export function promptAnswered(): boolean { try { return localStorage.getItem(LIBRARY_PROMPT_KEY) === "done"; } catch { return true; } }
export function markPromptAnswered() { try { localStorage.setItem(LIBRARY_PROMPT_KEY, "done"); } catch { /* fără stocare: întrebarea poate reapărea */ } }
