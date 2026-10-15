"use client";
import {useEffect, useRef, useState} from "react";
import {PlusiFloat, PlusiMini} from "./plusi";
import {usePlusiReaction} from "./plusi-reactive";
import {restartTour} from "./plusi-tour";

const TOPICS = ["Cum încarc un document?", "Ce înseamnă „după caz”?", "Cum generez un document cu Plusi?", "Ce este opisul?"];
function answer(q: string) {
  const t = q.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const has = (...w: string[]) => w.some(x => t.includes(x));
  if (has("dupa caz", "optional", "facultativ", "adaug la obligatorii", "obligatori")) return "Documentele „după caz” apar estompate și nu intră în progres. Dacă ți se aplică, apasă „+ Adaugă la obligatorii”: devin evidențiate și sunt numărate în bara de progres. Le poți scoate oricând cu butonul „−”.";
  if (has("opis", "export", "descarc")) return "„Descarcă opisul” îți dă lista tuturor documentelor din portofoliu, cu data fiecăruia. „Exportă portofoliul” descarcă documentele, ordonate pe cele 5 secțiuni din structura-cadru.";
  if (has("genere", "generez", "redact", "creez", "fac un")) return "La documentele pe care le poți redacta apare „Generează cu Plusi”. Te duce în Asistentul virtual cu cererea deja scrisă. Ciorna se deschide în editor, de unde o exporți în PDF sau Word și apoi o încarci în portofoliu.";
  if (has("progres", "bara", "procent")) return "Bara de progres numără doar documentele obligatorii, plus cele „după caz” pe care le-ai adăugat tu. Fiecare secțiune are și propriul contor.";
  if (has("incarc", "upload", "fisier", "pdf", "word")) return "Apasă „Încarcă” pe rândul documentului. Eticheta trece din „Lipsește” în „Adăugat”, iar progresul se actualizează. Dacă ai o versiune nouă, același buton devine „Înlocuiește”.";
  if (has("europass", "cv")) return "Pentru CV, butonul „Editor Europass” deschide editorul oficial Europass. Îl completezi acolo, îl descarci și apoi îl încarci la rândul „Curriculum vitae”.";
  if (has("portofoliu", "lege", "ordin", "3.858", "3858", "structura")) return "Din anul școlar 2026–2027 portofoliul profesional e obligatoriu (OMEC nr. 3.858/2026). În Documente personale ai toate documentele din structura-cadru, împărțite pe 5 secțiuni, cu progresul și opisul ținute la zi.";
  if (has("clase", "clasele", "catalog", "elev", "note")) return "În „Clasele mele” adaugi clasele la care predai. Pentru fiecare clasă generezi cu Plusi și încarci planificări, proiecte de lecție, teste și fișe, notezi observații generale despre clasă și setezi personalizări (disciplină, nivel, manual) pe care Plusi le folosește. Nu nota date personale ale elevilor.";
  if (has("meditat", "anunt", "elevi particular")) return "În tabul „Meditații” găsești anunțurile profesorilor și îți publici propriul anunț (până la trei active, câte 60 de zile). Datele de contact se văd doar de utilizatorii conectați; orice anunț nepotrivit se poate raporta.";
  if (has("asistent", "chat", "intreb", "lectie", "manual")) return "Pentru lecții, exerciții și explicații folosește Asistentul virtual. Răspunde din manuale și din documentele tale, cu surse pe care le poți verifica.";
  return "Te pot ajuta cu Documentele personale (încărcare, documente „după caz”, opis, export), cu generarea documentelor și cu Asistentul virtual. Încearcă una dintre întrebările de mai sus sau reformulează.";
}
const BURSTS: [string, string, string, string][] = [["12%", "10%", "-14px", "-12px"], ["45%", "-4px", "0px", "-18px"], ["82%", "8%", "14px", "-12px"], ["8%", "70%", "-16px", "8px"], ["50%", "85%", "2px", "14px"], ["88%", "70%", "16px", "8px"]];
const menuItem = {width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 10, border: 0, borderRadius: 10, background: "transparent", cursor: "pointer", textAlign: "left", color: "var(--pp-text)"} as const;
const icon = (bg: string, color: string, d: React.ReactNode) => <span style={{flex: "none", width: 36, height: 36, borderRadius: 10, background: bg, color, display: "grid", placeItems: "center"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg></span>;

export default function HelpPlusi({onOpenAssistant, tourId}: {onOpenAssistant: () => void; tourId?: string}) {
  const [hintDone, setHintDone] = useState(false);
  const [menu, setMenu] = useState(false);
  const [chat, setChat] = useState(false);
  const [msgs, setMsgs] = useState<{role: "user" | "bot"; text: string}[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const {reaction, react, bubbles} = usePlusiReaction();
  useEffect(() => () => clearTimeout(timer.current), []);
  function ask(text: string) {
    const q = text.trim(); if (!q) return;
    setMsgs(p => [...p, {role: "user", text: q}]); setDraft(""); setTyping(true);
    timer.current = setTimeout(() => { setTyping(false); setMsgs(p => [...p, {role: "bot", text: answer(q)}]); }, 900);
  }
  function openChat() {
    setMenu(false); setChat(true);
    if (!msgs.length) setMsgs([{role: "bot", text: "Salut! Sunt Plusi. Te ajut să te descurci în ProfPlus. Alege o întrebare sau scrie-mi."}]);
  }
  const showHint = !hintDone && !menu && !chat;
  return <div className="float-plusi" style={{position: "fixed", right: 24, bottom: 24, zIndex: 5, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12}}>
    {chat && <div className="fx-pop" role="dialog" aria-label="Ajutor ProfPlus" style={{width: 340, maxWidth: "calc(100vw - 48px)", height: 460, background: "var(--pp-surface)", border: "1px solid var(--pp-border)", borderRadius: 18, boxShadow: "0 16px 40px rgba(31,42,36,0.16)", display: "flex", flexDirection: "column", overflow: "hidden"}}>
      <div style={{display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: "1px solid var(--pp-border)", background: "var(--pp-soft)"}}>
        <PlusiMini/>
        <div style={{flex: 1, minWidth: 0}}><strong style={{display: "block", fontSize: 14, fontWeight: 600}}>Plusi · ajutor</strong><span style={{fontSize: 12, color: "var(--pp-muted)"}}>Cum funcționează ProfPlus</span></div>
        <button type="button" onClick={() => { setChat(false); setMenu(false); }} aria-label="Închide ajutorul" style={{width: 36, height: 36, borderRadius: 8, border: 0, background: "transparent", color: "var(--pp-muted)", cursor: "pointer", display: "grid", placeItems: "center"}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
      </div>
      <div role="log" aria-live="polite" style={{flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10, background: "var(--pp-surface)"}}>
        {msgs.map((m, i) => <div key={i} className="fx-pop" style={{alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", background: m.role === "user" ? "#2F7D5B" : "var(--pp-soft)", color: m.role === "user" ? "#FFFFFF" : "var(--pp-text)", borderRadius: m.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px", padding: "10px 13px", fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap"}}>{m.text}</div>)}
        {typing && <div style={{alignSelf: "flex-start", display: "flex", gap: 5, padding: "12px 14px", background: "var(--pp-soft)", borderRadius: "4px 14px 14px 14px"}}><span className="dot"/><span className="dot d2"/><span className="dot d3"/></div>}
        {msgs.length <= 1 && !typing && <div style={{display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2}}>
          {TOPICS.map(q => <button key={q} type="button" onClick={() => ask(q)} style={{border: "1px solid var(--pp-soft-border)", background: "var(--pp-surface)", color: "var(--pp-soft-text)", borderRadius: 999, padding: "6px 11px", fontSize: 13, cursor: "pointer", textAlign: "left"}}>{q}</button>)}
        </div>}
      </div>
      <div style={{display: "flex", gap: 8, padding: "10px 12px", borderTop: "1px solid var(--pp-border)"}}>
        <label htmlFor="help-input" className="sr-only">Întrebare pentru Plusi</label>
        <input id="help-input" value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); ask(draft); } }} placeholder="Întreabă despre ProfPlus..." style={{flex: 1, minWidth: 0, border: "1px solid var(--pp-border)", borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none", color: "var(--pp-text)", background: "var(--pp-surface)"}}/>
        <button type="button" onClick={() => ask(draft)} aria-label="Trimite întrebarea" style={{width: 40, height: 40, borderRadius: 10, border: 0, background: "#2F7D5B", color: "#FFFFFF", cursor: "pointer", display: "grid", placeItems: "center", flex: "none"}}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></button>
      </div>
    </div>}

    {menu && <div className="fx-pop" role="menu" aria-label="Cum te poate ajuta Plusi" style={{width: 290, background: "var(--pp-surface)", border: "1px solid var(--pp-border)", borderRadius: 16, boxShadow: "0 12px 32px rgba(31,42,36,0.14)", padding: 8}}>
      <div style={{padding: "8px 10px 10px", fontSize: 14, fontWeight: 600}}>Cum te pot ajuta?</div>
      <button type="button" role="menuitem" className="float-menu-item" onClick={() => { setMenu(false); onOpenAssistant(); }} style={menuItem}>
        {icon("#E8F3EC", "#2F7D5B", <><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></>)}
        <span><strong style={{display: "block", fontSize: 14, fontWeight: 600}}>Deschide Asistentul virtual</strong><span style={{fontSize: 13, color: "var(--pp-muted)"}}>Lecții, explicații și documente</span></span>
      </button>
      {tourId && <button type="button" role="menuitem" className="float-menu-item" onClick={() => { setMenu(false); restartTour(tourId); }} style={menuItem}>
        {icon("var(--pp-soft)", "var(--pp-accent-text)", <><circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4z"/></>)}
        <span><strong style={{display: "block", fontSize: 14, fontWeight: 600}}>Arată-mi turul paginii</strong><span style={{fontSize: 13, color: "var(--pp-muted)"}}>Plusi îți arată pe rând ce poți face aici</span></span>
      </button>}
      <button type="button" role="menuitem" className="float-menu-item" onClick={openChat} style={menuItem}>
        {icon("#ECFDF5", "#047857", <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>)}
        <span><strong style={{display: "block", fontSize: 14, fontWeight: 600}}>Întreabă-l aici</strong><span style={{fontSize: 13, color: "var(--pp-muted)"}}>Cum funcționează ProfPlus</span></span>
      </button>
    </div>}

    <div style={{display: "flex", alignItems: "flex-end", gap: 6}}>
      {showHint && <span style={{position: "relative", display: "block", marginBottom: 70, pointerEvents: "none"}}>
        <span className="hint-pop" style={{display: "block", background: "var(--pp-surface)", border: "1px solid var(--pp-soft-border)", color: "var(--pp-text)", fontSize: 14, fontWeight: 500, padding: "8px 12px", borderRadius: 12, boxShadow: "0 4px 14px rgba(31,42,36,0.08)", whiteSpace: "nowrap"}}>Ai nevoie de ajutor?</span>
        {BURSTS.map(([left, top, dx, dy]) => <span key={left + top} className="burst" style={{left, top, ["--dx" as string]: dx, ["--dy" as string]: dy}}/>)}
      </span>}
      <button type="button" className="plusi-button float-plusi-button" onClick={() => { react(); setMenu(m => !m && !chat); setChat(false); setHintDone(true); }} aria-label="Plusi: opțiuni de ajutor" aria-expanded={menu} style={{background: "none", border: 0, padding: 0, cursor: "pointer", borderRadius: "50%", position: "relative"}}>
        <span className="float-splash-ring" aria-hidden="true"/>
        <span style={{width: 96, height: 96, borderRadius: "50%", background: "var(--pp-soft)", border: "2px solid var(--pp-soft-border)", display: "grid", placeItems: "center", boxShadow: "0 8px 24px rgba(47,125,91,0.18)"}}><span className={"plusi-react " + reaction}><PlusiFloat/></span></span>{bubbles}
      </button>
    </div>
  </div>;
}
