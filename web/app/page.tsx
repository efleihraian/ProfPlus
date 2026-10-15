"use client";
import {useEffect, useRef, useState} from "react";
import "./shell-pages.css";
import {ThemeToggle} from "./theme-controls";
import Assistant, {type AssistantSeed} from "./assistant";
import HomePage from "./home-page";
import DocumentsPage from "./documents-page";
import ClassesPage from "./classes-page";
import HelpPlusi from "./help-plusi";
import TabSwimmer from "./tab-swimmer";
import PlusiTour from "./plusi-tour";
import {TOURS} from "./tours";

type Tab = "acasa" | "asistent" | "documente" | "clase";
const TABS: {id: Tab; label: string}[] = [
  {id: "acasa", label: "Acasă"},
  {id: "asistent", label: "Asistent virtual"},
  {id: "documente", label: "Documente personale"},
  {id: "clase", label: "Clasele mele"},
];
const order = (t: Tab) => TABS.findIndex(x => x.id === t);
const fromHash = (): Tab => TABS.find(t => t.id === window.location.hash.slice(1))?.id ?? "acasa";

export default function Home() {
  const [tab, setTab] = useState<Tab>("acasa");
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<"" | "out" | "in">("");
  const [seed, setSeed] = useState<AssistantSeed>();
  const [signedIn, setSignedIn] = useState(false);
  const [admin,setAdmin]=useState(false);
  // Direcția tranziției: pagina nouă intră din partea tabului ales.
  const [dir, setDir] = useState<"left" | "right">("right");
  const nav = useRef<HTMLElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const sync = () => { const next = fromHash(); setTab(prev => { if (prev !== next) setDir(order(next) > order(prev) ? "right" : "left"); return next; }); setReady(true); };
    sync(); window.addEventListener("hashchange", sync);
    void fetch("/api/account", {cache: "no-store"}).then(r => r.ok ? r.json() as Promise<{user?: unknown;admin?:boolean}> : null).then(data => {setSignedIn(!!data?.user);setAdmin(!!data?.admin);}).catch(() => {});
    const pending = timers.current;
    return () => { window.removeEventListener("hashchange", sync); pending.forEach(clearTimeout); };
  }, []);
  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };
  function go(next: Tab) {
    if (next === tab) return;
    setDir(order(next) > order(tab) ? "right" : "left");
    setTab(next); setPhase(next === "asistent" ? "in" : "");
    window.history.replaceState(null, "", "#" + next); window.scrollTo(0, 0);
    if (next === "asistent") later(() => setPhase(""), 900);
  }
  // Acasă → Asistent: Plusi se scufundă, pagina iese, conversația intră și mesajul pleacă.
  function ask(text: string, options: {projectId?: string; openChat?: string} = {}) {
    if (phase) return;
    const fromHome = tab === "acasa";
    const open = () => { setDir("right"); setSeed(s => ({text, n: (s?.n ?? 0) + 1, ...options})); setTab("asistent"); setPhase("in"); window.history.replaceState(null, "", "#asistent"); window.scrollTo(0, 0); later(() => setPhase(""), 900); };
    if (fromHome) { setPhase("out"); later(open, 480); } else open();
  }
  return <div className="shell">
    <header className="shell-header">
      <div className="shell-header-in">
        <a href="#acasa" className="shell-logo" aria-label="ProfPlus — acasă" onClick={e => { e.preventDefault(); go("acasa"); }}>
          <svg width="38" height="38" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#2F7D5B"/><path d="M9 25V7h7.5a5.6 5.6 0 0 1 0 11.2H12.6V25zm3.6-10h3.7a2.3 2.3 0 0 0 0-4.6h-3.7z" fill="#FFFFFF"/><path d="M24.5 19.5v7M21 23h7" stroke="#86D9AE" strokeWidth="2.8" strokeLinecap="round"/></svg>
          <span>Prof<span style={{fontWeight: 400}}>Plus</span></span>
        </a>
        <nav ref={nav} aria-label="Navigare principală" className={"shell-tabs" + (ready ? " has-indicator" : "")}>
          {TABS.map(t => <button key={t.id} type="button" className="shell-tab" aria-current={tab === t.id ? "page" : undefined} onClick={() => go(t.id)}>{t.label}</button>)}
          {ready && <TabSwimmer navRef={nav} index={order(tab)}/>}
        </nav>
        <div className="shell-account-actions"><div className="shell-theme"><ThemeToggle/></div>{admin&&<a href="/admin" className="shell-admin">Admin</a>}
          <a href={signedIn ? "/account" : "/account?view=login"} aria-label={signedIn ? "Cont și setări" : "Autentificare"} title={signedIn ? "Cont și setări" : "Autentificare"} className="shell-login">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>
            <span>{signedIn ? "Contul meu" : "Intră în cont"}</span>
          </a>
        </div>
      </div>
    </header>
    {tab !== "asistent" && <div key={"stage-" + tab} className={"tab-stage from-" + dir}>
      {tab === "acasa" && <HomePage phase={phase} onAsk={ask} onDocuments={() => go("documente")}/>}
      {tab === "documente" && <DocumentsPage onGenerate={ask}/>}
      {tab === "clase" && <ClassesPage onGenerate={(text, projectId) => ask(text, {projectId})} onOpenChat={id => ask("", {openChat: id})}/>}
    </div>}
    {(tab === "documente" || tab === "clase") && <HelpPlusi key={tab} tourId={tab} onOpenAssistant={() => go("asistent")}/>}
    {ready && <PlusiTour key={"tour-" + tab} id={tab} steps={TOURS[tab]} active={!phase} delay={tab === "asistent" ? 1500 : 1000}/>}
    {ready && <div className={"shell-assistant" + (phase === "in" ? " fx-page" : " tab-stage from-" + dir)} hidden={tab !== "asistent"}><Assistant seed={seed} splash={phase === "in"}/></div>}
  </div>;
}
