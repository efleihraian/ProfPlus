"use client";
import {useCallback, useEffect, useId, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {COMMON_SUBJECTS, MAX_ACTIVE_ADS, TUTORING_FORMATS, TUTORING_LEVELS, formatLabel, levelLabel, priceLabel, validateTutoring, type OwnTutoringAd, type TutoringAd, type TutoringInput} from "../lib/tutoring";

type Filters = {q: string; subject: string; level: string; format: string; city: string};
const EMPTY: Filters = {q: "", subject: "", level: "", format: "", city: ""};
const blank = (name = ""): TutoringInput => ({displayName: name, title: "", subject: "", levels: [], formats: [], city: "", price: null, description: "", contactEmail: "", contactPhone: ""});
async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, {cache: "no-store", ...init});
  let d: T & {error?: string; field?: string};
  try { d = await r.json() as T & {error?: string; field?: string}; } catch { throw Object.assign(new Error("Răspuns invalid de la server."), {status: r.status}); }
  if (!r.ok) throw Object.assign(new Error(d.error || "Operația a eșuat."), {status: r.status, field: d.field});
  return d;
}
const send = (method: string, body: unknown): RequestInit => ({method, headers: {"Content-Type": "application/json"}, body: JSON.stringify(body)});
const currentTime = () => Date.now();
const day = (iso: string) => new Date(iso).toLocaleDateString("ro-RO", {day: "numeric", month: "long"});

export default function TutoringPage() {
  const [account, setAccount] = useState<{signedIn: boolean; name: string; teaching: boolean} | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters>(EMPTY);
  const [ads, setAds] = useState<TutoringAd[]>([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [mine, setMine] = useState<OwnTutoringAd[]>([]);
  const [editing, setEditing] = useState<{id?: string; value: TutoringInput} | null>(null);
  const [notice, setNotice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  // Momentul de referință pentru expirare, fixat la deschiderea paginii și la reîncărcări.
  const [now, setNow] = useState(0);
  useEffect(() => { void Promise.resolve().then(() => setNow(currentTime())); }, []);

  useEffect(() => {
    void fetch("/api/account", {cache: "no-store"}).then(r => r.ok ? r.json() as Promise<{user?: {name?: string; deleting?: boolean; teaching?: unknown} | null}> : null)
      .then(d => setAccount({signedIn: !!d?.user && !d.user.deleting, name: d?.user?.name || "", teaching: !!d?.user?.teaching}))
      .catch(() => setAccount({signedIn: false, name: "", teaching: false}));
  }, []);
  useEffect(() => {
    const c = new AbortController();
    void Promise.resolve().then(() => { setLoading(true); setError(""); });
    const params = new URLSearchParams({page: String(page)}); for (const [k, v] of Object.entries(applied)) if (v) params.set(k, v);
    void fetch("/api/tutoring?" + params, {cache: "no-store", signal: c.signal}).then(async r => {
      const d = await r.json() as {ads?: TutoringAd[]; hasMore?: boolean; error?: string};
      if (!r.ok) throw new Error(d.error || "Anunțurile nu pot fi încărcate.");
      setAds(old => page === 1 ? d.ads || [] : [...old, ...(d.ads || []).filter(a => !old.some(o => o.id === a.id))]); setMore(!!d.hasMore);
    }).catch(e => { if (e.name !== "AbortError") setError(e.message); }).finally(() => { if (!c.signal.aborted) setLoading(false); });
    return () => c.abort();
  }, [applied, page]);
  const loadMine = useCallback(async () => { const d = await call<{ads: OwnTutoringAd[]}>("/api/tutoring/mine"); setMine(d.ads); }, []);
  useEffect(() => { if (account?.signedIn) void Promise.resolve().then(loadMine).catch(() => {}); }, [account, loadMine]);
  const refresh = () => { setNow(currentTime()); setPage(1); setApplied(a => ({...a})); void loadMine().catch(() => {}); };
  const filtered = Object.values(applied).some(Boolean);
  const active = mine.filter(a => a.status === "published" && Date.parse(a.expiresAt) > now).length;

  async function act(ad: OwnTutoringAd, action: "pause" | "publish" | "renew" | "delete") {
    setNotice("");
    try {
      if (action === "delete") await call("/api/tutoring/" + ad.id, {method: "DELETE"}); else await call("/api/tutoring/" + ad.id, send("PATCH", {action}));
      setNotice(action === "delete" ? "Anunțul a fost șters." : action === "pause" ? "Anunțul este pe pauză și nu mai apare în listă." : "Anunțul este activ încă 60 de zile.");
      refresh();
    } catch (e) { setNotice(e instanceof Error ? e.message : "Operația a eșuat."); }
  }

  return <main className="fx-page tutoring" style={{maxWidth: 1280, margin: "0 auto", padding: "48px 24px 80px"}}>
    <header className="tutoring-head">
      <div>
        <h1>Meditații</h1>
        <p>Anunțuri publicate de profesori pentru elevi și părinți: disciplina, nivelul, cum se desfășoară și cât costă o oră.</p>
      </div>
      {account?.signedIn
        ? <button type="button" className="pp-btn pp-btn-dark" disabled={active >= MAX_ACTIVE_ADS || !account.teaching} title={!account.teaching ? "Completează profilul didactic din Cont" : active >= MAX_ACTIVE_ADS ? `Ai ${MAX_ACTIVE_ADS} anunțuri active` : undefined} onClick={() => setEditing({value: blank(account.name)})}>Publică un anunț</button>
        : account && <a className="pp-btn pp-btn-dark" href="/account?view=login">Intră în cont ca să publici</a>}
    </header>

    {notice && <p className="pp-note" role="status">{notice}</p>}

    {account?.signedIn && mine.length > 0 && <section className="tutoring-mine" aria-labelledby="tutoring-mine-title">
      <h2 id="tutoring-mine-title">Anunțurile tale</h2>
      <ul>{mine.map(ad => {
        const expired = Date.parse(ad.expiresAt) <= now, state = ad.status === "hidden" ? "În verificare" : ad.status === "paused" ? "Pe pauză" : expired ? "Expirat" : "Activ";
        return <li key={ad.id}>
          <span className={"tutoring-state " + (state === "Activ" ? "on" : state === "În verificare" ? "warn" : "")}>{state}</span>
          <span className="tutoring-mine-title"><strong>{ad.title}</strong><small>{ad.subject} · {state === "Activ" ? "expiră pe " + day(ad.expiresAt) : "actualizat pe " + day(ad.updatedAt)}</small></span>
          <span className="tutoring-mine-actions">
            {ad.status !== "hidden" && <button type="button" className="pp-btn" onClick={() => setEditing({id: ad.id, value: {displayName: ad.displayName, title: ad.title, subject: ad.subject, levels: ad.levels, formats: ad.formats, city: ad.city, price: ad.price, description: ad.description, contactEmail: ad.contactEmail, contactPhone: ad.contactPhone}})}>Editează</button>}
            {state === "Activ" && <button type="button" className="pp-btn" onClick={() => void act(ad, "pause")}>Pune pe pauză</button>}
            {(state === "Pe pauză" || state === "Expirat") && <button type="button" className="pp-btn" onClick={() => void act(ad, "publish")}>Reactivează</button>}
            {state === "Activ" && Date.parse(ad.expiresAt) - now < 14 * 86400000 && <button type="button" className="pp-btn" onClick={() => void act(ad, "renew")}>Prelungește</button>}
            <ConfirmDelete onConfirm={() => void act(ad, "delete")}/>
          </span>
        </li>;
      })}</ul>
    </section>}

    <div className="tutoring-layout">
      <button type="button" className="pp-btn tutoring-filters-toggle" aria-expanded={showFilters} aria-controls="tutoring-filters" onClick={() => setShowFilters(v => !v)}>{showFilters ? "Ascunde filtrele" : filtered ? "Filtre active · modifică" : "Filtrează anunțurile"}</button>
      <form id="tutoring-filters" className={"tutoring-filters" + (showFilters ? "" : " collapsed")} role="search" aria-label="Filtrează anunțurile" onSubmit={e => { e.preventDefault(); setPage(1); setApplied({...filters}); setShowFilters(false); }}>
        <label>Caută<input value={filters.q} maxLength={80} onChange={e => setFilters(f => ({...f, q: e.target.value}))} placeholder="ex. fracții, Bacalaureat"/></label>
        <label>Disciplina<input value={filters.subject} maxLength={80} list="tutoring-subjects" onChange={e => setFilters(f => ({...f, subject: e.target.value}))} placeholder="Toate"/></label>
        <label>Nivel<select value={filters.level} onChange={e => setFilters(f => ({...f, level: e.target.value}))}><option value="">Toate</option>{TUTORING_LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</select></label>
        <label>Cum<select value={filters.format} onChange={e => setFilters(f => ({...f, format: e.target.value}))}><option value="">Oricum</option>{TUTORING_FORMATS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</select></label>
        <label>Localitatea<input value={filters.city} maxLength={60} onChange={e => setFilters(f => ({...f, city: e.target.value}))} placeholder="ex. Cluj-Napoca"/></label>
        <div className="tutoring-filter-actions">
          <button type="submit" className="pp-btn pp-btn-dark">Caută</button>
          {filtered && <button type="button" className="pp-link" onClick={() => { setFilters(EMPTY); setPage(1); setApplied(EMPTY); }}>Șterge filtrele</button>}
        </div>
        <datalist id="tutoring-subjects">{COMMON_SUBJECTS.map(s => <option key={s} value={s}/>)}</datalist>
      </form>

      <section className="tutoring-results" aria-live="polite" aria-busy={loading}>
        {error && <p className="pp-alert" role="alert">{error} <button type="button" className="pp-link" onClick={refresh}>Reîncearcă</button></p>}
        {!error && !loading && !ads.length && <div className="tutoring-empty">
          <h2>{filtered ? "Niciun anunț pentru filtrele alese" : "Încă nu sunt anunțuri"}</h2>
          <p>{filtered ? "Încearcă altă disciplină sau alege „Toate” la nivel." : "Profesorii își pot publica aici meditațiile. Fii primul: anunțul apare imediat în listă."}</p>
        </div>}
        {!!ads.length && <ul className="tutoring-list">{ads.map(ad => <AdRow key={ad.id} ad={ad} open={open === ad.id} signedIn={!!account?.signedIn} onToggle={() => setOpen(o => o === ad.id ? null : ad.id)}/>)}</ul>}
        {loading && <p className="pp-muted" role="status">Se încarcă anunțurile…</p>}
        {more && !loading && <button type="button" className="pp-btn tutoring-more" onClick={() => setPage(p => p + 1)}>Mai multe anunțuri</button>}
        <p className="tutoring-disclaimer">Anunțurile sunt publicate de profesori. ProfPlus nu verifică identitatea, calificările sau prețurile și nu intermediază plăți. Pentru elevii minori, recomandăm ca părintele să stabilească primul contact. Raportează orice anunț nepotrivit.</p>
      </section>
    </div>

    {editing && <AdEditor initial={editing.value} id={editing.id} onClose={() => setEditing(null)} onSaved={msg => { setEditing(null); setNotice(msg); refresh(); }}/>}
  </main>;
}

function ConfirmDelete({onConfirm}: {onConfirm: () => void}) {
  const [armed, setArmed] = useState(false);
  return <button type="button" className={"pp-btn" + (armed ? " pp-btn-danger" : "")} onBlur={() => setArmed(false)} onClick={() => armed ? onConfirm() : setArmed(true)}>{armed ? "Confirmă ștergerea" : "Șterge"}</button>;
}

function AdRow({ad, open, signedIn, onToggle}: {ad: TutoringAd; open: boolean; signedIn: boolean; onToggle: () => void}) {
  const [contact, setContact] = useState<{email: string; phone: string} | null>(null);
  const [state, setState] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("");
  const panel = useId();
  async function reveal() { setState(""); try { setContact(await call("/api/tutoring/" + ad.id + "/contact")); } catch (e) { setState(e instanceof Error ? e.message : "Contactul nu poate fi afișat."); } }
  async function report() { try { const r = await call<{hidden: boolean}>("/api/tutoring/" + ad.id + "/report", send("POST", {reason})); setReporting(false); setState(r.hidden ? "Mulțumim. Anunțul a fost ascuns până la verificare." : "Mulțumim. Am primit raportarea."); } catch (e) { setState(e instanceof Error ? e.message : "Raportarea a eșuat."); } }
  const where = [ad.formats.map(formatLabel).join(", "), ad.city].filter(Boolean).join(" — ");
  return <li className={"tutoring-ad" + (open ? " open" : "")}>
    <button type="button" className="tutoring-ad-summary" aria-expanded={open} aria-controls={panel} onClick={onToggle}>
      <span className="tutoring-ad-main">
        <span className="tutoring-ad-subject">{ad.subject}<span className="tutoring-levels">{ad.levels.map(levelLabel).join(", ")}</span></span>
        <strong className="tutoring-ad-title">{ad.title}</strong>
        <span className="tutoring-ad-meta">{ad.displayName} · {where}</span>
      </span>
      <span className="tutoring-price">{priceLabel(ad.price)}</span>
    </button>
    {open && <div id={panel} className="tutoring-ad-detail">
      <p>{ad.description}</p>
      <div className="tutoring-contact">
        {contact ? <dl>{contact.phone && <><dt>Telefon</dt><dd><a href={"tel:" + contact.phone}>{contact.phone}</a></dd></>}{contact.email && <><dt>E-mail</dt><dd><a href={"mailto:" + contact.email}>{contact.email}</a></dd></>}</dl>
          : signedIn ? <button type="button" className="pp-btn pp-btn-dark" onClick={() => void reveal()}>Arată datele de contact</button>
          : <p className="pp-muted"><a href="/account?view=login">Intră în cont</a> ca să vezi datele de contact.</p>}
        <small>Publicat pe {day(ad.updatedAt)}</small>
      </div>
      {state && <p className="pp-note" role="status">{state}</p>}
      {signedIn && !reporting && <button type="button" className="pp-link tutoring-report" onClick={() => setReporting(true)}>Raportează anunțul</button>}
      {reporting && <div className="tutoring-report-form">
        <label>Ce nu este în regulă?<textarea rows={2} maxLength={300} value={reason} onChange={e => setReason(e.target.value)} placeholder="ex. date false, conținut nepotrivit, spam"/></label>
        <span><button type="button" className="pp-btn" onClick={() => setReporting(false)}>Renunță</button><button type="button" className="pp-btn pp-btn-danger" onClick={() => void report()}>Trimite raportarea</button></span>
      </div>}
    </div>}
  </li>;
}

function AdEditor({initial, id, onClose, onSaved}: {initial: TutoringInput; id?: string; onClose: () => void; onSaved: (message: string) => void}) {
  const [v, setV] = useState(initial), [consent, setConsent] = useState(!!id), [busy, setBusy] = useState(false), [error, setError] = useState<{field?: string; message: string} | null>(null);
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => { first.current?.focus(); const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", esc); return () => document.removeEventListener("keydown", esc); }, [onClose]);
  const set = <K extends keyof TutoringInput>(k: K, value: TutoringInput[K]) => { setV(p => ({...p, [k]: value})); if (error?.field === k) setError(null); };
  const toggle = (k: "levels" | "formats", item: string) => set(k, (v[k] as string[]).includes(item) ? (v[k] as string[]).filter(x => x !== item) as never : [...v[k], item] as never);
  const err = (f: string) => error?.field === f ? <span className="tutoring-field-error" role="alert">{error.message}</span> : null;
  async function save() {
    const check = validateTutoring(v);
    if (!check.ok) { setError({field: check.error.field, message: check.error.message}); return; }
    if (!consent) { setError({field: "consent", message: "Confirmă publicarea anunțului și a datelor de contact."}); return; }
    setBusy(true); setError(null);
    try {
      if (id) await call("/api/tutoring/" + id, send("PATCH", {action: "update", ad: check.input}));
      else await call("/api/tutoring", send("POST", {ad: check.input, consent: true}));
      onSaved(id ? "Modificările au fost salvate." : "Anunțul a fost publicat și este activ 60 de zile.");
    } catch (e) { const x = e as Error & {field?: string}; setError({field: x.field, message: x.message}); } finally { setBusy(false); }
  }
  return createPortal(<div className="pp-overlay shell-portal" onClick={onClose}>
    <div className="pp-dialog tutoring-editor fx-pop" role="dialog" aria-modal="true" aria-labelledby="tutoring-editor-title" onClick={e => e.stopPropagation()}>
      <div className="pp-dialog-head"><h2 id="tutoring-editor-title">{id ? "Editează anunțul" : "Publică un anunț de meditații"}</h2><button type="button" className="pp-icon-btn" aria-label="Închide" onClick={onClose}>✕</button></div>
      <div className="tutoring-form">
        <label>Titlu{err("title")}<input ref={first} value={v.title} maxLength={90} onChange={e => set("title", e.target.value)} placeholder="ex. Matematică pentru Evaluarea Națională, pe înțelesul elevului"/></label>
        <label>Disciplina{err("subject")}<input value={v.subject} maxLength={80} list="tutoring-subjects-form" onChange={e => set("subject", e.target.value)}/><datalist id="tutoring-subjects-form">{COMMON_SUBJECTS.map(s => <option key={s} value={s}/>)}</datalist></label>
        <fieldset><legend>Pentru cine{err("levels")}</legend><div className="pp-chips">{TUTORING_LEVELS.map(l => <button key={l.id} type="button" aria-pressed={v.levels.includes(l.id)} onClick={() => toggle("levels", l.id)}>{l.label}</button>)}</div></fieldset>
        <fieldset><legend>Cum se desfășoară{err("formats")}</legend><div className="pp-chips">{TUTORING_FORMATS.map(l => <button key={l.id} type="button" aria-pressed={v.formats.includes(l.id)} onClick={() => toggle("formats", l.id)}>{l.label}</button>)}</div></fieldset>
        <div className="tutoring-form-row">
          <label>Localitatea{err("city")}<input value={v.city} maxLength={60} onChange={e => set("city", e.target.value)} placeholder={v.formats.some(f => f !== "online") ? "Obligatoriu pentru față în față" : "Opțional"}/></label>
          <label>Preț pe oră (lei){err("price")}<input type="number" inputMode="numeric" min={0} max={1000} value={v.price ?? ""} onChange={e => set("price", e.target.value === "" ? null : Number(e.target.value))} placeholder="La cerere"/></label>
        </div>
        <label>Descriere{err("description")}<textarea rows={5} maxLength={1200} value={v.description} onChange={e => set("description", e.target.value)} placeholder="Experiența ta, cum lucrezi, ce materiale folosești, disponibilitatea. Fără linkuri sau date de contact aici."/><small>{v.description.length}/1200</small></label>
        <div className="tutoring-form-row">
          <label>Numele afișat{err("displayName")}<input value={v.displayName} maxLength={60} onChange={e => set("displayName", e.target.value)}/></label>
          <label>Telefon{err("contactPhone")}<input type="tel" value={v.contactPhone} maxLength={20} onChange={e => set("contactPhone", e.target.value)} placeholder="07xx xxx xxx"/></label>
          <label>E-mail{err("contactEmail")}<input type="email" value={v.contactEmail} maxLength={254} onChange={e => set("contactEmail", e.target.value)}/></label>
        </div>
        <label className="tutoring-consent"><input type="checkbox" checked={consent} onChange={e => { setConsent(e.target.checked); if (error?.field === "consent") setError(null); }}/><span>Sunt de acord ca anunțul să fie public în ProfPlus, iar telefonul și e-mailul să fie arătate utilizatorilor conectați. Anunțul expiră după 60 de zile; îl pot pune pe pauză sau șterge oricând.</span></label>
        {error && (!error.field || error.field === "consent") && <p className="pp-error" role="alert">{error.message}</p>}
      </div>
      <div className="pp-dialog-actions"><button type="button" className="pp-btn" onClick={onClose}>Renunță</button><button type="button" className="pp-btn pp-btn-dark" disabled={busy} onClick={() => void save()}>{busy ? "Se salvează…" : id ? "Salvează" : "Publică anunțul"}</button></div>
    </div>
  </div>, document.body);
}
