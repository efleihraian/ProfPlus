"use client";
import {useEffect, useLayoutEffect, useRef, type RefObject} from "react";

/** Indicatorul tabului activ: o bară care alunecă sub tabul ales. Fără animație la mișcare redusă. */
function place(line: HTMLElement, target: HTMLElement) {
  line.style.transform = `translate(${target.offsetLeft}px, ${target.offsetTop + target.offsetHeight - 3}px)`;
  line.style.width = target.offsetWidth + "px";
}
export default function TabIndicator({navRef, index}: {navRef: RefObject<HTMLElement | null>; index: number}) {
  const bar = useRef<HTMLSpanElement>(null), first = useRef(true);
  useLayoutEffect(() => {
    const nav = navRef.current, line = bar.current; if (!nav || !line) return;
    const target = nav.querySelectorAll<HTMLElement>(".shell-tab")[index]; if (!target) return;
    const instant = first.current || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    first.current = false;
    if (instant) line.style.transition = "none";
    place(line, target);
    if (instant) { void line.offsetWidth; line.style.transition = ""; }
    if (target.offsetLeft < nav.scrollLeft || target.offsetLeft + target.offsetWidth > nav.scrollLeft + nav.clientWidth) target.scrollIntoView({block: "nearest", inline: "center", behavior: instant ? "auto" : "smooth"});
  }, [index, navRef]);
  useEffect(() => {
    const resize = () => { const target = navRef.current?.querySelectorAll<HTMLElement>(".shell-tab")[index]; if (!target || !bar.current) return; bar.current.style.transition = "none"; place(bar.current, target); void bar.current.offsetWidth; bar.current.style.transition = ""; };
    window.addEventListener("resize", resize); return () => window.removeEventListener("resize", resize);
  }, [index, navRef]);
  return <span ref={bar} className="tab-indicator" aria-hidden="true"/>;
}
