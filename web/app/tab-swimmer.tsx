"use client";
import {useEffect, useLayoutEffect, useRef, type RefObject} from "react";
import {PlusiMini} from "./plusi";

/**
 * Indicatorul tabului activ alunecă spre tabul nou, iar Plusi înoată deasupra lui și se scufundă
 * cu un val la destinație. Fără animație când utilizatorul preferă mișcare redusă.
 */
function place(line: HTMLElement, target: HTMLElement) {
  line.style.transform = `translate(${target.offsetLeft}px, ${target.offsetTop + target.offsetHeight - 3}px)`;
  line.style.width = target.offsetWidth + "px";
}

export default function TabSwimmer({navRef, index}: {navRef: RefObject<HTMLElement | null>; index: number}) {
  const bar = useRef<HTMLSpanElement>(null), swimmer = useRef<HTMLSpanElement>(null), ripple = useRef<HTMLSpanElement>(null), previous = useRef<number | null>(null);
  useLayoutEffect(() => {
    const nav = navRef.current, line = bar.current; if (!nav || !line) return;
    const tabs = nav.querySelectorAll<HTMLElement>(".shell-tab"), target = tabs[index]; if (!target) return;
    const from = previous.current; previous.current = index;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (from === null || reduce) line.style.transition = "none";
    place(line, target);
    if (from === null || reduce) { void line.offsetWidth; line.style.transition = ""; }
    const start = tabs[from ?? -1];
    if (from === null || from === index || reduce || !start || !swimmer.current?.animate) return;
    if (target.offsetLeft < nav.scrollLeft || target.offsetLeft + target.offsetWidth > nav.scrollLeft + nav.clientWidth) target.scrollIntoView({block: "nearest", inline: "center", behavior: "smooth"});
    // Pe ecrane înguste tab-urile pot fi pe două rânduri: poziția include și rândul.
    const x0 = start.offsetLeft + start.offsetWidth / 2 - 15, x1 = target.offsetLeft + target.offsetWidth / 2 - 15, dir = x1 >= x0 ? 1 : -1, mid = (x0 + x1) / 2;
    const y0 = start.offsetTop + start.offsetHeight - 32, y1 = target.offsetTop + target.offsetHeight - 32, ym = Math.min(y0, y1) - 10;
    swimmer.current.animate([
      {transform: `translate(${x0}px, ${y0 + 14}px) rotate(${-25 * dir}deg) scale(.6)`, opacity: 0},
      {transform: `translate(${x0 + 6 * dir}px, ${y0}px) rotate(${-14 * dir}deg) scale(1)`, opacity: 1, offset: .16},
      {transform: `translate(${mid}px, ${ym}px) rotate(${10 * dir}deg) scale(1.05)`, opacity: 1, offset: .5},
      {transform: `translate(${x1 - 4 * dir}px, ${y1 - 2}px) rotate(${-6 * dir}deg) scale(1)`, opacity: 1, offset: .8},
      {transform: `translate(${x1}px, ${y1 + 16}px) rotate(${32 * dir}deg) scale(.55)`, opacity: 0},
    ], {duration: 950, easing: "cubic-bezier(.45,.05,.35,1)"});
    ripple.current?.animate([
      {transform: `translate(${x1 - 3}px, ${y1 + 26}px) scale(.2)`, opacity: 0},
      {transform: `translate(${x1 - 3}px, ${y1 + 26}px) scale(.4)`, opacity: .9, offset: .3},
      {transform: `translate(${x1 - 3}px, ${y1 + 26}px) scale(1.6)`, opacity: 0},
    ], {duration: 600, delay: 760, easing: "ease-out", fill: "backwards"});
  }, [index, navRef]);
  useEffect(() => {
    const resize = () => { const target = navRef.current?.querySelectorAll<HTMLElement>(".shell-tab")[index]; if (!target || !bar.current) return; bar.current.style.transition = "none"; place(bar.current, target); void bar.current.offsetWidth; bar.current.style.transition = ""; };
    window.addEventListener("resize", resize); return () => window.removeEventListener("resize", resize);
  }, [index, navRef]);
  return <>
    <span ref={bar} className="tab-indicator" aria-hidden="true"/>
    <span ref={ripple} className="tab-ripple" aria-hidden="true"/>
    <span ref={swimmer} className="tab-swimmer" aria-hidden="true"><PlusiMini/></span>
  </>;
}
