"use client";
import Link from "next/link";
import {ThemeToggle} from "./theme-controls";
import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Send, Square, Sparkles, Menu, RotateCcw, Paperclip, X, FileText, BookOpen } from "lucide-react";
import type { Source } from "../lib/rag";
import type { ChatDocument } from "../lib/document-store";
import LibraryPanel, { type Selection } from "./library-panel";
import type { HistoryChat, Project } from "../lib/history-types";
import SidebarContent from "./sidebar-content";
import DocumentEditor from "./document-editor";
import type {GeneratedDocument} from "../lib/generated-document";
import collection from "../lib/active-collection.json";
type Message = { role: "user" | "assistant"; content: string; sources?: Source[]; warnings?: string[]; document?:GeneratedDocument };
function Reply({ message }: { message: Message }) {
  return <p>{message.content.split(/(\[\d+\])/g).map((part, i) => {
    const id = /^\[(\d+)\]$/.exec(part), source = id ? message.sources?.find(s => s.id === Number(id[1])) : undefined;
    return source ? <a className="inline-citation" key={i} href={source.url} target="_blank" rel="noopener noreferrer" title={source.title}>{part}</a> : part;
  })}</p>;
}

async function api(path: string, init?: RequestInit) {
    const r = await fetch(path, init); const data = await r.json() as {error?:string;chats:HistoryChat[];projects:Project[];id:string;revision:number;chat:{messages:Message[];selection:Selection|null;project_id:string|null;title:string;revision:number}};
    if (!r.ok) throw new Error(data.error || "Operația a eșuat."); return data;
  }

export default function Home() {
  const [editorIndex,setEditorIndex]=useState<number|null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef=useRef<HTMLElement>(null);
  const menuRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    if(!sidebarOpen)return;
    sidebarRef.current?.querySelector<HTMLButtonElement>('.sidebar-close')?.focus();
    const media=window.matchMedia('(min-width:768px)');
    const resize=()=>{if(media.matches)setSidebarOpen(false);};media.addEventListener('change',resize);
    const close=(e:KeyboardEvent)=>{if(e.key==='Escape'){setSidebarOpen(false);menuRef.current?.focus();}};
    document.addEventListener('keydown',close);return()=>{document.removeEventListener('keydown',close);media.removeEventListener('change',resize);};
  },[sidebarOpen]);
  const [chats, setChats] = useState<HistoryChat[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState("");
  const [saveError, setSaveError] = useState("");
  const revision = useRef(0);
  const [pendingSave, setPendingSave] = useState(false);
  const unsaved = useRef(false);
  const saveSerial = useRef(0);
  const saveQueue = useRef<Promise<unknown>>(Promise.resolve());
  const refreshHistory = useCallback(async () => { const data = await api('/api/history'); setChats(data.chats); setProjects(data.projects); return data.chats as HistoryChat[]; }, []);
  async function openChat(id: string) {
    if (active.current || uploading || unsaved.current) { setSaveError("Salvează conversația curentă înainte să o schimbi."); return; }
    try { const {chat} = await api('/api/history?id='+id); setChatId(id); setMessages(chat.messages); setSelection(chat.selection); setProjectId(chat.project_id); setChatTitle(chat.title); revision.current=chat.revision; setError(''); setSaveError(''); setDraft(''); setDocuments([]); lastAttempt.current=null; setSidebarOpen(false); localStorage.setItem('profos-chat-id',id); }
    catch(e) { setSaveError(e instanceof Error?e.message:'Istoric indisponibil.'); }
  }
  async function newChat(project: string | null = projectId) {
    if (active.current || uploading || unsaved.current) {setSaveError("Salvează conversația curentă înainte să creezi alta.");return;}
    try { const {id}=await api('/api/history',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId:project})}); await openChat(id); await refreshHistory(); }
    catch(e) { setSaveError(e instanceof Error?e.message:'Crearea a eșuat.'); }
  }
  const persist = useCallback((next: Message[], sources: Selection | null = selection, project: string | null = projectId, title = chatTitle) => {
    unsaved.current=true; setPendingSave(true);
    const serial=++saveSerial.current;
    const task=saveQueue.current.catch(()=>{}).then(async()=>{
      const data=await api('/api/history',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:chatId,revision:revision.current,messages:next,selection:sources,projectId:project,title: title==='Conversație nouă'?'':title})});
      revision.current=data.revision; if(serial===saveSerial.current) {unsaved.current=false;setPendingSave(false);} setSaveError(''); void refreshHistory().catch(()=>{});
    });
    saveQueue.current=task;
    return task.catch(e=>{if(serial===saveSerial.current) unsaved.current=true;setSaveError(e.message);throw e;});
  }, [chatId, selection, projectId, chatTitle, refreshHistory]);
  useEffect(() => {
    void (async()=>{try { const accountResponse=await fetch('/api/account',{cache:'no-store'}); if(!accountResponse.ok)throw new Error('Contul nu a putut fi verificat.'); const account=await accountResponse.json() as {provider:string;user:unknown}; if(account.provider==='supabase'&&!account.user){window.location.assign('/account?view=login');return;} const list=await refreshHistory(); const saved=localStorage.getItem('profos-chat-id'); if(saved&&list.some(c=>c.id===saved)) await openChat(saved); else if(list.length) await openChat(list[0].id); else await newChat(null); } catch(e) {setSaveError(e instanceof Error?e.message:'Istoric indisponibil.');}})();
    // Bootstrap uses only initial state; rerunning would reopen chats during editing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(()=>{const guard=(e:BeforeUnloadEvent)=>{if(unsaved.current){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard);},[]);
  function chooseSources(value: Selection) {
    setSelection(value);
    if(chatId) void persist(messages,value).catch(()=>{});
    try { localStorage.setItem("profos-selection-" + chatId, JSON.stringify(value)); } catch {}
  }
  const effectiveSelection: Selection = selection || { manualIds: collection.uids, documentIds: documents.filter(d => d.status === "ready").map(d => d.id) };
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
    void Promise.resolve().then(()=>refreshDocuments(abort.signal)).catch(e => { if (!abort.signal.aborted) setDocumentError(e.message); });
    return () => abort.abort();
  }, [chatId, refreshDocuments]);
  useEffect(() => {
    if (!documents.some(d => ["uploading", "indexing", "deleting"].includes(d.status))) return;
    const abort = new AbortController();
    const timer = setInterval(() => { void Promise.resolve().then(()=>refreshDocuments(abort.signal)).catch(e => { if (!abort.signal.aborted) setDocumentError(e.message); }); }, 5000);
    return () => { clearInterval(timer); abort.abort(); };
  }, [documents, refreshDocuments]);
  async function uploadFiles(files: FileList | null) {
    if (!files || !chatId || uploading || active.current) return;
    setUploading(true); setDocumentError("");
    const abort = new AbortController(); documentController.current = abort;
    try {
      let currentSelection=selection;
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024 || !file.size) throw new Error("Alege documente nevide de cel mult 10 MB fiecare.");
        const form = new FormData(); form.append("file", file); form.append("chatId", chatId);
        const response = await fetch("/api/documents", { method: "POST", body: form, signal: abort.signal });
        const data = await response.json() as { document?: ChatDocument; error?: string };
        if (!response.ok || !data.document) throw new Error(data.error || "Încărcarea a eșuat.");
        const document = data.document; if(currentSelection) {currentSelection={...currentSelection,documentIds:[...new Set([...currentSelection.documentIds,document.id])]};chooseSources(currentSelection);} setDocuments(previous => [...previous.filter(d => d.id !== document.id), document]);
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
      if (selection) chooseSources({ ...selection, documentIds: selection.documentIds.filter(v => v !== id) });
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
      await persist(next);
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chatId, revision:revision.current, ...(selection ? { selection } : {}), messages: next.slice(-20).map(({ role, content }) => ({ role, content:content.slice(0,6000) })) }), signal: abort.signal });
      const data = await response.json() as { error?: string; reply?: string; sources?: Source[]; warnings?: string[]; document?:GeneratedDocument; revision?: number };
      if (!response.ok) throw new Error(data.error || "Nu am putut primi răspunsul. Încearcă din nou.");
      if (typeof data.reply !== "string" || !data.reply.trim()) throw new Error("Răspunsul nu a putut fi citit. Încearcă din nou.");
      const completed: Message[]=[...next, { role: "assistant", content: data.reply, sources: data.sources, warnings: data.warnings, document:data.document }]; setMessages(completed); lastAttempt.current = null;
      if(typeof data.revision==='number') {revision.current=data.revision;void refreshHistory().catch(()=>{});} else await persist(completed);
      if(data.document)setEditorIndex(completed.length-1);
      return { reply: data.reply };
    } catch (e) {
      const message = abort.signal.aborted ? "Răspunsul a fost oprit. Poți reîncerca." : e instanceof Error ? e.message : "Conexiunea a eșuat. Încearcă din nou.";
      setError(message); return { error: message };
    } finally { active.current = false; setBusy(false); controller.current = null; }
  }, [chatId, selection, persist, refreshHistory]);
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
    void Promise.resolve(context.registerTool({ name: "send_profplus_message", title: "Trimite mesaj în ProfPlus", description: "Trimite un mesaj către AI și afișează răspunsul în conversația curentă. Consumă API OpenAI.", inputSchema: { type: "object", properties: { message: { type: "string", minLength: 1, maxLength: 6000 } }, required: ["message"], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: true }, execute: async (value: unknown) => {
      if (!value || typeof value !== "object" || !("message" in value) || typeof value.message !== "string" || Object.keys(value).length !== 1) throw new Error("Mesaj invalid.");
      return send(value.message);
    } }, { signal: lifecycle.signal })).catch(() => {});
    return () => lifecycle.abort();
  }, [send]);
  const canSend = !!draft.trim() && !busy && !uploading && !!chatId && !pendingSave && !documents.some(d => ["uploading", "indexing"].includes(d.status));
  return <div className="workspace">
    {sidebarOpen&&<button className="sidebar-backdrop" aria-label="Închide meniul" onClick={()=>{setSidebarOpen(false);menuRef.current?.focus();}}/>}
    <aside ref={sidebarRef} id="profplus-navigation" className={`sidebar ${sidebarOpen?'is-open':''}`} aria-label="Navigare ProfPlus"><div className="sidebar-brand-row"><Link href="/" className="brand" aria-label="ProfPlus — acasă"><span className="brand-mark">P</span><span>Prof<span className="brand-suffix">Plus</span></span></Link><button className="sidebar-close" onClick={()=>{setSidebarOpen(false);menuRef.current?.focus();}} aria-label="Închide meniul"><X size={19}/></button></div><SidebarContent chats={chats} projects={projects} current={chatId} projectId={projectId} disabled={busy||uploading||pendingSave} onOpen={id=>void openChat(id)} onNew={id=>void newChat(id)} onProject={async name=>{await api('/api/history',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'project',name})});await refreshHistory();}} onMove={async (id,project)=>{
      if(unsaved.current||active.current)throw new Error('Așteaptă salvarea conversației.');
      const {chat}=await api('/api/history?id='+id);
      await api('/api/history',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,revision:chat.revision,messages:chat.messages,selection:chat.selection,title:chat.title,projectId:project})});
      if(id===chatId)await openChat(id);await refreshHistory();
    }} onDelete={async (kind,id)=>{
      if(unsaved.current||active.current)throw new Error('Așteaptă salvarea conversației.');
      await api(`/api/history?kind=${kind}&id=${id}`,{method:'DELETE'});
      const list=await refreshHistory();
      if(kind==='chat'&&id===chatId){setMessages([]);setDocuments([]);setSelection(null);if(list.length)await openChat(list[0].id);else await newChat(null);}
      else if(kind==='project'&&id===projectId)await openChat(chatId);
    }} onLibrary={()=>{setSidebarOpen(false);setLibraryOpen(true);}}/><a href="/account" className="sidebar-bottom account-launch"><span className="mini-avatar">P</span><div><strong>Cont și setări</strong><span>Profil · securitate · aspect</span></div></a></aside>
    <main className="main" inert={sidebarOpen}><header className="topbar"><button ref={menuRef} className="navigation-toggle" onClick={()=>setSidebarOpen(true)} aria-label="Deschide meniul" aria-expanded={sidebarOpen} aria-controls="profplus-navigation"><Menu size={21}/></button><span className="topbar-name">ProfPlus</span><ThemeToggle/></header>
      <section className="conversation" aria-label="Conversație">{messages.length === 0 ? <div className="welcome"><h1>Cu ce te pot ajuta?</h1><p>Lecții, exerciții și explicații, cu surse la îndemână.</p><span className="library-note">{indexed === null ? "Se verifică disponibilitatea manualelor." : `${indexed} manuale de matematică, clasa a V-a · Consultă biblioteca de surse`}</span><div className="suggestions">{["Criteriile de divizibilitate", "Adunarea fracțiilor", "Aria dreptunghiului"].map(text => <button key={text} onClick={() => { setDraft(text + ": "); input.current?.focus(); }}>{text}<Plus size={16} /></button>)}</div></div> : <div className="message-list" role="log" aria-live="polite" aria-relevant="additions text">{messages.map((message, i) => <article key={i} className={`message ${message.role}`}><div className="message-avatar">{message.role === "assistant" ? <Sparkles size={18} /> : "Tu"}</div><div className="message-body"><span className="message-name">{message.role === "assistant" ? "ProfPlus" : "Tu"}</span>{message.document?<button className="generated-document-card" onClick={()=>setEditorIndex(i)}><FileText size={25}/><span><strong>{message.document.title}</strong><small>Deschide documentul · Editează și exportă PDF / Word</small></span></button>:<Reply message={message} />}{message.warnings?.map(w => <p className="answer-warning" key={w}>{w}</p>)}{!!message.sources?.length && <div className="sources" aria-label="Sursele răspunsului">{message.sources.map(source => <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer"><strong>[{source.id}] {source.title}</strong><span>{source.kind === "web" ? "Sursă de pe internet" : source.kind === "document" ? "Documentul tău · fragment" : `${source.schoolClass} · ${source.publisher} · pagina PDF ${source.page}`}</span></a>)}</div>}</div></article>)}{busy && <div className="thinking" role="status"><span /><span /><span /><span className="thinking-label">ProfPlus pregătește răspunsul</span></div>}{error && <div className="error" role="alert"><p>{error}</p><button onClick={() => lastAttempt.current && void requestReply(lastAttempt.current)} disabled={busy}><RotateCcw size={15} /> Reîncearcă</button></div>}<div ref={bottom} /></div>}</section>
      <footer className="composer-area">{saveError&&<div role="alert" className="document-error">{saveError}<button disabled={busy||!chatId} onClick={()=>void persist(messages).catch(()=>{})}>Reîncearcă salvarea</button><button disabled={busy||!chatId} onClick={()=>{unsaved.current=false;setPendingSave(false);void openChat(chatId);}}>Renunță la modificări și redeschide versiunea salvată</button></div>}<div className="document-panel" aria-label="Documentele conversației">
        {!!documents.length && <><strong>Documentele tale</strong><div className="document-list">{documents.map(d => <div className="document-item" key={d.id}><FileText size={16} /><a href={`/api/documents/${d.id}`} target="_blank" rel="noopener noreferrer">{d.name}</a><span role="status">{d.status === "ready" ? "Gata" : d.status === "indexing" ? "Se pregătește…" : d.status === "uploading" ? "Se încarcă…" : d.status === "deleting" ? "Ștergere de reîncercat" : "Eroare de procesare"}</span><button type="button" onClick={() => void removeDocument(d.id)} disabled={busy || uploading || d.status === "uploading"} aria-label={`Șterge ${d.name}`}><X size={16} /></button></div>)}</div></>}
        {documentError && <div className="document-error" role="alert">{documentError}<button type="button" onClick={() => { setDocumentError(""); void refreshDocuments().catch(e => setDocumentError(e.message)); }}>Reîncearcă</button></div>}
        {uploading && <p role="status">Se încarcă documentele…</p>}
      </div><div className="chat-selection"><button onClick={() => setLibraryOpen(true)}><BookOpen size={15} /> Alege sursele</button><span>{effectiveSelection.manualIds.length} manuale · {effectiveSelection.documentIds.length} documente pentru conversație</span></div><form className="composer" onSubmit={e => { e.preventDefault(); if (canSend) void send(draft); }}><label htmlFor="message" className="sr-only">Mesaj pentru ProfPlus</label><textarea id="message" ref={input} value={draft} onChange={e => setDraft(e.target.value)} maxLength={6000} placeholder="Întreabă despre o lecție sau despre documentele tale..." rows={2} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia("(min-width: 768px)").matches) { e.preventDefault(); if (canSend) void send(draft); } }} /><div className="composer-bottom"><input ref={fileInput} type="file" accept=".pdf,.doc,.docx,.pptx,.txt,.md,.html" multiple className="sr-only" aria-label="Alege documentele tale" onChange={e => void uploadFiles(e.target.files)} /><button type="button" className="attach" disabled={busy || uploading || !chatId} onClick={() => fileInput.current?.click()} title="PDF, Word, PowerPoint sau text · max. 10 MB"><Paperclip size={17} /> Adaugă document</button><span>{draft.length > 5500 ? `${draft.length}/6000` : ""}</span>{busy ? <button type="button" className="send" onClick={() => controller.current?.abort()} aria-label="Oprește răspunsul"><Square size={16} fill="currentColor" /></button> : <button className="send" type="submit" disabled={!canSend} aria-label="Trimite mesaj"><Send size={19} /></button>}</div></form><p className="disclaimer">ProfPlus poate greși. Verifică răspunsurile și sursele.</p></footer>
    </main>{editorIndex!==null&&messages[editorIndex]?.document&&<DocumentEditor document={messages[editorIndex].document!} sources={messages[editorIndex].sources||[]} onClose={()=>setEditorIndex(null)} onSave={async value=>{const next=messages.map((m,i)=>i===editorIndex?{...m,content:value.content,document:value}:m);await persist(next);setMessages(next);}}/>} {libraryOpen && <LibraryPanel selection={effectiveSelection} onChange={chooseSources} onClose={() => setLibraryOpen(false)} sources={messages.flatMap(m => m.sources || [])} disabled={busy || uploading} onAsk={setDraft} />}</div>;
}
