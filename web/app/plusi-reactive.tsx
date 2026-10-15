"use client";
import {useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode} from "react";

/** Reacțiile lui Plusi la atingere: alternează săritura cu tumbă, salutul cu flipera și scufundarea. */
const REACTIONS = ["hop", "wave", "dive"] as const;
const DURATION = 1000;
type Burst = {n: number; parts: {dx: string; dy: string; delay: string; size: string}[]};

export function usePlusiReaction() {
  const [reaction, setReaction] = useState("");
  const [burst, setBurst] = useState<Burst>({n: 0, parts: []});
  const count = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const react = useCallback(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const next = REACTIONS[count.current++ % REACTIONS.length];
    clearTimeout(timer.current);
    setReaction("");
    // Repornește animația chiar dacă aceeași reacție este cerută de două ori la rând.
    requestAnimationFrame(() => setReaction(next));
    timer.current = setTimeout(() => setReaction(""), DURATION);
    setBurst(b => ({n: b.n + 1, parts: Array.from({length: 7}, (_, i) => {
      const angle = -Math.PI / 2 + (i - 3) * 0.42 + (Math.random() - 0.5) * 0.25, dist = 34 + Math.random() * 26;
      return {dx: Math.round(Math.cos(angle) * dist) + "px", dy: Math.round(Math.sin(angle) * dist) + "px", delay: Math.round(Math.random() * 120) + "ms", size: (4 + Math.round(Math.random() * 5)) + "px"};
    })}));
  }, []);
  const bubbles = <span className="pr-bubbles" aria-hidden="true">{burst.parts.map((p, i) => <span key={burst.n + "-" + i} className="pr-bubble" style={{["--dx" as string]: p.dx, ["--dy" as string]: p.dy, animationDelay: p.delay, width: p.size, height: p.size}}/>)}</span>;
  return {reaction, react, bubbles};
}

/** Plusi apăsabil: reacționează animat și poate anunța pagina (de ex. o replică nouă). */
export default function PlusiReactive({children, label, onReact, className = "", style}: {children: ReactNode; label: string; onReact?: () => void; className?: string; style?: CSSProperties}) {
  const {reaction, react, bubbles} = usePlusiReaction();
  return <button type="button" className={"plusi-button " + className} style={style} aria-label={label} onClick={() => { react(); onReact?.(); }}>
    <span className={"plusi-react " + reaction}>{children}</span>{bubbles}
  </button>;
}
