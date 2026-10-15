"use client";
import {useState} from "react";
import Plusi from "./plusi";
import PlusiReactive from "./plusi-reactive";

const LINES = ["Salut! Sunt Plusi. Cu ce te ajut azi?", "Hopa! Sunt gata de lucru.", "Îți caut ceva prin manuale?", "Scrie-mi o temă și pregătim lecția.", "Documentele des folosite le ții în biblioteca personală."];
import NewsSection from "./news-section";
import {usePortfolioProgress} from "./portfolio-data";

const arrow = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>;

export default function HomePage({phase, onAsk, onDocuments}: {phase: string; onAsk: (text: string) => void; onDocuments: () => void}) {
  const [draft, setDraft] = useState("");
  const [line, setLine] = useState(0);
  const {done, total, pct} = usePortfolioProgress();
  const homeFx = phase === "out" ? "fx-out" : "";
  const diveFx = phase === "out" ? "fx-dive" : "";
  const send = () => { const text = draft.trim(); if (!text) return; onAsk(text); };
  return <main className="fx-page" style={{maxWidth: 1280, margin: "0 auto", padding: "48px 24px 80px"}}>
    <section aria-labelledby="ai-home-titlu" style={{background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 32, display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center", marginBottom: 64, boxShadow: "0 24px 60px rgba(47,125,91,0.14), 0 2px 6px rgba(31,42,36,0.04)"}}>
      <div className={diveFx} style={{flex: "1 1 220px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, borderRadius: 20, padding: "16px 8px 8px", background: "radial-gradient(circle at 50% 62%, #D6EBDD 0%, #CFE6D8 45%, rgba(255,255,255,0) 72%)"}}>
        <div key={line} className={line ? "say say-pop" : "say"} aria-live="polite" style={{background: "#E8F3EC", border: "1px solid #BFDDCB", color: "var(--text)", fontWeight: 500, fontSize: 15, padding: "10px 16px", borderRadius: 14, textAlign: "center", maxWidth: 230}}>{LINES[line % LINES.length]}</div>
        <PlusiReactive label="Atinge-l pe Plusi" onReact={() => setLine(n => n + 1)}><Plusi label=""/></PlusiReactive>
      </div>
      <div className={homeFx} style={{flex: "999 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 14}}>
        <div style={{fontSize: 12, fontWeight: 600, letterSpacing: 2, color: "#1B4D36"}}>ASISTENT VIRTUAL</div>
        <h1 id="ai-home-titlu" style={{margin: 0, fontSize: 40, fontWeight: 500, letterSpacing: -1.5, lineHeight: 1.2}}>Cu ce te pot <span style={{color: "#2F7D5B"}}>ajuta</span>?</h1>
        <p style={{margin: 0, color: "var(--muted)"}}>Lecții, exerciții și explicații, cu surse la îndemână.</p>
        <div style={{background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 18px 12px", boxShadow: "0 4px 20px rgba(31,42,36,0.027)", marginTop: 6}}>
          <label htmlFor="ai-home-input" className="sr-only">Mesaj pentru Plusi</label>
          <textarea id="ai-home-input" rows={2} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} placeholder="Întreabă despre o lecție sau despre documentele tale..." style={{display: "block", width: "100%", resize: "none", minHeight: 52, background: "transparent", border: 0, outline: 0, fontSize: 16, lineHeight: 1.6, color: "var(--text)", padding: 0}}/>
          <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 5}}>
            <button type="button" onClick={() => onAsk("")} style={{display: "flex", alignItems: "center", gap: 7, background: "none", border: 0, color: "var(--muted)", fontSize: 14, padding: "8px 4px", cursor: "pointer", minHeight: 40}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              Adaugă document</button>
            <button type="button" onClick={send} aria-label="Trimite mesaj" style={{display: "grid", placeItems: "center", width: 40, height: 40, border: 0, borderRadius: 10, background: "#2F7D5B", color: "#FFFFFF", boxShadow: "0 6px 16px rgba(47,125,91,0.35)", cursor: "pointer"}}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section aria-labelledby="docs-home-titlu" className={homeFx} style={{background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 32, display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center", marginBottom: 64}}>
      <div style={{flex: "1 1 260px", background: "#E8F3EC", borderRadius: 16, minHeight: 220, display: "grid", placeItems: "center"}}>
        <svg width="210" height="170" viewBox="0 0 210 170" aria-hidden="true">
          <rect x="36" y="34" width="110" height="128" rx="12" fill="#BFDDCB" transform="rotate(-8 91 98)"/>
          <rect x="56" y="22" width="110" height="128" rx="12" fill="#D6EBDD" transform="rotate(4 111 86)"/>
          <rect x="60" y="18" width="110" height="132" rx="12" fill="#FFFFFF" stroke="#BFDDCB" strokeWidth="2"/>
          <rect x="76" y="36" width="40" height="8" rx="4" fill="#2F7D5B"/>
          <path d="M76 60h78M76 76h78M76 92h60M76 108h70M76 124h50" stroke="#DCD4C6" strokeWidth="5" strokeLinecap="round"/>
          <circle cx="164" cy="134" r="22" fill="#1B4D36"/>
          <path d="m154 134 7 7 13-14" stroke="#FFFFFF" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{flex: "999 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 14}}>
        <div style={{display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10}}><span style={{fontSize: 12, fontWeight: 600, letterSpacing: 2, color: "#1B4D36"}}>DOCUMENTE PERSONALE</span><span style={{fontSize: 12, fontWeight: 600, color: "#047857", background: "#ECFDF5", padding: "3px 9px", borderRadius: 999}}>Obligatoriu din 2026–2027</span></div>
        <h2 id="docs-home-titlu" style={{margin: 0, fontSize: 34, fontWeight: 600, letterSpacing: -1.2, lineHeight: 1.15}}>Portofoliul profesional, mereu <span style={{color: "#2F7D5B"}}>în ordine</span></h2>
        <p style={{margin: 0, color: "var(--muted)", maxWidth: 680}}>Conform noii metodologii (OMEC nr. 3.858/2026), fiecare profesor trebuie să aibă un portofoliu profesional. Acesta contează la definitivat, grade didactice, evaluarea anuală, inspecții și gradații de merit. ProfPlus păstrează toate documentele din structura-cadru, pe secțiuni, cu opisul actualizat automat. Pe cele pe care le poți redacta, le generezi împreună cu Plusi.</p>
        <div style={{display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginTop: 6}}>
          <button type="button" onClick={onDocuments} style={{minHeight: 50, padding: "0 22px", borderRadius: 12, border: 0, background: "#1B4D36", color: "#FFFFFF", boxShadow: "0 8px 22px rgba(27,77,54,0.28)", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 10}}>Mergi la Documente personale{arrow}</button>
          <div style={{flex: "1 1 200px", minWidth: 180, maxWidth: 320}}>
            <div style={{fontSize: 14, color: "var(--muted)", marginBottom: 6}}>{done} din {total} documente adăugate</div>
            <div role="progressbar" aria-label="Progres portofoliu" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} style={{height: 8, background: "#E3E1DC", borderRadius: 999, overflow: "hidden"}}><div style={{height: "100%", width: pct + "%", background: "#2F7D5B", borderRadius: 999, transition: "width .4s"}}/></div>
          </div>
        </div>
      </div>
    </section>

    <div className={homeFx}><NewsSection/></div>
  </main>;
}
