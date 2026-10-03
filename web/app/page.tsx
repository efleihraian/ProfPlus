"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Send, Square, Sparkles, MessageSquare, RotateCcw, Paperclip, X, FileText } from "lucide-react";
import type { Source } from "../lib/rag";
import type { ChatDocument } from "../lib/document-store";
type Message = { role: "user" | "assistant"; content: string; sources?: Source[]; warnings?: string[] };
function Reply({ message }: { message: Message }) {
  return <p>{message.content.split(/(\[\d+\])/g).map((part, i) => {
    const id = /^\[(\d+)\]$/.exec(part), source = id ? message.sources?.find(s => s.id === Number(id[1])) : undefined;
    return source ? <a className="inline-citation" key={i} href={source.url} target="_blank" rel="noopener noreferrer" title={source.title}>{part}</a> : part;
  })}</p>;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [chatId, setChatId] = useState("");
  const [documents, setDocuments] = useState<ChatDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [documentError, setDocumentError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const documentController = useRef<AbortController | null>(null);
  const [indexed, setIndexed] = useState<number | null>(null);
  const controller = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const active = useRef(false);
  const lastAttempt = useRef<Message[] | null>(null);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy, error]);
  useEffect(() => () => { controller.current?.abort(); documentController.current?.abort(); }, []);
  useEffect(() => {
    let id: string | null = null;
    try { id = localStorage.getItem("profos-chat-id"); } catch {}
    if (!id || !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) id = crypto.randomUUID();
    try { localStorage.setItem("profos-chat-id", id); } catch {}
    setChatId(id);
  }, []);
  const refreshDocuments = useCallback(async (signal?: AbortSignal) => {
    if (!chatId) return;
    const response = await fetch(`/api/documents?chatId=${chatId}`, { signal });
    const data = await response.json() as { documents?: ChatDocument[]; error?: string };
    if (!response.ok) throw new Error(data.error || "Documentele nu sunt disponibile.");
    setDocuments(data.documents || []);
  }, [chatId]);
  useEffect(() => {
    if (!chatId) return;
    const abort = new AbortController();
    void refreshDocuments(abort.signal).catch(e => { if (!abort.signal.aborted) setDocumentError(e.message); });
    return () => abort.abort();
  }, [chatId, refreshDocuments]);
  useEffect(() => {
    if (!documents.some(d => ["uploading", "indexing", "deleting"].includes(d.status))) return;
    const abort = new AbortController();
    const timer = setInterval(() => { void refreshDocuments(abort.signal).catch(e => { if (!abort.signal.aborted) setDocumentError(e.message); }); }, 5000);
    return () => { clearInterval(timer); abort.abort(); };
  }, [documents, refreshDocuments]);
  async function uploadFiles(files: FileList | null) {
    if (!files || !chatId || uploading || active.current) return;
    setUploading(true); setDocumentError("");
    const abort = new AbortController(); documentController.current = abort;
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024 || !file.size) throw new Error("Alege documente nevide de cel mult 10 MB fiecare.");
        const form = new FormData(); form.append("file", file); form.append("chatId", chatId);
        const response = await fetch("/api/documents", { method: "POST", body: form, signal: abort.signal });
        const data = await response.json() as { document?: ChatDocument; error?: string };
        if (!response.ok || !data.document) throw new Error(data.error || "Încărcarea a eșuat.");
        const document = data.document; setDocuments(previous => [...previous.filter(d => d.id !== document.id), document]);
      }
      await refreshDocuments(abort.signal);
    } catch (e) { if (!abort.signal.aborted) { setDocumentError(e instanceof Error ? e.message : "Încărcarea a eșuat."); void refreshDocuments().catch(() => {}); } }
    finally { setUploading(false); documentController.current = null; if (fileInput.current) fileInput.current.value = ""; }
  }
  async function removeDocument(id: string) {
    if (busy || uploading) return;
    setDocumentError("");
    try {
      const response = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Ștergerea a eșuat.");
      setDocuments(previous => previous.filter(d => d.id !== id));
    } catch (e) { setDocumentError(e instanceof Error ? e.message : "Ștergerea a eșuat."); }
  }
  useEffect(() => {
    const abort = new AbortController();
    const refresh = () => { void fetch("/api/library/status", { signal: abort.signal }).then(r => r.json()).then((data: unknown) => { if (data && typeof data === "object" && "indexed" in data && typeof data.indexed === "number") setIndexed(data.indexed); }).catch(() => {}); };
    refresh(); const timer = setInterval(refresh, 60000);
    return () => { clearInterval(timer); abort.abort(); };
  }, []);

  const requestReply = useCallback(async (next: Message[]) => {
    if (active.current) throw new Error("Un răspuns este deja în curs.");
    active.current = true; lastAttempt.current = next;
    setMessages(next); setError(""); setBusy(true);
    const abort = new AbortController(); controller.current = abort;
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chatId, messages: next.map(({ role, content }) => ({ role, content })) }), signal: abort.signal });
      const data = await response.json() as { error?: string; reply?: string; sources?: Source[]; warnings?: string[] };
      if (!response.ok) throw new Error(data.error || "Nu am putut primi răspunsul. Încearcă din nou.");
      if (typeof data.reply !== "string" || !data.reply.trim()) throw new Error("Răspunsul nu a putut fi citit. Încearcă din nou.");
      setMessages([...next, { role: "assistant", content: data.reply, sources: data.sources, warnings: data.warnings }]); lastAttempt.current = null;
      return { reply: data.reply };
    } catch (e) {
      const message = abort.signal.aborted ? "Răspunsul a fost oprit. Poți reîncerca." : e instanceof Error ? e.message : "Conexiunea a eșuat. Încearcă din nou.";
      setError(message); return { error: message };
    } finally { active.current = false; setBusy(false); controller.current = null; }
  }, [chatId]);
  const send = useCallback(async (text: string) => {
    const content = text.trim();
    if (!content || content.length > 6000) throw new Error("Scrie un mesaj de cel mult 6000 de caractere.");
    if (active.current || uploading || documents.some(d => ["uploading", "indexing"].includes(d.status))) throw new Error("Așteaptă finalizarea răspunsului sau a documentelor.");
    setDraft(""); return requestReply([...messages, { role: "user", content }]);
  }, [messages, requestReply, uploading, documents]);
  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: unknown, options: { signal: AbortSignal }) => Promise<void> } }).modelContext;
    if (!context) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({ name: "send_profos_message", title: "Trimite mesaj în ProfOS", description: "Trimite un mesaj către AI și afișează răspunsul în conversația curentă. Consumă API OpenAI.", inputSchema: { type: "object", properties: { message: { type: "string", minLength: 1, maxLength: 6000 } }, required: ["message"], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: true }, execute: async (value: unknown) => {
      if (!value || typeof value !== "object" || !("message" in value) || typeof value.message !== "string" || Object.keys(value).length !== 1) throw new Error("Mesaj invalid.");
      return send(value.message);
    } }, { signal: lifecycle.signal })).catch(() => {});
    return () => lifecycle.abort();
  }, [send]);
  function reset() { if (active.current) return; setMessages([]); setError(""); setDraft(""); lastAttempt.current = null; input.current?.focus(); }
  const canSend = !!draft.trim() && !busy && !uploading && !!chatId && !documents.some(d => ["uploading", "indexing"].includes(d.status));
  return <div className="workspace">
    <aside className="sidebar"><a href="/" className="brand" aria-label="ProfOS — acasă"><span className="brand-mark">P<span>·</span></span><span>Prof<span className="brand-os">OS</span></span></a><button className="new-chat" onClick={reset} disabled={busy}><Plus size={18} /> Conversație nouă</button><div className="sidebar-label">SPAȚIUL TĂU</div><div className="current-chat"><MessageSquare size={18} /><span>Conversație AI</span><span className="current-dot" /></div><div className="sidebar-bottom"><span className="mini-avatar">P</span><div><strong>ProfOS</strong><span>Prima versiune</span></div><span className="version">0.4</span></div></aside>
    <main className="main"><header className="topbar"><div><span className="mobile-brand">ProfOS</span><span className="desktop-title">Conversație AI</span><span className="header-divider" /><span className="header-label">{indexed === null ? "Biblioteca de manuale" : `${indexed} volume indexate`}</span></div><button className="mobile-new" onClick={reset} disabled={busy} aria-label="Conversație nouă"><Plus size={20} /></button><span className="ai-badge"><Sparkles size={14} /> AI</span></header>
      <section className="conversation" aria-label="Conversație">{messages.length === 0 ? <div className="welcome"><span className="eyebrow">PROFOS / CONVERSAȚIE</span><div className="welcome-icon"><Sparkles size={28} strokeWidth={1.5} /></div><h1>Cu ce te pot ajuta?</h1><p>Documentele tale și manualele au prioritate. Internetul completează informațiile când este nevoie.</p><span className="library-note">{indexed === null ? "Se verifică disponibilitatea manualelor." : `${indexed} din 9 manuale indexate · Clasa a V-a`}</span><div className="suggestions">{["Criteriile de divizibilitate", "Adunarea fracțiilor", "Aria dreptunghiului"].map(text => <button key={text} onClick={() => { setDraft(text + ": "); input.current?.focus(); }}>{text}<Plus size={16} /></button>)}</div></div> : <div className="message-list" role="log" aria-live="polite" aria-relevant="additions text">{messages.map((message, i) => <article key={i} className={`message ${message.role}`}><div className="message-avatar">{message.role === "assistant" ? <Sparkles size={18} /> : "Tu"}</div><div className="message-body"><span className="message-name">{message.role === "assistant" ? "ProfOS" : "Tu"}</span><Reply message={message} />{message.warnings?.map(w => <p className="answer-warning" key={w}>{w}</p>)}{!!message.sources?.length && <div className="sources" aria-label="Sursele răspunsului">{message.sources.map(source => <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer"><strong>[{source.id}] {source.title}</strong><span>{source.kind === "web" ? "Sursă de pe internet" : source.kind === "document" ? "Documentul tău · fragment" : `${source.schoolClass} · ${source.publisher} · pagina PDF ${source.page}`}</span></a>)}</div>}</div></article>)}{busy && <div className="thinking" role="status"><span /><span /><span /><span className="thinking-label">ProfOS pregătește răspunsul</span></div>}{error && <div className="error" role="alert"><p>{error}</p><button onClick={() => lastAttempt.current && void requestReply(lastAttempt.current)} disabled={busy}><RotateCcw size={15} /> Reîncearcă</button></div>}<div ref={bottom} /></div>}</section>
      <footer className="composer-area"><div className="document-panel" aria-label="Documentele conversației">
        {!!documents.length && <><strong>Documentele tale</strong><div className="document-list">{documents.map(d => <div className="document-item" key={d.id}><FileText size={16} /><a href={`/api/documents/${d.id}`} target="_blank" rel="noopener noreferrer">{d.name}</a><span role="status">{d.status === "ready" ? "Gata" : d.status === "indexing" ? "Se pregătește…" : d.status === "uploading" ? "Se încarcă…" : d.status === "deleting" ? "Ștergere de reîncercat" : "Eroare de procesare"}</span><button type="button" onClick={() => void removeDocument(d.id)} disabled={busy || uploading || d.status === "uploading"} aria-label={`Șterge ${d.name}`}><X size={16} /></button></div>)}</div></>}
        {documentError && <div className="document-error" role="alert">{documentError}<button type="button" onClick={() => { setDocumentError(""); void refreshDocuments().catch(e => setDocumentError(e.message)); }}>Reîncearcă</button></div>}
        {uploading && <p role="status">Se încarcă documentele…</p>}
      </div><form className="composer" onSubmit={e => { e.preventDefault(); if (canSend) void send(draft); }}><label htmlFor="message" className="sr-only">Mesaj pentru ProfOS</label><textarea id="message" ref={input} value={draft} onChange={e => setDraft(e.target.value)} maxLength={6000} placeholder="Întreabă despre o lecție sau despre documentele tale..." rows={2} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia("(min-width: 768px)").matches) { e.preventDefault(); if (canSend) void send(draft); } }} /><div className="composer-bottom"><input ref={fileInput} type="file" accept=".pdf,.doc,.docx,.pptx,.txt,.md,.html" multiple className="sr-only" aria-label="Alege documentele tale" onChange={e => void uploadFiles(e.target.files)} /><button type="button" className="attach" disabled={busy || uploading || !chatId} onClick={() => fileInput.current?.click()} title="PDF, Word, PowerPoint sau text · max. 10 MB"><Paperclip size={17} /> Adaugă document</button><span>{draft.length > 5500 ? `${draft.length}/6000` : "Întreabă. Explorează. Clarifică."}</span>{busy ? <button type="button" className="send" onClick={() => controller.current?.abort()} aria-label="Oprește răspunsul"><Square size={16} fill="currentColor" /></button> : <button className="send" type="submit" disabled={!canSend} aria-label="Trimite mesaj"><Send size={19} /></button>}</div></form><p className="disclaimer">Documente de maximum 10 MB, păstrate până le ștergi. Conversația nouă păstrează documentele. AI-ul poate greși.</p></footer>
    </main></div>;
}
