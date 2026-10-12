"use client";
import {useState} from "react";
import Plusi from "./plusi";
import {usePortfolioProgress} from "./portfolio-data";

const NEWS = [
  {cat: "Legislație", date: "[data]", title: "[Titlul știrii principale]", summary: "[Un rezumat de două rânduri al știrii, ca profesorul să știe imediat de ce contează.]"},
  {cat: "Examene", date: "[data]", title: "[Titlu știre]"},
  {cat: "Resurse", date: "[data]", title: "[Titlu știre]"},
];
const arrow = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>;

export default function HomePage({phase, onAsk, onDocuments}: {phase: string; onAsk: (text: string) => void; onDocuments: () => void}) {
  const [draft, setDraft] = useState("");
  const {done, total, pct} = usePortfolioProgress();
  const homeFx = phase === "out" ? "fx-out" : "";
  const diveFx = phase === "out" ? "fx-dive" : "";
  const send = () => { const text = draft.trim(); if (!text) return; onAsk(text); };
  return <main className="fx-page" style={{maxWidth: 1280, margin: "0 auto", padding: "48px 24px 80px"}}>
    <section aria-labelledby="ai-home-titlu" style={{background: "#FFFFFF", border: "1px solid #ECE6DC", borderRadius: 20, padding: 32, display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center", marginBottom: 64, boxShadow: "0 24px 60px rgba(47,125,91,0.14), 0 2px 6px rgba(31,42,36,0.04)"}}>
      <div className={diveFx} style={{flex: "1 1 220px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, borderRadius: 20, padding: "16px 8px 8px", background: "radial-gradient(circle at 50% 62%, #D6EBDD 0%, #CFE6D8 45%, rgba(255,255,255,0) 72%)"}}>
        <div className="say" style={{background: "#E8F3EC", border: "1px solid #BFDDCB", color: "#1F2A24", fontWeight: 500, fontSize: 15, padding: "10px 16px", borderRadius: 14, textAlign: "center", maxWidth: 230}}>Salut! Sunt Plusi. Cu ce te ajut azi?</div>
        <Plusi/>
      </div>
      <div className={homeFx} style={{flex: "999 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 14}}>
        <div style={{fontSize: 12, fontWeight: 600, letterSpacing: 2, color: "#1B4D36"}}>ASISTENT VIRTUAL</div>
        <h1 id="ai-home-titlu" style={{margin: 0, fontSize: 40, fontWeight: 500, letterSpacing: -1.5, lineHeight: 1.2}}>Cu ce te pot <span style={{color: "#2F7D5B"}}>ajuta</span>?</h1>
        <p style={{margin: 0, color: "#55605A"}}>Lecții, exerciții și explicații, cu surse la îndemână.</p>
        <div style={{background: "#FFFFFF", border: "1px solid #ECE6DC", borderRadius: 16, padding: "16px 18px 12px", boxShadow: "0 4px 20px rgba(31,42,36,0.027)", marginTop: 6}}>
          <label htmlFor="ai-home-input" className="sr-only">Mesaj pentru Plusi</label>
          <textarea id="ai-home-input" rows={2} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} placeholder="Întreabă despre o lecție sau despre documentele tale..." style={{display: "block", width: "100%", resize: "none", minHeight: 52, background: "transparent", border: 0, outline: 0, fontSize: 16, lineHeight: 1.6, color: "#1F2A24", padding: 0}}/>
          <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 5}}>
            <button type="button" onClick={() => onAsk("")} style={{display: "flex", alignItems: "center", gap: 7, background: "none", border: 0, color: "#55605A", fontSize: 14, padding: "8px 4px", cursor: "pointer", minHeight: 40}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              Adaugă document</button>
            <button type="button" onClick={send} aria-label="Trimite mesaj" style={{display: "grid", placeItems: "center", width: 40, height: 40, border: 0, borderRadius: 10, background: "#2F7D5B", color: "#FFFFFF", boxShadow: "0 6px 16px rgba(47,125,91,0.35)", cursor: "pointer"}}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section aria-labelledby="docs-home-titlu" className={homeFx} style={{background: "#FFFFFF", border: "1px solid #ECE6DC", borderRadius: 20, padding: 32, display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center", marginBottom: 64}}>
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
        <p style={{margin: 0, color: "#55605A", maxWidth: 680}}>Conform noii metodologii (OMEC nr. 3.858/2026), fiecare profesor trebuie să aibă un portofoliu profesional. Acesta contează la definitivat, grade didactice, evaluarea anuală, inspecții și gradații de merit. ProfPlus păstrează toate documentele din structura-cadru, pe secțiuni, cu opisul actualizat automat. Pe cele pe care le poți redacta, le generezi împreună cu Plusi.</p>
        <div style={{display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginTop: 6}}>
          <button type="button" onClick={onDocuments} style={{minHeight: 50, padding: "0 22px", borderRadius: 12, border: 0, background: "#1B4D36", color: "#FFFFFF", boxShadow: "0 8px 22px rgba(27,77,54,0.28)", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 10}}>Mergi la Documente personale{arrow}</button>
          <div style={{flex: "1 1 200px", minWidth: 180, maxWidth: 320}}>
            <div style={{fontSize: 14, color: "#55605A", marginBottom: 6}}>{done} din {total} documente adăugate</div>
            <div role="progressbar" aria-label="Progres portofoliu" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} style={{height: 8, background: "#E3E1DC", borderRadius: 999, overflow: "hidden"}}><div style={{height: "100%", width: pct + "%", background: "#2F7D5B", borderRadius: 999, transition: "width .4s"}}/></div>
          </div>
        </div>
      </div>
    </section>

    <section aria-labelledby="stiri-titlu" className={homeFx}>
      <div style={{marginBottom: 28}}>
        <h2 id="stiri-titlu" style={{margin: 0, fontSize: 36, fontWeight: 600, lineHeight: 1.15, letterSpacing: -1.2}}>Știri pentru <span style={{color: "#2F7D5B"}}>profesori</span></h2>
        <p style={{margin: "10px 0 0", maxWidth: 560, color: "#55605A"}}>Ce s-a schimbat în educație săptămâna aceasta: legislație, examene, resurse și evenimente.</p>
      </div>
      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))", gap: 24, alignItems: "stretch"}}>
        <article style={{minWidth: 0, background: "#1F2A24", color: "#FBF8F3", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column"}}>
          <div style={{height: 220, background: "#2A3A32", display: "flex", alignItems: "center", justifyContent: "center", color: "#A3ABA6", fontSize: 14}}>[Imagine știre]</div>
          <div style={{padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: 12, flex: 1}}>
            <div style={{display: "flex", gap: 12, alignItems: "center", fontSize: 13}}><span style={{color: "#DCD4C6"}}>{NEWS[0].date}</span></div>
            <h3 style={{margin: 0, fontWeight: 600, fontSize: 26, lineHeight: 1.2, letterSpacing: -0.8}}>{NEWS[0].title}</h3>
            <p style={{margin: 0, color: "#DCD4C6"}}>{NEWS[0].summary}</p>
            <a href="#" style={{color: "#9FCFB3", fontWeight: 600, textDecoration: "none", marginTop: "auto", paddingTop: 4}}>Citește articolul →</a>
          </div>
        </article>
        <div style={{minWidth: 0, display: "flex", flexDirection: "column", gap: 24}}>
          {NEWS.slice(1).map(n => <article key={n.cat} style={{flex: "1 1 0", minHeight: 180, background: "#FFFFFF", border: "1px solid #ECE6DC", borderRadius: 20, overflow: "hidden", display: "flex"}}>
            <div style={{flex: "0 0 40%", background: "#E8F3EC", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B746F", fontSize: 13}}>[Imagine]</div>
            <div style={{flex: 1, minWidth: 0, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 10}}>
              <div style={{display: "flex", gap: 10, alignItems: "center", fontSize: 13}}><span style={{color: "#6B746F"}}>{n.date}</span></div>
              <h3 style={{margin: 0, fontWeight: 600, fontSize: 20, lineHeight: 1.25, letterSpacing: -0.5}}>{n.title}</h3>
              <a href="#" style={{fontSize: 14, fontWeight: 600, textDecoration: "none", marginTop: "auto", color: "#2F7D5B"}}>Citește →</a>
            </div>
          </article>)}
          <a href="#stiri" style={{flex: "0 0 auto", minHeight: 56, borderRadius: 14, background: "#2F7D5B", color: "#FFFFFF", boxShadow: "0 10px 26px rgba(47,125,91,0.32)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", fontWeight: 600, fontSize: 15}}>Citește toate știrile →</a>
        </div>
      </div>
    </section>
  </main>;
}
