"use client";
import {useState} from "react";
import {createPortal} from "react-dom";
import {useStored} from "./use-stored";

type Cls = {id: string; g: number; l: string};
const R = ["P", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const ROMAN = ["pregătitoare", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const className = (g: number, l: string) => (g === 0 ? "Clasa pregătitoare" : g === 1 ? "Clasa I" : "Clasa a " + ROMAN[g] + "-a") + (l ? " " + l : "");
const MENU = [
  {title: "Planificări", desc: "Planificarea anuală și calendaristică a clasei."},
  {title: "Proiecte de lecție", desc: "Lecțiile pregătite pentru această clasă."},
  {title: "Teste și evaluări", desc: "Evaluări inițiale, formative și sumative."},
  {title: "Fișe de lucru", desc: "Fișe diferențiate și resurse pentru clasă."},
  {title: "Personalizări", desc: "Setări și preferințe pentru această clasă."},
];
const h1 = {margin: 0, fontSize: 36, fontWeight: 600, letterSpacing: -1.2, lineHeight: 1.15} as const;
const ghost = {minHeight: 44, padding: "0 18px", borderRadius: 10, border: "1px solid #ECE6DC", background: "#FFFFFF", color: "#1F2A24", fontSize: 14, fontWeight: 600, cursor: "pointer"} as const;
const dark = {minHeight: 44, padding: "0 20px", borderRadius: 10, border: 0, background: "#1B4D36", color: "#FFFFFF", boxShadow: "0 8px 22px rgba(27,77,54,0.28)", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8} as const;
const pick = (on: boolean) => ({border: `1px solid ${on ? "#2F7D5B" : "#ECE6DC"}`, background: on ? "#2F7D5B" : "#FFFFFF", color: on ? "#FFFFFF" : "#1F2A24"});

export default function ClassesPage() {
  const [stored, setStored] = useStored<Cls[]>("classes", []);
  const classes = [...stored].sort((a, b) => a.g - b.g || a.l.localeCompare(b.l));
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [grade, setGrade] = useState<number | null>(null);
  const [letter, setLetter] = useState<string | null>(null);
  const [delMode, setDelMode] = useState(false);
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const open = classes.find(c => c.id === openId);
  const selCount = classes.filter(c => sel[c.id]).length;
  const hasG = grade !== null;
  const dup = hasG && !!letter && classes.some(c => c.g === grade && c.l === letter);
  const ready = hasG && !!letter && !dup;
  const openAdd = () => { setAdding(true); setGrade(null); setLetter(null); setDelMode(false); setSel({}); };
  return <main className="fx-page" style={{maxWidth: 1280, margin: "0 auto", padding: "48px 24px 80px"}}>
    <div style={{display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 28}}>
      <div>
        {!open && <h1 style={h1}>Clasele la care <span style={{color: "#2F7D5B"}}>predai</span></h1>}
        {open && <>
          <button type="button" onClick={() => setOpenId(null)} style={{display: "flex", alignItems: "center", gap: 6, background: "none", border: 0, padding: "6px 0", marginBottom: 8, color: "#2F7D5B", fontSize: 14, fontWeight: 600, cursor: "pointer"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m11 19-7-7 7-7"/></svg>Clasele mele</button>
          <h1 style={h1}>{className(open.g, open.l)}</h1>
        </>}
      </div>
      {!open && <div style={{display: "flex", flexWrap: "wrap", gap: 10}}>
        {!delMode ? <>
          <button type="button" onClick={() => { setDelMode(true); setSel({}); }} style={{...ghost, border: "1px solid #FECACA", background: "#FEF2F2", color: "#B91C1C", display: "flex", alignItems: "center", gap: 8}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>Șterge clase</button>
          <button type="button" onClick={openAdd} style={dark}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>Adaugă clasă</button>
        </> : <>
          <button type="button" onClick={() => { setDelMode(false); setSel({}); }} style={ghost}>Anulează</button>
          <button type="button" disabled={!selCount} onClick={() => { setStored(p => p.filter(c => !sel[c.id])); setDelMode(false); setSel({}); }} style={{...dark, boxShadow: "none", background: selCount ? "#DC2626" : "#FCA5A5"}}>{selCount ? "Șterge (" + selCount + ")" : "Șterge"}</button>
        </>}
      </div>}
    </div>

    {!open && <>
      {delMode && <p className="fx-pop" style={{margin: "0 0 16px", padding: "12px 16px", borderRadius: 12, background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", fontSize: 14}}>Bifează clasele pe care vrei să le ștergi, apoi apasă „Șterge”.</p>}
      {classes.length === 0 && <div style={{background: "#FFFFFF", border: "1px dashed #DCD4C6", borderRadius: 20, padding: "56px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12}}>
        <span style={{width: 64, height: 64, borderRadius: 18, background: "#E8F3EC", color: "#2F7D5B", display: "grid", placeItems: "center"}}><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg></span>
        <h2 style={{margin: 0, fontSize: 20, fontWeight: 600}}>Nu ai adăugat încă nicio clasă</h2>
        <p style={{margin: 0, color: "#55605A", maxWidth: 420}}>Adaugă clasele la care predai. Fiecare clasă va avea propriul meniu, cu planificări, teste, fișe și personalizări.</p>
        <button type="button" onClick={openAdd} style={{...dark, marginTop: 6}}>+ Adaugă prima clasă</button>
      </div>}
      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16}}>
        {classes.map(c => {
          const picked = !!sel[c.id], name = className(c.g, c.l);
          return <button key={c.id} type="button" className="fx-pop" aria-pressed={delMode ? picked : undefined} aria-label={delMode ? "Selectează pentru ștergere: " + name : "Deschide " + name}
            onClick={() => delMode ? setSel(p => ({...p, [c.id]: !picked})) : setOpenId(c.id)}
            style={{position: "relative", textAlign: "left", background: "#FFFFFF", border: `2px solid ${delMode && picked ? "#DC2626" : "#ECE6DC"}`, borderRadius: 18, padding: 20, cursor: "pointer", display: "flex", flexDirection: "column", gap: 14, color: "#1F2A24", boxShadow: "0 2px 6px rgba(31,42,36,0.04)"}}>
            {delMode && <span style={{position: "absolute", top: 14, right: 14, width: 24, height: 24, borderRadius: 7, border: `2px solid ${picked ? "#DC2626" : "#DCD4C6"}`, background: picked ? "#DC2626" : "#FFFFFF", display: "grid", placeItems: "center", color: "#FFFFFF"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg></span>}
            <span style={{width: 64, height: 64, borderRadius: 16, background: "#E8F3EC", color: "#24654A", display: "grid", placeItems: "center", fontSize: 22, fontWeight: 700, letterSpacing: -0.5}}>{R[c.g]} {c.l}</span>
            <span>
              <strong style={{display: "block", fontSize: 17, fontWeight: 600}}>{name}</strong>
              <span style={{fontSize: 13, color: "#6B746F"}}>{delMode ? (picked ? "Selectată pentru ștergere" : "Apasă pentru a selecta") : "Deschide meniul clasei →"}</span>
            </span>
          </button>;
        })}
      </div>
    </>}

    {open && <div className="fx-in" style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16}}>
      {MENU.map(m => <a key={m.title} href="#clase" onClick={e => e.preventDefault()} style={{background: "#FFFFFF", border: "1px solid #ECE6DC", borderRadius: 16, padding: 20, textDecoration: "none", color: "#1F2A24", display: "flex", flexDirection: "column", gap: 10}}>
        <span style={{width: 44, height: 44, borderRadius: 12, background: "#E8F3EC", color: "#2F7D5B", display: "grid", placeItems: "center"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span>
        <strong style={{fontSize: 16, fontWeight: 600}}>{m.title}</strong>
        <span style={{fontSize: 14, color: "#6B746F"}}>{m.desc}</span>
      </a>)}
    </div>}

    {adding && createPortal(<div style={{position: "fixed", inset: 0, zIndex: 30, background: "rgba(31,42,36,0.45)", display: "grid", placeItems: "center", padding: 16}} onClick={() => setAdding(false)}>
      <div className="fx-pop" role="dialog" aria-modal="true" aria-labelledby="add-class-title" onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === "Escape") setAdding(false); }} style={{width: "100%", maxWidth: 520, background: "#FFFFFF", borderRadius: 20, boxShadow: "0 24px 60px rgba(31,42,36,0.25)", padding: 24, display: "flex", flexDirection: "column", gap: 18}}>
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12}}>
          <h2 id="add-class-title" style={{margin: 0, fontSize: 22, fontWeight: 600}}>Adaugă o clasă</h2>
          <button type="button" onClick={() => setAdding(false)} aria-label="Închide" style={{width: 36, height: 36, borderRadius: 8, border: 0, background: "#F5F0E8", color: "#55605A", cursor: "pointer", display: "grid", placeItems: "center"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
        </div>
        <div>
          <div style={{fontSize: 14, fontWeight: 600, marginBottom: 10}}>Clasa</div>
          <div role="group" aria-label="Alege clasa" style={{display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 8}}>
            {R.map((r, i) => <button key={r} type="button" onClick={() => setGrade(i)} aria-pressed={grade === i} title={className(i, "")} style={{minHeight: 44, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", ...pick(grade === i)}}>{r}</button>)}
          </div>
        </div>
        <div>
          <div style={{fontSize: 14, fontWeight: 600, marginBottom: 10}}>Litera</div>
          <div role="group" aria-label="Alege litera" style={{display: "grid", gridTemplateColumns: "repeat(10, minmax(0, 1fr))", gap: 8}}>
            {LETTERS.map(x => <button key={x} type="button" onClick={() => setLetter(x)} aria-pressed={letter === x} style={{minHeight: 44, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", ...pick(letter === x)}}>{x}</button>)}
          </div>
        </div>
        <div style={{display: "flex", alignItems: "center", gap: 12, background: "#FBF8F3", borderRadius: 12, padding: "12px 14px"}}>
          <span style={{width: 44, height: 44, borderRadius: 12, background: "#E8F3EC", color: "#24654A", display: "grid", placeItems: "center", fontWeight: 700}}>{hasG || letter ? (hasG ? R[grade!] : "?") + " " + (letter || "?") : "?"}</span>
          <span style={{fontSize: 15, color: ready ? "#1F2A24" : "#6B746F"}}>{hasG || letter ? (hasG ? className(grade!, letter || "…") : "Alege clasa") : "Alege clasa și litera"}</span>
        </div>
        {dup && <p role="alert" style={{margin: "-6px 0 0", color: "#B91C1C", fontSize: 14}}>Clasa aceasta este deja în listă.</p>}
        <div style={{display: "flex", justifyContent: "flex-end", gap: 10}}>
          <button type="button" onClick={() => setAdding(false)} style={ghost}>Anulează</button>
          <button type="button" disabled={!ready} onClick={() => { setStored(p => [...p, {id: "c" + Date.now(), g: grade!, l: letter!}]); setAdding(false); }} style={{...dark, boxShadow: "none", background: ready ? "#1B4D36" : "#9DB8A9"}}>Adaugă clasa</button>
        </div>
      </div>
    </div>, document.body)}
  </main>;
}
