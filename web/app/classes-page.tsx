"use client";
import {useCallback, useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {useStored} from "./use-stored";
import type {ChatDocument} from "../lib/document-store";
import {CLASS_SECTIONS, NOTE_TAGS, classContext, classTitle, emptyJournal, type ClassJournal, type ClassNote, type ClassSection} from "../lib/class-workspace";
import {LIBRARY_ACCEPT, busyStatus, statusLabel} from "./personal-library-client";
import PlusiTour from "./plusi-tour";
import {TOURS} from "./tours";

type Cls = {id: string; g: number; l: string};
type Detail = {journal: ClassJournal; revision: number | null; documents: Record<ClassSection, ChatDocument[]>; conversations: {id: string; title: string; updatedAt: number}[]};
const R = ["P", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const today = () => new Date().toISOString().slice(0, 10);
const icon = (d: React.ReactNode, size = 16) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;
const plus = icon(<><path d="M5 12h14"/><path d="M12 5v14"/></>);
const trash = icon(<><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></>);

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, {cache: "no-store", ...init});
  let data: T & {error?: string};
  try { data = await r.json() as T & {error?: string}; } catch { throw new Error("Răspuns invalid de la server."); }
  if (!r.ok) throw new Error(data.error || "Operația a eșuat.");
  return data;
}
const jsonInit = (method: string, body: unknown): RequestInit => ({method, headers: {"Content-Type": "application/json"}, body: JSON.stringify(body)});

export default function ClassesPage({onGenerate, onOpenChat}: {onGenerate: (text: string, projectId?: string) => void; onOpenChat: (id: string) => void}) {
  const [local, setLocal] = useStored<Cls[]>("classes", []);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [remote, setRemote] = useState<Cls[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const stored = signedIn ? remote : local;
  const classes = [...stored].sort((a, b) => a.g - b.g || a.l.localeCompare(b.l));
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [grade, setGrade] = useState<number | null>(null);
  const [letter, setLetter] = useState<string | null>(null);
  const [delMode, setDelMode] = useState(false);
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const migrated = useRef(false);
  const open = classes.find(c => c.id === openId);
  const selCount = classes.filter(c => sel[c.id]).length;
  const hasG = grade !== null;
  const dup = hasG && !!letter && classes.some(c => c.g === grade && c.l === letter);
  const ready = hasG && !!letter && !dup && !busy;

  const refresh = useCallback(async () => { const data = await call<{classes: Cls[]}>("/api/classes"); setRemote(data.classes); return data.classes; }, []);
  useEffect(() => {
    void fetch("/api/account", {cache: "no-store"}).then(r => r.ok ? r.json() as Promise<{user?: {deleting?: boolean} | null}> : null).then(async data => {
      const on = !!data?.user && !data.user.deleting; setSignedIn(on);
      if (on) await refresh();
    }).catch(() => { setSignedIn(false); });
  }, [refresh]);
  // Clasele create anterior doar în acest browser se mută o singură dată în cont.
  useEffect(() => {
    if (!signedIn || migrated.current || !local.length) return;
    migrated.current = true;
    void (async () => {
      const existing = await refresh().catch(() => null); if (!existing) return;
      for (const c of local) if (!existing.some(e => e.g === c.g && e.l === c.l)) await call("/api/classes", jsonInit("POST", {g: c.g, l: c.l})).catch(() => {});
      setLocal([]); await refresh().catch(() => {});
    })();
  }, [signedIn, local, refresh, setLocal]);

  const openAdd = () => { setAdding(true); setGrade(null); setLetter(null); setDelMode(false); setSel({}); setError(""); };
  async function add() {
    if (!ready) return;
    if (!signedIn) { setLocal(p => [...p, {id: "c" + Date.now(), g: grade!, l: letter!}]); setAdding(false); return; }
    setBusy(true); setError("");
    try { await call("/api/classes", jsonInit("POST", {g: grade, l: letter})); await refresh(); setAdding(false); }
    catch (e) { setError(e instanceof Error ? e.message : "Clasa nu a putut fi adăugată."); }
    finally { setBusy(false); }
  }
  async function removeSelected() {
    const ids = classes.filter(c => sel[c.id]).map(c => c.id);
    if (!signedIn) { setLocal(p => p.filter(c => !ids.includes(c.id))); setDelMode(false); setSel({}); return; }
    setBusy(true); setError("");
    try { for (const id of ids) await call("/api/classes/" + id, {method: "DELETE"}); setDelMode(false); setSel({}); }
    catch (e) { setError(e instanceof Error ? e.message : "Ștergerea a eșuat."); }
    finally { setBusy(false); await refresh().catch(() => {}); }
  }

  return <main className="fx-page classes" style={{maxWidth: 1280, margin: "0 auto", padding: "48px 24px 80px"}}>
    <div className="classes-head">
      <div>
        {!open && <h1 className="classes-h1">Clasele la care predai</h1>}
        {open && <>
          <button type="button" className="classes-back" onClick={() => setOpenId(null)}>{icon(<><path d="M19 12H5"/><path d="m11 19-7-7 7-7"/></>)}Clasele mele</button>
          <h1 className="classes-h1">{classTitle(open.g, open.l)}</h1>
        </>}
      </div>
      {!open && <div className="classes-actions">
        {!delMode ? <>
          {!!classes.length && <button type="button" className="pp-btn pp-btn-danger" onClick={() => { setDelMode(true); setSel({}); }}>{trash}Șterge clase</button>}
          <button type="button" className="pp-btn pp-btn-dark" onClick={openAdd}>{plus}Adaugă clasă</button>
        </> : <>
          <button type="button" className="pp-btn" onClick={() => { setDelMode(false); setSel({}); }}>Anulează</button>
          <button type="button" className="pp-btn pp-btn-red" disabled={!selCount || busy} onClick={() => void removeSelected()}>{busy ? "Se șterge…" : selCount ? "Șterge (" + selCount + ")" : "Șterge"}</button>
        </>}
      </div>}
    </div>
    {error && !adding && <p className="pp-alert" role="alert">{error}</p>}
    {signedIn === false && <p className="pp-note">Clasele sunt salvate doar în acest browser. <a href="/account?view=login">Conectează-te</a> ca să le păstrezi în cont și să încarci documente, să notezi observații și să personalizezi fiecare clasă.</p>}

    {!open && <>
      {delMode && <p className="pp-alert fx-pop">Bifează clasele pe care vrei să le ștergi, apoi apasă „Șterge”.{signedIn && " Documentele încărcate în aceste clase, observațiile și personalizările se șterg definitiv; conversațiile generate rămân în istoricul Asistentului."}</p>}
      {signedIn !== null && classes.length === 0 && <div className="classes-empty">
        <span className="classes-empty-icon">{icon(<><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></>, 30)}</span>
        <h2>Nu ai adăugat încă nicio clasă</h2>
        <p>Adaugă clasele la care predai. Fiecare clasă are documentele ei (planificări, proiecte de lecție, teste, fișe), observațiile tale și personalizări pe care Plusi le folosește când generează.</p>
        <button type="button" className="pp-btn pp-btn-dark" onClick={openAdd}>+ Adaugă prima clasă</button>
      </div>}
      <div className="classes-grid">
        {classes.map(c => {
          const picked = !!sel[c.id], name = classTitle(c.g, c.l);
          return <button key={c.id} type="button" className={"class-card fx-pop" + (delMode && picked ? " picked" : "")} aria-pressed={delMode ? picked : undefined} aria-label={delMode ? "Selectează pentru ștergere: " + name : "Deschide " + name}
            onClick={() => delMode ? setSel(p => ({...p, [c.id]: !picked})) : setOpenId(c.id)}>
            {delMode && <span className="class-check">{picked && icon(<path d="M20 6 9 17l-5-5"/>, 14)}</span>}
            <span className="class-badge">{R[c.g]} {c.l}</span>
            <span><strong>{name}</strong><small>{delMode ? (picked ? "Selectată pentru ștergere" : "Apasă pentru a selecta") : "Deschide clasa →"}</small></span>
          </button>;
        })}
      </div>
    </>}

    {open && <ClassDetail key={open.id} cls={open} signedIn={!!signedIn} onGenerate={onGenerate} onOpenChat={onOpenChat}/>}

    {adding && createPortal(<div className="pp-overlay" onClick={() => setAdding(false)}>
      <div className="pp-dialog fx-pop" role="dialog" aria-modal="true" aria-labelledby="add-class-title" onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === "Escape") setAdding(false); }}>
        <div className="pp-dialog-head">
          <h2 id="add-class-title">Adaugă o clasă</h2>
          <button type="button" className="pp-icon-btn" onClick={() => setAdding(false)} aria-label="Închide">{icon(<><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>, 18)}</button>
        </div>
        <div><div className="pp-label">Clasa</div>
          <div role="group" aria-label="Alege clasa" className="pp-pick-grid" style={{gridTemplateColumns: "repeat(7, minmax(0, 1fr))"}}>
            {R.map((r, i) => <button key={r} type="button" className="pp-pick" onClick={() => setGrade(i)} aria-pressed={grade === i} title={classTitle(i, "")}>{r}</button>)}
          </div></div>
        <div><div className="pp-label">Litera</div>
          <div role="group" aria-label="Alege litera" className="pp-pick-grid" style={{gridTemplateColumns: "repeat(10, minmax(0, 1fr))"}}>
            {LETTERS.map(x => <button key={x} type="button" className="pp-pick" onClick={() => setLetter(x)} aria-pressed={letter === x}>{x}</button>)}
          </div></div>
        <div className="pp-preview">
          <span className="class-badge small">{hasG || letter ? (hasG ? R[grade!] : "?") + " " + (letter || "?") : "?"}</span>
          <span>{hasG || letter ? (hasG ? classTitle(grade!, letter || "…") : "Alege clasa") : "Alege clasa și litera"}</span>
        </div>
        {dup && <p role="alert" className="pp-error">Clasa aceasta este deja în listă.</p>}
        {error && <p role="alert" className="pp-error">{error}</p>}
        <div className="pp-dialog-actions">
          <button type="button" className="pp-btn" onClick={() => setAdding(false)}>Anulează</button>
          <button type="button" className="pp-btn pp-btn-dark" disabled={!ready} onClick={() => void add()}>{busy ? "Se adaugă…" : "Adaugă clasa"}</button>
        </div>
      </div>
    </div>, document.body)}
  </main>;
}

function ClassDetail({cls, signedIn, onGenerate, onOpenChat}: {cls: Cls; signedIn: boolean; onGenerate: (text: string, projectId?: string) => void; onOpenChat: (id: string) => void}) {
  const title = classTitle(cls.g, cls.l);
  const [view, setView] = useState<"documente" | "observatii" | "personalizari">("documente");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [topic, setTopic] = useState("");
  const load = useCallback(async () => { const data = await call<Detail>("/api/classes/" + cls.id); setDetail(data); return data; }, [cls.id]);
  useEffect(() => { if (!signedIn) return; void Promise.resolve().then(load).catch(e => setError(e instanceof Error ? e.message : "Clasa nu a putut fi încărcată.")); }, [signedIn, load]);
  useEffect(() => {
    if (!detail || !Object.values(detail.documents).flat().some(d => busyStatus(d.status))) return;
    const timer = setInterval(() => { void load().catch(() => {}); }, 4000);
    return () => clearInterval(timer);
  }, [detail, load]);
  const settings = detail?.journal.settings || emptyJournal().settings;
  async function saveJournal(journal: ClassJournal) {
    if (!detail) return false;
    setError("");
    try { const r = await call<{revision: number}>("/api/classes/" + cls.id, jsonInit("PUT", {journal, revision: detail.revision})); setDetail({...detail, journal, revision: r.revision}); return true; }
    catch (e) { setError(e instanceof Error ? e.message : "Salvarea a eșuat."); return false; }
  }
  function generate(prompt: string) {
    const context = classContext(title, settings), extra = topic.trim();
    onGenerate(`Pregătește ${prompt} pentru ${context}${extra ? `. Tema și detalii: ${extra}` : ""}.${signedIn ? " Folosește și documentele încărcate în această clasă, dacă sunt relevante." : ""}`, signedIn ? cls.id : undefined);
  }
  const tabs = [{id: "documente", label: "Documente"}, {id: "observatii", label: "Observații"}, {id: "personalizari", label: "Personalizări"}] as const;
  return <div className="fx-in class-detail">
    <PlusiTour id="clasa" steps={TOURS.clasa} delay={1100}/>
    <div className="pp-segment" role="tablist" aria-label="Secțiunile clasei">
      {tabs.map(t => <button key={t.id} type="button" role="tab" aria-selected={view === t.id} onClick={() => setView(t.id)}>{t.label}</button>)}
    </div>
    {error && <p className="pp-alert" role="alert">{error} <button type="button" className="pp-link" onClick={() => { setError(""); void load().catch(e => setError(e.message)); }}>Reîncearcă</button></p>}
    {signedIn && !detail && !error && <p className="pp-note" role="status">Se încarcă clasa…</p>}

    {view === "documente" && <>
      <div className="class-topic">
        <label htmlFor="class-topic">Tema sau detalii pentru Plusi <small>(opțional)</small></label>
        <input id="class-topic" value={topic} maxLength={300} onChange={e => setTopic(e.target.value)} placeholder="ex. Fracții echivalente, 2 ore, cu exerciții diferențiate"/>
        <small>Plusi folosește și personalizările clasei{settings.subject || settings.level ? ` (${[settings.subject, settings.level].filter(Boolean).join(", ")})` : ""}. Nu scrie date despre elevi.</small>
      </div>
      <div className="class-sections">
        {CLASS_SECTIONS.map(s => <SectionCard key={s.id} cls={cls} section={s} signedIn={signedIn} documents={detail?.documents[s.id] || []} onGenerate={() => generate(s.prompt)} onChanged={() => void load().catch(() => {})}/>)}
      </div>
      {signedIn && <section className="class-panel">
        <h2>Generate cu Plusi în această clasă</h2>
        {!detail?.conversations.length ? <p className="pp-muted">Documentele generate din această clasă apar aici; le deschizi în Asistent, le editezi și le exporți în PDF sau Word, apoi le poți încărca în secțiunea potrivită.</p>
          : <ul className="class-list">{detail.conversations.map(c => <li key={c.id}><span><strong>{c.title}</strong><small>{new Date(c.updatedAt).toLocaleDateString("ro-RO")}</small></span><button type="button" className="pp-btn" onClick={() => onOpenChat(c.id)}>Deschide</button></li>)}</ul>}
      </section>}
    </>}
    {view === "observatii" && (signedIn ? detail && <Observations notes={detail.journal.notes} onSave={notes => saveJournal({...detail.journal, notes})}/> : <p className="pp-note">Conectează-te pentru a nota observații despre clasă.</p>)}
    {view === "personalizari" && (signedIn ? detail && <Personalize value={settings} onSave={s => saveJournal({...detail.journal, settings: s})}/> : <p className="pp-note">Conectează-te pentru a personaliza clasa.</p>)}
  </div>;
}

function SectionCard({cls, section, signedIn, documents, onGenerate, onChanged}: {cls: Cls; section: typeof CLASS_SECTIONS[number]; signedIn: boolean; documents: ChatDocument[]; onGenerate: () => void; onChanged: () => void}) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false), [error, setError] = useState(""), [confirm, setConfirm] = useState("");
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true); setError("");
    try {
      for (const file of Array.from(files)) {
        if (!file.size || file.size > 10 * 1024 * 1024) throw new Error("Alege documente nevide de cel mult 10 MB.");
        const form = new FormData(); form.append("file", file); form.append("scope", "class"); form.append("classId", cls.id); form.append("section", section.id);
        await call("/api/documents", {method: "POST", body: form});
      }
      onChanged();
    } catch (e) { setError(e instanceof Error ? e.message : "Încărcarea a eșuat."); onChanged(); }
    finally { setUploading(false); if (input.current) input.current.value = ""; }
  }
  async function remove(id: string) {
    if (confirm !== id) { setConfirm(id); return; }
    setConfirm("");
    try { await call("/api/documents/" + id, {method: "DELETE"}); onChanged(); } catch (e) { setError(e instanceof Error ? e.message : "Ștergerea a eșuat."); }
  }
  return <section className="class-section">
    <div className="class-section-head">
      <span className="class-section-icon">{icon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></>, 20)}</span>
      <span><strong>{section.title}</strong><small>{section.desc}</small></span>
    </div>
    <div className="class-section-actions">
      <button type="button" className="pp-btn pp-btn-soft" onClick={onGenerate}>Generează cu Plusi</button>
      {signedIn && <><input ref={input} type="file" hidden multiple accept={LIBRARY_ACCEPT} onChange={e => void upload(e.target.files)}/>
        <button type="button" className="pp-btn" disabled={uploading || documents.length >= 10} onClick={() => input.current?.click()}>{icon(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></>, 15)}{uploading ? "Se încarcă…" : "Încarcă"}</button></>}
    </div>
    {error && <p className="pp-error" role="alert">{error}</p>}
    {!!documents.length && <ul className="class-docs">{documents.map(d => <li key={d.id} className={d.status}>
      <a href={`/api/documents/${d.id}`} target="_blank" rel="noopener noreferrer">{d.name}</a>
      <small role="status">{statusLabel(d.status).replace("folosit de Plusi", "Plusi îl folosește în conversațiile clasei")}</small>
      <button type="button" className={"pp-icon-btn" + (confirm === d.id ? " confirm" : "")} disabled={busyStatus(d.status)} onClick={() => void remove(d.id)} onBlur={() => setConfirm(c => c === d.id ? "" : c)} aria-label={(confirm === d.id ? "Confirmă ștergerea: " : "Șterge ") + d.name}>{confirm === d.id ? "Confirmă" : trash}</button>
    </li>)}</ul>}
  </section>;
}

function Observations({notes, onSave}: {notes: ClassNote[]; onSave: (notes: ClassNote[]) => Promise<boolean>}) {
  const [date, setDate] = useState(today()), [tag, setTag] = useState<ClassNote["tag"]>("lectie"), [text, setText] = useState(""), [busy, setBusy] = useState(false), [filter, setFilter] = useState<"" | ClassNote["tag"]>("");
  const sorted = [...notes].sort((a, b) => b.date.localeCompare(a.date)).filter(n => !filter || n.tag === filter);
  async function add() {
    if (!text.trim() || busy) return;
    setBusy(true);
    if (await onSave([...notes, {id: crypto.randomUUID().slice(0, 18), date, tag, text: text.trim()}])) setText("");
    setBusy(false);
  }
  return <section className="class-panel">
    <h2>Observații despre clasă</h2>
    <p className="pp-note">Notează cum au mers lecțiile, evaluările sau organizarea. Scrie observații generale despre clasă, fără nume, note sau alte date personale ale elevilor. Observațiile sunt private, în contul tău.</p>
    <div className="class-note-form">
      <label>Data<input type="date" value={date} max={today()} onChange={e => setDate(e.target.value || today())}/></label>
      <label>Tip<select value={tag} onChange={e => setTag(e.target.value as ClassNote["tag"])}>{NOTE_TAGS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></label>
      <label className="wide">Observație<textarea rows={3} maxLength={1000} value={text} onChange={e => setText(e.target.value)} placeholder="ex. Clasa a lucrat bine pe grupe; de reluat transformarea fracțiilor."/></label>
      <div className="class-note-submit"><small>{text.length}/1000</small><button type="button" className="pp-btn pp-btn-dark" disabled={!text.trim() || busy || notes.length >= 200} onClick={() => void add()}>{busy ? "Se salvează…" : "Adaugă observația"}</button></div>
    </div>
    {!!notes.length && <div className="pp-chips" role="group" aria-label="Filtrează observațiile">
      <button type="button" aria-pressed={!filter} onClick={() => setFilter("")}>Toate ({notes.length})</button>
      {NOTE_TAGS.map(t => <button key={t.id} type="button" aria-pressed={filter === t.id} onClick={() => setFilter(t.id)}>{t.label}</button>)}
    </div>}
    <ul className="class-notes">{sorted.map(n => <li key={n.id} className="fx-pop">
      <div><span className={"class-tag " + n.tag}>{NOTE_TAGS.find(t => t.id === n.tag)?.label}</span><time dateTime={n.date}>{new Date(n.date + "T12:00:00").toLocaleDateString("ro-RO", {day: "numeric", month: "long", year: "numeric"})}</time></div>
      <p>{n.text}</p>
      <button type="button" className="pp-icon-btn" aria-label="Șterge observația" disabled={busy} onClick={() => { setBusy(true); void onSave(notes.filter(x => x.id !== n.id)).finally(() => setBusy(false)); }}>{trash}</button>
    </li>)}</ul>
    {!notes.length && <p className="pp-muted">Nu ai notat încă observații pentru această clasă.</p>}
  </section>;
}

function Personalize({value, onSave}: {value: ClassJournal["settings"]; onSave: (s: ClassJournal["settings"]) => Promise<boolean>}) {
  const [s, setS] = useState(value), [busy, setBusy] = useState(false), [saved, setSaved] = useState(false);
  const set = <K extends keyof typeof s>(k: K, v: typeof s[K]) => { setS(p => ({...p, [k]: v})); setSaved(false); };
  return <section className="class-panel">
    <h2>Personalizări</h2>
    <p className="pp-note">Plusi folosește aceste setări când generează documente pentru clasă. Nu introduce date despre elevi individuali.</p>
    <div className="class-settings">
      <label>Disciplina<input value={s.subject} maxLength={80} onChange={e => set("subject", e.target.value)} placeholder="ex. Matematică"/></label>
      <label>Nivelul clasei<select value={s.level} onChange={e => set("level", e.target.value as typeof s.level)}><option value="">Nespecificat</option><option value="sprijin">Are nevoie de sprijin</option><option value="mediu">Mediu</option><option value="avansat">Avansat</option></select></label>
      <label>Număr de elevi<input type="number" min={0} max={60} value={s.students ?? ""} onChange={e => set("students", e.target.value === "" ? null : Math.max(0, Math.min(60, Math.round(Number(e.target.value)))))}/></label>
      <label>Manualul folosit<input value={s.manual} maxLength={120} onChange={e => set("manual", e.target.value)} placeholder="ex. Editura …"/></label>
      <label className="wide">Preferințe pentru documente<textarea rows={3} maxLength={600} value={s.preferences} onChange={e => set("preferences", e.target.value)} placeholder="ex. fișe pe două niveluri, exerciții scurte, fără bonus"/></label>
    </div>
    <div className="class-note-submit">{saved && <small role="status">Salvat.</small>}<button type="button" className="pp-btn pp-btn-dark" disabled={busy} onClick={() => { setBusy(true); void onSave(s).then(ok => setSaved(ok)).finally(() => setBusy(false)); }}>{busy ? "Se salvează…" : "Salvează"}</button></div>
  </section>;
}
