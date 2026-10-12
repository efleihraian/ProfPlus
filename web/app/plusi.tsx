// Plusi, foca ProfPlus: SVG-urile din designul de referință (docs/design/Main.dc.html).

type PlusiProps = {width?: number; height?: number; bubbleColor?: string; bubbles?: 0 | 2 | 3; shadow?: boolean; label?: string};

export default function Plusi({width = 210, height = 195, bubbleColor = "#9FCFB3", bubbles = 3, shadow = true, label = "Plusi, foca ProfPlus"}: PlusiProps) {
  return <svg width={width} height={height} viewBox="0 0 140 130" role={label ? "img" : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : true}>
    {bubbles > 0 && <circle className="dol-bubble" cx="130" cy="44" r="3" fill="none" stroke={bubbleColor} strokeWidth="1.5"/>}
    {bubbles > 0 && <circle className="dol-bubble b2" cx="135" cy="34" r="2.2" fill="none" stroke={bubbleColor} strokeWidth="1.5"/>}
    {bubbles > 2 && <circle className="dol-bubble b3" cx="127" cy="26" r="1.6" fill="none" stroke={bubbleColor} strokeWidth="1.5"/>}
    {shadow && <ellipse cx="74" cy="124" rx="38" ry="4" fill="#1F2A24" opacity="0.08"/>}
    <g className="dol-swim">
      <g className="dol-tail"><path d="M54 110 Q42 122 30 119 Q40 110 50 103 Z" fill="#5B7FB0"/><path d="M86 110 Q98 122 110 119 Q100 110 90 103 Z" fill="#5B7FB0"/></g>
      <ellipse cx="70" cy="92" rx="34" ry="27" fill="#7A9CC6"/>
      <g className="dol-finl"><path d="M38 86 Q24 90 18 101 Q30 103 42 96 Z" fill="#5B7FB0"/></g>
      <g className="dol-fin"><path d="M102 86 Q116 90 122 101 Q110 103 98 96 Z" fill="#5B7FB0"/></g>
      <ellipse cx="70" cy="97" rx="22" ry="18" fill="#DCE7F5"/>
      <circle cx="70" cy="54" r="30" fill="#7A9CC6"/>
      <ellipse cx="70" cy="66" rx="12" ry="8.5" fill="#DCE7F5"/>
      <g className="whisk"><path d="M59 64 Q51 61 43 61.5 M59 67.5 Q51 67.5 42 69 M60 70.5 Q53 72.5 46 76 M81 64 Q89 61 97 61.5 M81 67.5 Q89 67.5 98 69 M80 70.5 Q87 72.5 94 76" stroke="#3A4640" strokeWidth="1.6" fill="none" strokeLinecap="round"/></g>
      <ellipse cx="70" cy="62.5" rx="4.2" ry="3" fill="#1F2A24"/>
      <path d="M65.5 68 Q70 72.5 74.5 68" stroke="#1F2A24" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <g className="dol-blink"><circle cx="58" cy="49.5" r="7.8" fill="#1F2A24"/><circle cx="82" cy="49.5" r="7.8" fill="#1F2A24"/><circle cx="60.6" cy="46.4" r="2.9" fill="#FFFFFF"/><circle cx="84.6" cy="46.4" r="2.9" fill="#FFFFFF"/><circle cx="55.6" cy="52.6" r="1.3" fill="#FFFFFF"/><circle cx="79.6" cy="52.6" r="1.3" fill="#FFFFFF"/></g>
      <path d="M54 27 v7 c0 5 32 5 32 0 v-7 l-16 7 z" fill="#1F2A24"/>
      <path d="M42 22 L70 10 L98 22 L70 34 Z" fill="#1F2A24"/>
      <circle cx="70" cy="22" r="2" fill="#1B4D36"/>
      <g className="dol-tassel"><path d="M70 22 Q86 24 94 28 L94 40" stroke="#1B4D36" strokeWidth="2.2" fill="none" strokeLinecap="round"/><circle cx="94" cy="42" r="3.2" fill="#1B4D36"/></g>
    </g>
  </svg>;
}

/** Avatarul lui Plusi din conversație (calm) sau din indicatorul de căutare (swim). */
export function PlusiAvatar({swim = false}: {swim?: boolean}) {
  return <span className="plusi-avatar" aria-hidden="true">
    <svg width="42" height="39" viewBox="0 0 140 130"><g className={swim ? "dol-swim" : "dol-calm"}>
      <ellipse cx="70" cy="92" rx="34" ry="27" fill="#7A9CC6"/>
      <g className="dol-finl"><path d="M38 86 Q24 90 18 101 Q30 103 42 96 Z" fill="#5B7FB0"/></g>
      <g className="dol-fin"><path d="M102 86 Q116 90 122 101 Q110 103 98 96 Z" fill="#5B7FB0"/></g>
      <ellipse cx="70" cy="97" rx="22" ry="18" fill="#DCE7F5"/>
      <circle cx="70" cy="54" r="30" fill="#7A9CC6"/>
      <ellipse cx="70" cy="66" rx="12" ry="8.5" fill="#DCE7F5"/>
      <ellipse cx="70" cy="62.5" rx="4.5" ry="3.2" fill="#1F2A24"/>
      <path d="M59 66 Q50 63 40 64 M59 70 Q51 72 43 75 M81 66 Q90 63 100 64 M81 70 Q89 72 97 75" stroke="#3A4640" strokeWidth="2.6" fill="none" strokeLinecap="round"/>
      <g className="dol-blink"><circle cx="58" cy="49.5" r="8.5" fill="#1F2A24"/><circle cx="82" cy="49.5" r="8.5" fill="#1F2A24"/><circle cx="61" cy="46" r="3.2" fill="#FFFFFF"/><circle cx="85" cy="46" r="3.2" fill="#FFFFFF"/></g>
      <path d="M54 27 v7 c0 5 32 5 32 0 v-7 l-16 7 z" fill="#1F2A24"/>
      <path d="M42 22 L70 10 L98 22 L70 34 Z" fill="#1F2A24"/>
    </g></svg>
  </span>;
}

/** Capul mic din antetul mini-chatului de ajutor. */
export function PlusiMini() {
  return <svg width="36" height="34" viewBox="0 0 140 130" aria-hidden="true"><g className="dol-calm">
    <ellipse cx="70" cy="92" rx="34" ry="27" fill="#7A9CC6"/><circle cx="70" cy="54" r="30" fill="#7A9CC6"/><ellipse cx="70" cy="66" rx="12" ry="8.5" fill="#DCE7F5"/><ellipse cx="70" cy="62.5" rx="4.5" ry="3.2" fill="#1F2A24"/>
    <g className="dol-blink"><circle cx="58" cy="49.5" r="8.5" fill="#1F2A24"/><circle cx="82" cy="49.5" r="8.5" fill="#1F2A24"/><circle cx="61" cy="46" r="3.2" fill="#FFFFFF"/><circle cx="85" cy="46" r="3.2" fill="#FFFFFF"/></g>
    <path d="M54 27 v7 c0 5 32 5 32 0 v-7 l-16 7 z" fill="#1F2A24"/><path d="M42 22 L70 10 L98 22 L70 34 Z" fill="#1F2A24"/>
  </g></svg>;
}

/** Plusi din butonul plutitor. */
export function PlusiFloat() {
  return <svg width="84" height="78" viewBox="0 0 140 130" aria-hidden="true"><g className="dol-swim">
    <g className="dol-tail"><path d="M54 110 Q42 122 30 119 Q40 110 50 103 Z" fill="#5B7FB0"/><path d="M86 110 Q98 122 110 119 Q100 110 90 103 Z" fill="#5B7FB0"/></g>
    <ellipse cx="70" cy="92" rx="34" ry="27" fill="#7A9CC6"/>
    <g className="dol-finl"><path d="M38 86 Q24 90 18 101 Q30 103 42 96 Z" fill="#5B7FB0"/></g>
    <g className="dol-fin"><path d="M102 86 Q116 90 122 101 Q110 103 98 96 Z" fill="#5B7FB0"/></g>
    <ellipse cx="70" cy="97" rx="22" ry="18" fill="#DCE7F5"/><circle cx="70" cy="54" r="30" fill="#7A9CC6"/><ellipse cx="70" cy="66" rx="12" ry="8.5" fill="#DCE7F5"/>
    <g className="whisk"><path d="M59 66 Q50 63 40 64 M59 70 Q51 72 43 75 M81 66 Q90 63 100 64 M81 70 Q89 72 97 75" stroke="#3A4640" strokeWidth="2.4" fill="none" strokeLinecap="round"/></g>
    <ellipse cx="70" cy="62.5" rx="4.5" ry="3.2" fill="#1F2A24"/>
    <g className="dol-blink"><circle cx="58" cy="49.5" r="8" fill="#1F2A24"/><circle cx="82" cy="49.5" r="8" fill="#1F2A24"/><circle cx="60.8" cy="46.2" r="3" fill="#FFFFFF"/><circle cx="84.8" cy="46.2" r="3" fill="#FFFFFF"/></g>
    <path d="M54 27 v7 c0 5 32 5 32 0 v-7 l-16 7 z" fill="#1F2A24"/><path d="M42 22 L70 10 L98 22 L70 34 Z" fill="#1F2A24"/>
    <g className="dol-tassel"><path d="M70 22 Q86 24 94 28 L94 40" stroke="#1B4D36" strokeWidth="3" fill="none" strokeLinecap="round"/><circle cx="94" cy="42" r="4" fill="#1B4D36"/></g>
  </g></svg>;
}
