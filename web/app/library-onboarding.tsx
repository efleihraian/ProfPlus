"use client";
import {useEffect, useState} from "react";
import Plusi from "./plusi";
import PersonalLibrary from "./personal-library";
import {listPersonalLibrary, markPromptAnswered, promptAnswered} from "./personal-library-client";

/**
 * Prima deschidere a asistentului (cont autentificat): Plusi întreabă dacă profesorul are documente
 * folosite des și oferă adăugarea lor în biblioteca personală. Nu apare dacă biblioteca are deja documente
 * sau dacă profesorul a răspuns în acest browser.
 */
export default function LibraryOnboarding({onSourcesChanged}: {onSourcesChanged: () => void}) {
  const [state, setState] = useState<"hidden" | "ask" | "add" | "leaving">("hidden");
  useEffect(() => {
    if (promptAnswered()) return;
    const abort = new AbortController();
    void listPersonalLibrary(abort.signal).then(data => {
      if (data.documents.length) markPromptAnswered(); else setState("ask");
    }).catch(() => { /* fără răspuns de la server nu deranjăm conversația */ });
    return () => abort.abort();
  }, []);
  useEffect(() => {
    if (state !== "leaving") return;
    const timer = setTimeout(() => setState("hidden"), 420);
    return () => clearTimeout(timer);
  }, [state]);
  if (state === "hidden") return null;
  const close = () => { markPromptAnswered(); setState("leaving"); };
  return <div className={"library-onboarding" + (state === "leaving" ? " leaving" : "")} role="region" aria-label="Biblioteca ta personală">
    <div className="library-onboarding-plusi" aria-hidden="true"><span className="plusi-react wave"><Plusi width={96} height={89} bubbles={2} shadow={false} label=""/></span></div>
    <div className="library-onboarding-body">
      <strong>Ai documente pe care le folosești des?</strong>
      {state !== "add" ? <>
        <p>Planificări, modele de teste, fișe sau materiale proprii: adaugă-le în biblioteca ta personală și le voi consulta în toate conversațiile, fără să le încarci de fiecare dată.</p>
        <div className="library-onboarding-actions">
          <button type="button" className="library-onboarding-yes" onClick={() => setState("add")}>Da, le adaug acum</button>
          <button type="button" className="library-onboarding-no" onClick={close}>Nu acum</button>
        </div>
        <small>Le poți adăuga oricând din <a href="/account?view=library">Cont → Bibliotecă personală</a>.</small>
      </> : <>
        <PersonalLibrary compact onChange={onSourcesChanged}/>
        <div className="library-onboarding-actions">
          <button type="button" className="library-onboarding-yes" onClick={close}>Am terminat</button>
          <a href="/account?view=library">Gestionează în Cont</a>
        </div>
      </>}
    </div>
    <button type="button" className="library-onboarding-close" aria-label="Închide întrebarea despre biblioteca personală" onClick={close}>×</button>
  </div>;
}
