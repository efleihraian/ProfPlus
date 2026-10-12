"use client";
import {useState} from "react";
import {PORTFOLIO, SECTION_BADGE, usePortfolio} from "./portfolio-data";

const btn = {minHeight: 38, padding: "0 12px", borderRadius: 8, border: "1px solid #ECE6DC", background: "#FFFFFF", color: "#1F2A24", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6} as const;

export default function DocumentsPage({onGenerate}: {onGenerate: (text: string) => void}) {
  const [state, setState] = usePortfolio();
  const [open, setOpen] = useState<Record<string, boolean>>({a: true});
  const sections = PORTFOLIO.map(s => {
    const counted = s.items.filter(i => !i[3] || state.extra[i[0]]);
    const done = counted.filter(i => state.done[i[0]]).length;
    return {...s, total: counted.length, done, pct: counted.length ? Math.round(done * 100 / counted.length) : 0};
  });
  const doneAll = sections.reduce((n, s) => n + s.done, 0), totalAll = sections.reduce((n, s) => n + s.total, 0);
  const pctAll = totalAll ? Math.round(doneAll * 100 / totalAll) : 0;
  const setExtra = (id: string, on: boolean) => setState(p => ({...p, extra: {...p.extra, [id]: on}}));
  return <main className="fx-page" style={{maxWidth: 1280, margin: "0 auto", padding: "48px 24px 80px"}}>
    <div style={{display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 28}}>
      <div style={{maxWidth: 760}}>
        <h1 style={{margin: 0, fontSize: 36, fontWeight: 600, letterSpacing: -1.2, lineHeight: 1.15}}>Portofoliul tău <span style={{color: "#2F7D5B"}}>profesional</span></h1>
        <p style={{margin: "12px 0 0", color: "#55605A"}}>Din anul școlar 2026–2027 portofoliul profesional e obligatoriu pentru toate cadrele didactice (OMEC nr. 3.858/2026). Contează la definitivat, grade didactice, evaluarea anuală, inspecții și gradații de merit. Aici îl ții complet, pe cele 5 secțiuni din structura-cadru.</p>
      </div>
      <div style={{display: "flex", flexWrap: "wrap", gap: 10}}>
        <button type="button" style={{minHeight: 44, padding: "0 18px", borderRadius: 10, border: "1px solid #ECE6DC", background: "#FFFFFF", color: "#1F2A24", fontSize: 14, fontWeight: 600, cursor: "pointer"}}>Descarcă opisul</button>
        <button type="button" style={{minHeight: 44, padding: "0 18px", borderRadius: 10, border: "none", background: "#1B4D36", color: "#FFFFFF", boxShadow: "0 8px 22px rgba(27,77,54,0.28)", fontSize: 14, fontWeight: 600, cursor: "pointer"}}>Exportă portofoliul</button>
      </div>
    </div>

    <div style={{background: "#FFFFFF", border: "1px solid #ECE6DC", borderRadius: 16, padding: "20px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "20px 32px", marginBottom: 20}}>
      <div style={{flex: "1 1 280px", minWidth: 0}}>
        <div style={{display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8}}><strong style={{fontWeight: 600}}>Progres portofoliu</strong><span style={{color: "#55605A"}}>{doneAll} din {totalAll} documente obligatorii</span></div>
        <div style={{height: 10, background: "#E8F3EC", borderRadius: 999, overflow: "hidden"}}><div style={{height: "100%", width: pctAll + "%", background: "#10B981", borderRadius: 999, transition: "width .4s"}}/></div>
      </div>
      <div style={{flex: "1 1 320px", display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: "#55605A"}}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2F7D5B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{flex: "none", marginTop: 1}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h4"/></svg>
        <span>Opisul se actualizează automat, cu data fiecărui document. Documentele sunt ordonate cronologic în fiecare secțiune.</span>
      </div>
    </div>

    <div style={{display: "flex", flexDirection: "column", gap: 14}}>
      {sections.map(sec => {
        const badge = SECTION_BADGE[sec.id], isOpen = !!open[sec.id];
        return <section key={sec.id} style={{background: "#FFFFFF", border: "1px solid #ECE6DC", borderRadius: 16, overflow: "hidden"}}>
          <button type="button" className="no-lift" onClick={() => setOpen(p => ({...p, [sec.id]: !p[sec.id]}))} aria-expanded={isOpen} style={{width: "100%", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px 18px", padding: "18px 22px", background: "none", border: 0, cursor: "pointer", textAlign: "left", color: "#1F2A24"}}>
            <span style={{flex: "none", width: 40, height: 40, borderRadius: 10, background: badge.bg, color: badge.color, boxShadow: `0 6px 16px ${badge.glow}`, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 16}}>{sec.letter}</span>
            <span style={{flex: "1 1 260px", minWidth: 0, fontSize: 17, fontWeight: 600}}>{sec.title}</span>
            <span style={{display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#55605A"}}>
              <span style={{width: 110, height: 6, background: "#E8F3EC", borderRadius: 999, overflow: "hidden", display: "block"}}><span style={{display: "block", height: "100%", width: sec.pct + "%", background: "#10B981"}}/></span>
              {sec.done} / {sec.total}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s"}}><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </button>
          {isOpen && <div className="fx-pop" style={{borderTop: "1px solid #ECE6DC"}}>
            {sec.items.map(([id, name, desc, optional, gen, link, linkLabel]) => {
              const active = !optional || !!state.extra[id], ok = !!state.done[id];
              return <div key={id} style={{display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 20px", padding: "16px 22px", borderBottom: "1px solid #F5F0E8", background: active ? "#FFFFFF" : "#FBF8F3"}}>
                <div style={{flex: "1 1 340px", minWidth: 0}}>
                  <div style={{display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginBottom: 6}}>
                    {active && <span style={{fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: ok ? "#ECFDF5" : "#FEF2F2", color: ok ? "#047857" : "#B91C1C"}}>{ok ? "Adăugat" : "Lipsește"}</span>}
                    {optional === 1 && <span style={{fontSize: 12, color: "#55605A", background: "#ECE6DC", padding: "3px 10px", borderRadius: 999}}>{active ? "După caz · adăugat de tine" : "După caz"}</span>}
                  </div>
                  <strong style={{fontSize: 15, fontWeight: 600, color: active ? "#1F2A24" : "#55605A"}}>{name}</strong>
                  <div style={{fontSize: 14, color: "#6B746F", marginTop: 3}}>{desc}</div>
                </div>
                {!active && <button type="button" onClick={() => setExtra(id, true)} aria-label={"Adaugă la obligatorii: " + name} style={{minHeight: 38, padding: "0 14px", borderRadius: 999, border: "1px dashed #A3ABA6", background: "#FFFFFF", color: "#1F2A24", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>Adaugă la obligatorii</button>}
                {active && <div style={{display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 8, marginLeft: "auto"}}>
                  {optional === 1 && <button type="button" onClick={() => setExtra(id, false)} aria-label={"Scoate din obligatorii: " + name} title="Scoate din obligatorii" style={{minHeight: 38, width: 38, borderRadius: 8, border: "1px solid #ECE6DC", background: "#FFFFFF", color: "#55605A", cursor: "pointer", display: "grid", placeItems: "center"}}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14"/></svg></button>}
                  {link && <a href={link} target="_blank" rel="noopener noreferrer" style={{...btn, textDecoration: "none"}}>{linkLabel} ↗</a>}
                  {gen === 1 && <button type="button" onClick={() => onGenerate("Ajută-mă să pregătesc: " + name)} style={{...btn, border: "1px solid #BFDDCB", background: "#E8F3EC", color: "#24654A", fontWeight: 600}}>Generează cu Plusi</button>}
                  <button type="button" onClick={() => setState(p => ({...p, done: {...p.done, [id]: true}}))} style={btn}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></svg>{ok ? "Înlocuiește" : "Încarcă"}</button>
                </div>}
              </div>;
            })}
          </div>}
        </section>;
      })}
    </div>
    <p style={{margin: "18px 0 0", fontSize: 13, color: "#6B746F"}}>Lista urmează structura-cadru din Anexa 1 la OMEC nr. 3.858/2026. Este orientativă și minimală, iar școala o poate adapta prin procedura proprie. Documentele administrative (fișe de evaluare, adeverințe) se păstrează și în dosarul personal.</p>
  </main>;
}
