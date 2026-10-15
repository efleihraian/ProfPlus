"use client";
import {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import Plusi from "./plusi";

/**
 * P-083: turul ghidat de Plusi la prima intrare pe o pagină.
 * Evidențiază pe rând elementele importante (spot luminos + inel pulsatoriu), iar Plusi „înoată”
 * lângă fiecare și explică. Se reține local, per browser, că turul a fost văzut; poate fi reluat.
 */
export type TourStep = {target: string; title: string; text: string};
const KEY = (id: string) => "pp-tour-" + id;
export const TOUR_EVENT = "profplus-tour";
export function tourSeen(id: string) { try { return localStorage.getItem(KEY(id)) === "done"; } catch { return true; } }
function markSeen(id: string) { try { localStorage.setItem(KEY(id), "done"); } catch { /* fără stocare: turul poate reapărea */ } }
/** Pornește din nou turul paginii (din meniul lui Plusi sau din setări). */
export function restartTour(id: string) { try { localStorage.removeItem(KEY(id)); } catch {} window.dispatchEvent(new CustomEvent(TOUR_EVENT, {detail: id})); }
export function resetAllTours() { try { for (const k of Object.keys(localStorage)) if (k.startsWith("pp-tour-")) localStorage.removeItem(k); } catch {} }

type Box = {top: number; left: number; width: number; height: number};
const PAD = 8;
const visible = (el: Element | null): el is HTMLElement => {
  if (!(el instanceof HTMLElement)) return false;
  const r = el.getBoundingClientRect(), s = getComputedStyle(el);
  return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
};

export default function PlusiTour({id, steps, active = true, delay = 900}: {id: string; steps: TourStep[]; active?: boolean; delay?: number}) {
  const [run, setRun] = useState<TourStep[] | null>(null);
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const [view, setView] = useState({w: 0, h: 0});
  const [wave, setWave] = useState(0);
  const next = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<Element | null>(null);
  const reduce = typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const start = useCallback(() => {
    const available = steps.filter(s => visible(document.querySelector(s.target)));
    if (!available.length) return;
    previousFocus.current = document.activeElement;
    setIndex(0); setRun(available); setWave(w => w + 1);
  }, [steps]);
  useEffect(() => {
    if (!active || tourSeen(id)) return;
    const timer = setTimeout(start, delay);
    return () => clearTimeout(timer);
  }, [active, id, delay, start]);
  useEffect(() => {
    const restart = (e: Event) => { if ((e as CustomEvent).detail === id && active) setTimeout(start, 150); };
    window.addEventListener(TOUR_EVENT, restart);
    return () => window.removeEventListener(TOUR_EVENT, restart);
  }, [id, active, start]);

  const step = run?.[index];
  const measure = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.target);
    setView({w: window.innerWidth, h: window.innerHeight});
    if (!visible(el)) { setBox(null); return; }
    const r = el.getBoundingClientRect();
    setBox({top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2});
  }, [step]);
  useLayoutEffect(() => {
    if (!step) return;
    const el = document.querySelector(step.target);
    if (visible(el)) {
      const r = el.getBoundingClientRect();
      if (r.top < 80 || r.bottom > window.innerHeight - 40) el.scrollIntoView({block: "center", behavior: reduce ? "auto" : "smooth"});
    }
    const frame = requestAnimationFrame(measure);
    const timer = setTimeout(measure, reduce ? 0 : 420);
    window.addEventListener("resize", measure); window.addEventListener("scroll", measure, true);
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); window.removeEventListener("resize", measure); window.removeEventListener("scroll", measure, true); };
  }, [step, measure, reduce]);
  useEffect(() => { if (step) next.current?.focus({preventScroll: true}); }, [step]);

  const finish = useCallback(() => {
    markSeen(id); setRun(null); setBox(null);
    if (previousFocus.current instanceof HTMLElement) previousFocus.current.focus({preventScroll: true});
  }, [id]);
  const go = useCallback((delta: number) => {
    if (!run) return;
    const target = index + delta;
    if (target >= run.length) { finish(); return; }
    if (target < 0) return;
    setIndex(target); setWave(w => w + 1);
  }, [run, index, finish]);
  useEffect(() => {
    if (!run) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); finish(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      else if (e.key === "Tab") {
        // Focusul rămâne în bula turului.
        const items = [...document.querySelectorAll<HTMLElement>(".plusi-tour-card [tabindex='0'], .plusi-tour-card button")];
        if (!items.length) return;
        const i = items.indexOf(document.activeElement as HTMLElement), n = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i + 1) % items.length;
        e.preventDefault(); items[n].focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [run, go, finish]);

  if (!run || !step || typeof document === "undefined") return null;
  const mobile = view.w < 640, cardW = Math.min(380, view.w - 32), cardH = Math.min(300, view.h - 32);
  let card: React.CSSProperties;
  if (mobile || !box) card = {left: 16, right: 16, bottom: 16};
  else {
    const below = box.top + box.height + 16 + cardH < view.h, above = box.top - 16 - cardH > 0;
    const left = Math.max(16, Math.min(view.w - cardW - 16, box.left + box.width / 2 - cardW / 2));
    card = below ? {left, top: box.top + box.height + 16, width: cardW} : above ? {left, top: box.top - 16 - cardH, width: cardW} : {left: Math.max(16, view.w - cardW - 24), bottom: 16, width: cardW};
  }
  const last = index === run.length - 1;
  return createPortal(<div className={"plusi-tour" + (reduce ? " still" : "")} aria-live="polite">
    <div className="plusi-tour-shade" onClick={e => e.stopPropagation()}/>
    {box ? <div className="plusi-tour-spot" style={box}><span className="plusi-tour-ring"/></div> : <div className="plusi-tour-dim"/>}
    <div className="plusi-tour-card" role="dialog" aria-modal="true" aria-labelledby={"tour-title-" + id} aria-describedby={"tour-text-" + id} style={card}>
      <div className="plusi-tour-head">
        <span className={"plusi-tour-mascot plusi-react " + (wave % 2 ? "wave" : "hop")} key={wave} aria-hidden="true"><Plusi width={64} height={60} bubbles={2} shadow={false} label=""/></span>
        <div><span className="plusi-tour-count">Pasul {index + 1} din {run.length}</span><strong id={"tour-title-" + id}>{step.title}</strong></div>
      </div>
      <p id={"tour-text-" + id} tabIndex={0} key={index}>{step.text}</p>
      <div className="plusi-tour-dots" aria-hidden="true">{run.map((_, i) => <span key={i} className={i === index ? "on" : i < index ? "done" : ""}/>)}</div>
      <div className="plusi-tour-actions">
        <button type="button" className="plusi-tour-skip" onClick={finish}>{last ? "Închide" : "Sari peste tur"}</button>
        <span>
          {index > 0 && <button type="button" className="plusi-tour-back" onClick={() => go(-1)}>Înapoi</button>}
          <button type="button" ref={next} className="plusi-tour-next" onClick={() => go(1)}>{last ? "Am înțeles!" : "Mai departe"}</button>
        </span>
      </div>
    </div>
  </div>, document.body);
}
