"use client";
import {useCallback, useEffect, useRef, useState} from "react";
import {FileText, Trash2, Upload, RotateCcw} from "lucide-react";
import type {ChatDocument} from "../lib/document-store";
import {LIBRARY_ACCEPT, busyStatus, listPersonalLibrary, removeFromPersonalLibrary, statusLabel, uploadToPersonalLibrary} from "./personal-library-client";

/** Gestionarea bibliotecii personale: folosită în Cont și în întrebarea de la prima deschidere a asistentului. */
export default function PersonalLibrary({compact = false, disabled = false, onChange, onCount}: {compact?: boolean; disabled?: boolean; onChange?: () => void; onCount?: (count: number) => void}) {
  const [documents, setDocuments] = useState<ChatDocument[] | null>(null);
  const [limit, setLimit] = useState(10);
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const refresh = useCallback(async (signal?: AbortSignal) => {
    const data = await listPersonalLibrary(signal);
    setDocuments(data.documents); setLimit(data.limit); onCount?.(data.documents.length);
    return data.documents;
  }, [onCount]);
  useEffect(() => {
    const abort = new AbortController();
    void Promise.resolve().then(() => refresh(abort.signal)).catch(e => { if (!abort.signal.aborted) setError(e instanceof Error ? e.message : "Biblioteca nu a putut fi încărcată."); });
    return () => abort.abort();
  }, [refresh]);
  useEffect(() => {
    if (!documents?.some(d => busyStatus(d.status))) return;
    const abort = new AbortController();
    const timer = setInterval(() => { void refresh(abort.signal).then(list => { if (!list.some(d => busyStatus(d.status))) onChange?.(); }).catch(() => {}); }, 4000);
    return () => { clearInterval(timer); abort.abort(); };
  }, [documents, refresh, onChange]);
  async function upload(files: FileList | null) {
    if (!files?.length || uploading || disabled) return;
    setError(""); setConfirm("");
    try {
      const incoming = Array.from(files);
      if ((documents?.length || 0) + incoming.length > limit) throw new Error(`Biblioteca personală poate avea cel mult ${limit} documente.`);
      for (const file of incoming) {
        setUploading(file.name);
        const document = await uploadToPersonalLibrary(file);
        setDocuments(previous => [...(previous || []).filter(d => d.id !== document.id), document]);
      }
      await refresh(); onChange?.();
    } catch (e) { setError(e instanceof Error ? e.message : "Încărcarea a eșuat."); void refresh().catch(() => {}); }
    finally { setUploading(""); if (input.current) input.current.value = ""; }
  }
  async function remove(id: string) {
    if (confirm !== id) { setConfirm(id); return; }
    setConfirm(""); setError("");
    try { await removeFromPersonalLibrary(id); setDocuments(previous => (previous || []).filter(d => d.id !== id)); onCount?.((documents?.length || 1) - 1); onChange?.(); }
    catch (e) { setError(e instanceof Error ? e.message : "Ștergerea a eșuat."); }
  }
  const full = (documents?.length || 0) >= limit;
  return <div className={"personal-library" + (compact ? " compact" : "")}>
    {!compact && <p className="account-help">Adaugă aici documentele pe care le folosești des: planificări, modele de teste, fișe sau materiale proprii. Plusi le consultă automat în toate conversațiile, iar în „Alege sursele” le poți include sau exclude pentru o conversație anume. Documentele rămân private, legate de contul tău.</p>}
    <div className="personal-library-actions">
      <input ref={input} type="file" multiple accept={LIBRARY_ACCEPT} hidden onChange={e => void upload(e.target.files)}/>
      <button type="button" className="account-primary personal-library-upload" disabled={disabled || !!uploading || full || documents === null} onClick={() => input.current?.click()}><Upload size={17}/>{uploading ? "Se încarcă…" : "Adaugă documente"}</button>
      <span className="personal-library-count" aria-live="polite">{documents === null ? "Se verifică…" : `${documents.length} din ${limit} documente`}</span>
    </div>
    {uploading && <p role="status" className="personal-library-progress"><span className="dot"/><span className="dot d2"/><span className="dot d3"/> {uploading}</p>}
    {error && <p className="account-error" role="alert">{error} <button type="button" className="account-link" onClick={() => { setError(""); void refresh().catch(e => setError(e.message)); }}><RotateCcw size={14}/>Reîncearcă</button></p>}
    {!!documents?.length && <ul className="personal-library-list">
      {documents.map(d => <li key={d.id} className={"fx-pop " + d.status}>
        <FileText size={18} aria-hidden="true"/>
        <span className="personal-library-name"><a href={`/api/documents/${d.id}`} target="_blank" rel="noopener noreferrer">{d.name}</a><small role="status">{statusLabel(d.status)} · {Math.max(1, Math.round(d.size / 1024))} KB</small></span>
        <button type="button" className={"personal-library-remove" + (confirm === d.id ? " confirm" : "")} disabled={disabled || busyStatus(d.status)} onClick={() => void remove(d.id)} onBlur={() => setConfirm(c => c === d.id ? "" : c)} aria-label={confirm === d.id ? "Confirmă ștergerea: " + d.name : "Șterge " + d.name}><Trash2 size={16}/>{confirm === d.id ? "Confirmă" : !compact && "Șterge"}</button>
      </li>)}
    </ul>}
    {documents?.length === 0 && !compact && <p className="personal-library-empty">Biblioteca ta personală este goală.</p>}
    <p className="account-help personal-library-rules">PDF, DOC, DOCX, PPTX, TXT, MD sau HTML, cel mult 10 MB fiecare; maximum {limit} documente în bibliotecă și 50 pe cont. Nu încărca date personale ale elevilor (nume, note, situații). Pentru căutare, documentele sunt indexate la furnizorul AI folosit de ProfPlus; ștergerea aici elimină originalul și indexul, iar ștergerea contului le elimină pe toate.</p>
  </div>;
}
