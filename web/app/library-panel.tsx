"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, ExternalLink, BookOpen } from "lucide-react";
import type { LibraryItem } from "../lib/library";
import {matchesTeaching,type TeachingProfile} from '../lib/teaching-profile';
import type { Source } from "../lib/rag";
export type Selection = { manualIds: string[]; documentIds: string[] };
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export default function LibraryPanel({ profile, selection, onChange, onClose, sources, disabled, onAsk }: { profile:TeachingProfile|null;selection: Selection; onChange: (value: Selection) => void; onClose: () => void; sources: Source[]; disabled: boolean; onAsk: (text: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<LibraryItem[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [forTeaching,setForTeaching]=useState(!!profile);
  const [query, setQuery] = useState(""), [kind, setKind] = useState("all"), [schoolClass, setSchoolClass] = useState(""), [availability, setAvailability] = useState("available"), [limit, setLimit] = useState(40);
  async function load(signal?: AbortSignal) {
    setLoading(true); setError("");
    try { const response = await fetch("/api/library", { signal }); const data = await response.json() as { items?: LibraryItem[]; warnings?: string[] }; if (!response.ok) throw new Error("Biblioteca nu este disponibilă."); setItems(data.items || []); setError((data.warnings || []).join(" ")); }
    catch (e) { if (!signal?.aborted) setError(e instanceof Error ? e.message : "Biblioteca nu este disponibilă."); }
    finally { if (!signal?.aborted) setLoading(false); }
  }
  useEffect(() => { dialog.current?.showModal(); const abort = new AbortController(); void load(abort.signal); return () => abort.abort(); }, []);
  useEffect(() => { setLimit(40); }, [query, kind, schoolClass, availability]);
  const web = useMemo(() => [...new Map(sources.filter(s => s.kind === "web").map(s => [s.url, s])).values()], [sources]);
  const filtered = items.filter(item => (!forTeaching||!profile||item.kind==='document'||matchesTeaching(item,profile)) && (kind === "all" || kind === item.kind) && (!schoolClass || item.schoolClass === schoolClass) && (availability === "all" || availability === "selected" ? (availability !== "selected" || (item.kind === "manual" ? selection.manualIds : selection.documentIds).includes(item.id)) : item.status !== "catalog") && normalize([item.title, item.schoolClass, item.subject, item.publisher].join(" ")).includes(normalize(query)));
  function toggle(item: LibraryItem) {
    const field = item.kind === "manual" ? "manualIds" : "documentIds";
    const values = selection[field]; onChange({ ...selection, [field]: values.includes(item.id) ? values.filter(id => id !== item.id) : [...values, item.id] });
  }
  return <dialog ref={dialog} className="library-dialog" onCancel={e => { e.preventDefault(); onClose(); }} aria-labelledby="library-title">
    <header className="library-header"><div><span className="eyebrow">PROFPLUS / SURSE</span><h2 id="library-title"><BookOpen size={23} /> Biblioteca de surse</h2><p>Vezi materialele și alege ce folosește AI-ul în conversație.</p></div><button onClick={onClose} aria-label="Închide biblioteca"><X size={22} /></button></header>
    <div className="library-tools"><label className="library-search"><Search size={18} /><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Caută titlu, disciplină, editură…" aria-label="Caută în bibliotecă" /></label><div className="library-filters"><select aria-label="Tipul sursei" value={kind} onChange={e => setKind(e.target.value)}><option value="all">Manuale și documente</option><option value="manual">Manuale</option><option value="document">Documente încărcate</option><option value="web">Surse web citate</option></select><select aria-label="Clasă" value={schoolClass} onChange={e => setSchoolClass(e.target.value)}><option value="">Toate clasele</option>{[...new Set(items.flatMap(i => i.schoolClass ? [i.schoolClass] : []))].map(c => <option key={c}>{c}</option>)}</select><select aria-label="Disponibilitate" value={availability} onChange={e => setAvailability(e.target.value)}><option value="available">Materiale încărcate</option><option value="all">Tot catalogul ministerului</option><option value="selected">Surse selectate</option></select></div></div>
    <label className="library-profile-filter">{profile&&<><input type="checkbox" checked={forTeaching} onChange={e=>setForTeaching(e.target.checked)}/>Arată materialele potrivite profilului meu didactic</>}</label><div className="library-selection"><span>{selection.manualIds.length} manuale · {selection.documentIds.length} documente selectate</span><button disabled={disabled} onClick={() => onChange({ manualIds: [], documentIds: [] })}>Golește selecția</button></div>
    <div className="library-content">{error && <p role="alert" className="document-error">{error} <button onClick={() => void load()}>Reîncearcă</button></p>}{loading && <p role="status">Se încarcă biblioteca…</p>}
      {kind !== "web" && <><p className="library-results">{filtered.length} materiale găsite. Cele din catalog pot fi deschise; pentru AI sunt selectabile cele indexate.</p><div className="library-grid">{filtered.slice(0, limit).map(item => {
        const selected = (item.kind === "manual" ? selection.manualIds : selection.documentIds).includes(item.id);
        return <article className={`library-card ${selected ? "selected" : ""}`} key={item.kind + item.id}><label><input type="checkbox" checked={selected} disabled={disabled || (!selected && item.status !== "ready") || (!selected && selection[item.kind === "manual" ? "manualIds" : "documentIds"].length >= (item.kind === "manual" ? 50 : 10))} onChange={() => toggle(item)} /><span>{item.kind === "manual" ? "Manual" : "Document încărcat"}</span></label><h3>{item.title}</h3><p>{[item.schoolClass, item.subject, item.publisher].filter(Boolean).join(" · ") || "Document al profesorului"}</p><div><span className={`library-status ${item.status}`}>{item.status === "ready" ? "Indexat · disponibil pentru AI" : item.status === "catalog" ? "În catalog · încă neindexat" : item.status === "indexing" || item.status === "uploading" ? "În procesare" : "Indisponibil pentru AI"}</span><a href={item.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Deschide {item.kind === "manual" ? "manualul" : "documentul"}</a></div></article>;
      })}</div>{filtered.length > limit && <button className="library-more" onClick={() => setLimit(v => v + 40)}>Arată mai multe</button>}{!loading && !filtered.length && <p>Niciun material nu corespunde filtrelor.</p>}</>}
      {kind === "web" && <><p>Surse web citate în această conversație. Le poți deschide sau cere detalii despre ele.</p>{web.filter(s => normalize(s.title + s.url).includes(normalize(query))).map(s => <article className="library-card" key={s.url}><h3>{s.title}</h3><a href={s.url} target="_blank" rel="noopener noreferrer">Deschide sursa <ExternalLink size={14} /></a><button disabled={disabled} onClick={() => { onAsk(`Explică informațiile din această sursă: ${s.url}`); onClose(); }}>Întreabă despre sursă</button></article>)}{!web.length && <p>Sursele web vor apărea după ce sunt citate de AI.</p>}</>}
    </div><footer className="library-footer"><span>Selecția se aplică următorului mesaj. Internetul poate completa informațiile lipsă.</span><button onClick={onClose}>Revino la conversație</button></footer>
  </dialog>;
}
