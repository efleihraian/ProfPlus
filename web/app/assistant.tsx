"use client";
import {guestMimes} from "../lib/guest-files";
import Link from "next/link";
import {ThemeToggle} from "./theme-controls";
import { useCallback, useEffect, useRef, useState } from "react";
import { LogOut, Plus, Send, Square, Menu, RotateCcw, Paperclip, X, FileText, BookOpen } from "lucide-react";
import type { Source } from "../lib/rag";
import type { ChatDocument } from "../lib/document-store";
import LibraryPanel, { type Selection } from "./library-panel";
import type { HistoryChat, Project } from "../lib/history-types";
import SidebarContent from "./sidebar-content";
import EducationalMarkdown from "./educational-markdown";
import DocumentEditor from "./document-editor";
import Plusi, {PlusiAvatar} from "./plusi";
import type {GeneratedDocument} from "../lib/generated-document";
import {savedSelection,withPriorities} from '../lib/source-selection';
import type {AccountIdentity} from '../lib/account-auth';
type Message = { role: "user" | "assistant"; content: string; sources?: Source[]; warnings?: string[]; document?:GeneratedDocument };
function Reply({ message }: { message: Message }) {
  return <div className="educational-reply"><EducationalMarkdown content={message.content} sources={message.sources}/></div>;
}

async function api(path: string, init?: RequestInit) {
    const r = await fetch(path, init); const data = await r.json() as {error?:string;chats:HistoryChat[];projects:Project[];id:string;revision:number;chat:{messages:Message[];selection:Selection|null;project_id:string|null;title:string;revision:number}};
    if (!r.ok) throw new Error(data.error || "Operația a eșuat."); return data;
  }

export default function Assistant({seed, splash = false}: {seed?: {text: string; n: number}; splash?: boolean}) {
  const [guestFiles,setGuestFiles]=useState<{name:string;data:string}[]>([]);
  const [account,setAccount]=useState<{provider:string;user:AccountIdentity|null}|null>(null);
  const needsLogin=!!account&&!account.user;
  const needsProfile=account?.provider==='supabase'&&!!account.user&&!account.user.teaching;
  const [automatic,setAutomatic]=useState<Selection>({mode:'automatic',manualIds:[],documentIds:[]});
  const refreshAutomatic=useCallback(async(id?:string)=>{const r=await fetch('/api/library'+(id?'?chatId='+id:''),{cache:'no-store'});if(!r.ok)throw new Error('Biblioteca nu a putut fi încărcată.');const data=await r.json() as {selection:Selection;warnings?:string[]};if(data.warnings?.length)throw new Error(data.warnings.join(' '));setAutomatic(data.selection);},[]);
  async function logout(){if(account?.provider==='sites'){window.location.assign('/signout-with-chatgpt?return_to=%2Faccount');return;}try{const response=await fetch('/api/account',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});if(!response.ok)throw new Error('Delogarea a eșuat.');for(const key of Object.keys(localStorage))if(key.startsWith('profos-')||key.startsWith('profplus-'))localStorage.removeItem(key);window.location.assign('/account?view=login');}catch(e){setSaveError(e instanceof Error?e.message:'Delogarea a eșuat.');}}
  const [editorIndex,setEditorIndex]=useState<number|null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryKind,setLibraryKind]=useState<"all"|"models">("all");
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
  // Mesaj trimis din Acasă sau din „Generează cu Plusi”: pleacă automat când conversația e gata.
  const pendingSeed = useRef<string | null>(null);
  useEffect(() => { if (!seed) return; pendingSeed.current = seed.text || null; input.current?.focus(); }, [seed]);
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
    try { const {chat} = await api('/api/history?id='+id); setChatId(id); setMessages(chat.messages); setSelection(chat.selection); setProjectId(chat.project_id); setChatTitle(chat.title); revision.current=chat.revision; setError(''); setSaveError(''); setDraft(''); setDocuments([]); lastAttempt.current=null; setSidebarOpen(false); localStorage.setItem('profos-chat-id',id);await refreshAutomatic(id).catch(e=>setDocumentError(e.message)); }
    catch(e) { setSaveError(e instanceof Error?e.message:'Istoric indisponibil.'); }
  }
  async function newChat(project: string | null = projectId) {
    if (active.current || uploading || unsaved.current) {setSaveError("Salvează conversația curentă înainte să creezi alta.");return;}
    try { const response=await fetch('/api/account',{cache:'no-store'});if(!response.ok)throw new Error('Contul nu a putut fi verificat.');const latest=await response.json() as {provider:string;user:AccountIdentity|null;defaultManualIds:string[]};setAccount(latest);if(!latest.user){setMessages([]);setDraft('');setError('');setSidebarOpen(false);return;}if(latest.user.deleting||latest.provider==='supabase'&&!latest.user.teaching){setError('Completează profilul din Cont și setări pentru a începe conversația.');return;}const {id}=await api('/api/history',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId:project})}); await openChat(id); await refreshHistory(); }
    catch(e) { setSaveError(e instanceof Error?e.message:'Crearea a eșuat.'); }
  }
  const persist = useCallback((next: Message[], sources: Selection | null = selection, project: string | null = projectId, title = chatTitle) => {
    unsaved.current=true; setPendingSave(true);
    const serial=++saveSerial.current;
    const task=saveQueue.current.catch(()=>{}).then(async()=>{
      const data=await api('/api/history',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:chatId,revision:revision.current,messages:next,selection:savedSelection(sources),projectId:project,title: title==='Conversație nouă'?'':title})});
      revision.current=data.revision; if(serial===saveSerial.current) {unsaved.current=false;setPendingSave(false);} setSaveError(''); void refreshHistory().catch(()=>{});
    });
    saveQueue.current=task;
    return task.catch(e=>{if(serial===saveSerial.current) unsaved.current=true;setSaveError(e.message);throw e;});
  }, [chatId, selection, projectId, chatTitle, refreshHistory]);
  useEffect(() => {
    void (async()=>{try { const accountResponse=await fetch('/api/account',{cache:'no-store'}); if(!accountResponse.ok)throw new Error('Contul nu a putut fi verificat.'); const account=await accountResponse.json() as {provider:string;user:AccountIdentity|null;defaultManualIds:string[]}; setAccount(account);if(!account.user||account.user.deleting||account.provider==='supabase'&&!account.user.teaching)return;const list=await refreshHistory(); const saved=localStorage.getItem('profos-chat-id'); if(saved&&list.some(c=>c.id===saved)) await openChat(saved); else if(list.length) await openChat(list[0].id); else await newChat(null); } catch(e) {setSaveError(e instanceof Error?e.message:'Istoric indisponibil.');}})();
    // Bootstrap uses only initial state; rerunning would reopen chats during editing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(()=>{const guard=(e:BeforeUnloadEvent)=>{if(unsaved.current){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard);},[]);
  function chooseSources(value: Selection) {
    setSelection(value);
    if(chatId) void persist(messages,value).catch(()=>{});
    try { localStorage.setItem("profos-selection-" + chatId, JSON.stringify(value)); } catch {}
  }
  const effectiveSelection: Selection = !selection||selection.mode==='automatic'?withPriorities(automatic,selection):selection;
  const refreshDocuments = useCallback(async (signal?: AbortSignal) => {
    if (!chatId) return;
    const response = await fetch(`/api/documents?chatId=${chatId}`, { signal });
    const data = await response.json() as { documents?: ChatDocument[]; error?: string };
    if (!response.ok) throw new Error(data.error || "Documentele nu sunt disponibile.");
    setDocuments(data.documents || []);await refreshAutomatic(chatId);
  }, [chatId,refreshAutomatic]);
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
    if(!files||uploading||active.current)return;
    if(!account?.user){setUploading(true);try{const incoming=Array.from(files);if(guestFiles.length+incoming.length>3||incoming.reduce((s,f)=>s+f.size,0)+guestFiles.reduce((s,f)=>s+Math.floor(f.data.split(',')[1].length*3/4),0)>10*1024*1024)throw Error('Maximum trei fișiere și 10 MB în total.');const added=await Promise.all(incoming.map(file=>new Promise<{name:string;data:string}>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>{const mime=guestMimes[file.name.split('.').at(-1)?.toLowerCase()||''];if(!mime){reject(Error('Format nepermis.'));return;}resolve({name:file.name,data:'data:'+mime+';base64,'+String(reader.result).split(',')[1]});};reader.onerror=()=>reject(Error('Fișierul nu poate fi citit.'));reader.readAsDataURL(file);})));setGuestFiles(p=>[...p,...added]);setDocumentError('');}catch(e){setDocumentError(e instanceof Error?e.message:'Fișier invalid.');}finally{setUploading(false);if(fileInput.current)fileInput.current.value='';}return;}
    if(!chatId)return;
    setUploading(true); setDocumentError("");
    const abort = new AbortController(); documentController.current = abort;
    try {
      let currentSelection=selection?.mode==='automatic'?null:selection;
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
      if (selection?.mode!=="automatic"&&selection) chooseSources({ ...selection, documentIds: selection.documentIds.filter(v => v !== id),priorityDocumentIds:selection.priorityDocumentIds?.filter(v=>v!==id) });
      await refreshAutomatic(chatId||undefined);
    } catch (e) { setDocumentError(e instanceof Error ? e.message : "Ștergerea a eșuat."); }
  }
  useEffect(() => {
    if(!account?.user||account.user.deleting)return;
    const abort = new AbortController();
    const refresh = () => { void fetch("/api/library/status", { signal: abort.signal }).then(r => r.json()).then((data: unknown) => { if (data && typeof data === "object" && "indexed" in data && typeof data.indexed === "number") setIndexed(data.indexed); }).catch(() => {}); };
    refresh(); const timer = setInterval(refresh, 60000);
    return () => { clearInterval(timer); abort.abort(); };
  }, [account]);

  const requestReply = useCallback(async (next: Message[]) => {
    if (active.current) throw new Error("Un răspuns este deja în curs.");
    if(account?.user&&(account.user.deleting||needsProfile)){setError("Accesează Cont și setări pentru a continua.");return {error:"Profil indisponibil."};}
    active.current = true; lastAttempt.current = next;
    setMessages(next); setError(""); setBusy(true);
    const abort = new AbortController(); controller.current = abort;
    try {
      if(account?.user)await persist(next);
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(account?.user?{chatId, revision:revision.current, ...(selection ? { selection:savedSelection(selection) } : {})}:{guestFiles,...(selection?{selection:savedSelection(selection)}:{})}), messages: next.slice(-20).map(({ role, content }) => ({ role, content:content.slice(0,6000) })) }), signal: abort.signal });
      const data = await response.json() as { error?: string; reply?: string; sources?: Source[]; warnings?: string[]; document?:GeneratedDocument; revision?: number };
      if (!response.ok) throw new Error(data.error || "Nu am putut primi răspunsul. Încearcă din nou.");
      if (typeof data.reply !== "string" || !data.reply.trim()) throw new Error("Răspunsul nu a putut fi citit. Încearcă din nou.");
      const completed: Message[]=[...next, { role: "assistant", content: data.reply, sources: data.sources, warnings: data.warnings, document:data.document }]; setMessages(completed); lastAttempt.current = null;
      if(typeof data.revision==='number') {revision.current=data.revision;void refreshHistory().catch(()=>{});} else if(account?.user)await persist(completed);
      if(data.document)setEditorIndex(completed.length-1);
      return { reply: data.reply };
    } catch (e) {
      const message = abort.signal.aborted ? "Răspunsul a fost oprit. Poți reîncerca." : e instanceof Error ? e.message : "Conexiunea a eșuat. Încearcă din nou.";
      setError(message); return { error: message };
    } finally { active.current = false; setBusy(false); controller.current = null; }
  }, [chatId, selection, persist, refreshHistory, account, needsProfile, guestFiles]);
  const send = useCallback(async (text: string) => {
    const content = text.trim();
    if (!content || content.length > 6000) throw new Error("Scrie un mesaj de cel mult 6000 de caractere.");
    if (active.current || uploading || documents.some(d => ["uploading", "indexing"].includes(d.status))) throw new Error("Așteaptă finalizarea răspunsului sau a documentelor.");
    if(account?.user&&(account.user.deleting||needsProfile)){setError("Accesează Cont și setări pentru a continua.");return {error:"Profil indisponibil."};}
    setDraft(""); return requestReply([...messages, { role: "user", content }]);
  }, [messages, requestReply, uploading, documents, account, needsProfile, guestFiles]);
  useEffect(() => {
    const text = pendingSeed.current;
    if (!text || !account || busy || pendingSave || (account.user && !chatId)) return;
    pendingSeed.current = null;
    void Promise.resolve().then(() => send(text)).catch(e => setError(e instanceof Error ? e.message : "Mesajul nu a putut fi trimis."));
  }, [seed, send, account, busy, pendingSave, chatId]);
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
  const canSend = !!draft.trim() && !busy && !uploading && (!!chatId || needsLogin || needsProfile) && !pendingSave && !documents.some(d => ["uploading", "indexing"].includes(d.status));
  return <div className="workspace">
    {sidebarOpen&&<button className="sidebar-backdrop" aria-label="Închide meniul" onClick={()=>{setSidebarOpen(false);menuRef.current?.focus();}}/>}
    <aside ref={sidebarRef} id="profplus-navigation" className={`sidebar ${sidebarOpen?'is-open':''}`} aria-label="Navigare ProfPlus"><div className="sidebar-brand-row"><Link href="/" className="brand" aria-label="ProfPlus — acasă"><span className="brand-mark">P</span><span>Prof<span className="brand-suffix">Plus</span></span></Link><button className="sidebar-close" onClick={()=>{setSidebarOpen(false);menuRef.current?.focus();}} aria-label="Închide meniul"><X size={19}/></button></div>{account?.user&&!account.user.deleting&&!needsProfile?<SidebarContent chats={chats} projects={projects} current={chatId} projectId={projectId} disabled={busy||uploading||pendingSave} onOpen={id=>void openChat(id)} onNew={id=>void newChat(id)} onProject={async name=>{await api('/api/history',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'project',name})});await refreshHistory();}} onMove={async (id,project)=>{
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
    }} onLibrary={()=>{setSidebarOpen(false);setLibraryOpen(true);}}/>:<nav className="nav-actions" aria-label="Acțiuni"><button onClick={()=>{setSidebarOpen(false);setLibraryOpen(true);}}><BookOpen size={18}/>Bibliotecă</button><button onClick={()=>{setGuestFiles([]);setSelection(null);setMessages([]);setDraft('');setError('');setSidebarOpen(false);input.current?.focus();}}><Plus size={18}/>Conversație nouă</button><a href="/account?view=login">Conectare / Creează cont</a></nav>}<a href="/account" className="sidebar-bottom account-launch"><span className="mini-avatar">P</span><div><strong>Cont și setări</strong><span>Profil · securitate · aspect</span></div></a>{account?.user&&<button className="sidebar-logout" onClick={()=>void logout()}><LogOut size={17}/>Delogare</button>}</aside>
    <main className="main" inert={sidebarOpen}><header className="topbar"><button ref={menuRef} className="navigation-toggle" onClick={()=>setSidebarOpen(true)} aria-label="Deschide meniul" aria-expanded={sidebarOpen} aria-controls="profplus-navigation"><Menu size={21}/></button><span className="topbar-name">ProfPlus</span><ThemeToggle/></header>
      <section className="conversation" aria-label="Conversație">{messages.length === 0 ? <div className="welcome"><div className={splash?"fx-splash":undefined}><Plusi width={132} height={122} bubbles={2} shadow={false} label=""/></div><h1>Cu ce te pot <span className="accent">ajuta</span>?</h1><p>Sunt Plusi. Lecții, exerciții și explicații, cu surse la îndemână.</p><span className="library-note">{needsLogin ? "Manuale, documente și explicații într-un singur loc." : indexed === null ? "Se verifică disponibilitatea manualelor." : `${indexed} manuale indexate · Consultă biblioteca de surse`}</span><div className="suggestions">{["Criteriile de divizibilitate", "Adunarea fracțiilor", "Aria dreptunghiului"].map(text => <button key={text} onClick={() => { setDraft(text + ": "); input.current?.focus(); }}>{text}<Plus size={16} /></button>)}</div></div> : <div className="message-list" role="log" aria-live="polite" aria-relevant="additions text">{messages.map((message, i) => <article key={i} className={`message ${message.role}`}>{message.role === "assistant" ? <PlusiAvatar/> : <div className="message-avatar">Tu</div>}<div className="message-body"><span className="message-name">{message.role === "assistant" ? <>Plusi <span className="message-name-sub">· foca ProfPlus</span></> : "Tu"}</span><div className={message.role === "assistant" ? "plusi-bubble" : "user-bubble"}>{message.document?<button className="generated-document-card" onClick={()=>setEditorIndex(i)}><FileText size={25}/><span><strong>{message.document.title}</strong><small>Deschide documentul · Editează vizual / LaTeX · Export PDF / Word / .tex</small></span></button>:<Reply message={message} />}{message.warnings?.map(w => <p className="answer-warning" key={w}>{w}</p>)}</div>{!!message.sources?.length && <div className="sources" aria-label="Sursele răspunsului">{message.sources.map(source => <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer"><strong>[{source.id}] {source.title}</strong><span>{source.kind === "web" ? "Sursă de pe internet" : source.kind === "document" ? "Documentul tău · fragment" : `${source.schoolClass} · ${source.publisher} · pagina PDF ${source.page}`}</span></a>)}</div>}</div></article>)}{busy && <div className="thinking plusi-thinking" role="status"><PlusiAvatar swim/><span className="dot" /><span className="dot d2" /><span className="dot d3" /><span className="thinking-label">Plusi caută prin manuale…</span></div>}{error && <div className="error" role="alert"><p>{error}</p><button onClick={() => lastAttempt.current && void requestReply(lastAttempt.current)} disabled={busy}><RotateCcw size={15} /> Reîncearcă</button></div>}<div ref={bottom} /></div>}</section>
      <footer className="composer-area">{(needsLogin||needsProfile||account?.user?.deleting)&&<p className="disclaimer" role="status">{needsLogin?<>Poți conversa fără cont. Mesajele și fișierele temporare rămân în această pagină și sunt trimise serviciului AI pentru răspuns. Nu include date personale ale elevilor. Pentru istoric și păstrarea documentelor, <a href="/account?view=login">conectează-te sau creează un cont</a>.</>:<a href="/account">{account?.user?.deleting?'Reia ștergerea contului':'Completează profilul pentru a începe conversația'}</a>}</p>}{error&&!messages.length&&<p className="document-error" role="alert">{error}</p>}{saveError&&<div role="alert" className="document-error">{saveError}<button disabled={busy||!chatId} onClick={()=>void persist(messages).catch(()=>{})}>Reîncearcă salvarea</button><button disabled={busy||!chatId} onClick={()=>{unsaved.current=false;setPendingSave(false);void openChat(chatId);}}>Renunță la modificări și redeschide versiunea salvată</button></div>}<div className="document-panel" aria-label="Documentele conversației">
        {!!guestFiles.length&&<div className="document-list">{guestFiles.map((f,i)=><div className="document-item" key={i}><FileText size={16}/><span>{f.name} · temporar</span><button disabled={busy} aria-label={`Elimină ${f.name}`} onClick={()=>setGuestFiles(p=>p.filter((_,n)=>n!==i))}><X size={16}/></button></div>)}</div>}
        {!!documents.length && <><strong>Documentele tale</strong><div className="document-list">{documents.map(d => <div className="document-item" key={d.id}><FileText size={16} /><a href={`/api/documents/${d.id}`} target="_blank" rel="noopener noreferrer">{d.name}</a><span role="status">{d.status === "ready" ? "Gata" : d.status === "indexing" ? "Se pregătește…" : d.status === "uploading" ? "Se încarcă…" : d.status === "deleting" ? "Ștergere de reîncercat" : "Eroare de procesare"}</span><button type="button" onClick={() => void removeDocument(d.id)} disabled={busy || uploading || d.status === "uploading"} aria-label={`Șterge ${d.name}`}><X size={16} /></button></div>)}</div></>}
        {documentError && <div className="document-error" role="alert">{documentError}<button type="button" onClick={() => { setDocumentError(""); void refreshDocuments().catch(e => setDocumentError(e.message)); }}>Reîncearcă</button></div>}
        {uploading && <p role="status">Se încarcă documentele…</p>}
      </div><div className="chat-selection">{!needsProfile&&!account?.user?.deleting&&<><button onClick={() => {setLibraryKind("all");setLibraryOpen(true);}}><BookOpen size={15} /> Alege sursele</button>{account?.user&&<button onClick={()=>{setLibraryKind("models");setLibraryOpen(true);}}>Modelele mele</button>}<span>{effectiveSelection.manualIds.length+effectiveSelection.documentIds.length} materiale · {effectiveSelection.mode==='automatic'?'selecție automată':'selecție personalizată'} · {(effectiveSelection.priorityManualIds?.length||0)+(effectiveSelection.priorityDocumentIds?.length||0)} prioritare</span></>}</div><form className="composer" onSubmit={e => { e.preventDefault(); if (canSend) void send(draft); }}><label htmlFor="message" className="sr-only">Mesaj pentru Plusi</label><textarea id="message" ref={input} value={draft} onChange={e => setDraft(e.target.value)} maxLength={6000} placeholder="Scrie-i lui Plusi despre o lecție sau despre documentele tale..." rows={2} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia("(min-width: 768px)").matches) { e.preventDefault(); if (canSend) void send(draft); } }} /><div className="composer-bottom"><input ref={fileInput} type="file" accept=".pdf,.doc,.docx,.pptx,.txt,.md,.html" multiple className="sr-only" aria-label="Alege documentele tale" onChange={e => void uploadFiles(e.target.files)} /><button type="button" className="attach" disabled={busy || uploading} onClick={() => fileInput.current?.click()} title="PDF, Word, PowerPoint sau text · max. 10 MB"><Paperclip size={17} /> Adaugă document</button><span>{draft.length > 5500 ? `${draft.length}/6000` : ""}</span>{busy ? <button type="button" className="send" onClick={() => controller.current?.abort()} aria-label="Oprește răspunsul"><Square size={16} fill="currentColor" /></button> : <button className="send" type="submit" disabled={!canSend} aria-label="Trimite mesaj"><Send size={19} /></button>}</div></form><p className="disclaimer">Plusi poate greși. Verifică răspunsurile și sursele.</p></footer>
    </main>{editorIndex!==null&&messages[editorIndex]?.document&&<DocumentEditor document={messages[editorIndex].document!} sources={messages[editorIndex].sources||[]} onClose={()=>setEditorIndex(null)} onSave={async value=>{const next=messages.map((m,i)=>i===editorIndex?{...m,content:value.content,document:value}:m);if(account?.user)await persist(next);setMessages(next);}}/>} {libraryOpen && <LibraryPanel initialKind={libraryKind} chatId={chatId} profile={account?.user?.teaching||null} onAutomaticSelection={setAutomatic} selection={effectiveSelection} onChange={chooseSources} onClose={() => setLibraryOpen(false)} sources={messages.flatMap(m => m.sources || [])} disabled={busy || uploading} onAsk={setDraft} />}</div>;
}
