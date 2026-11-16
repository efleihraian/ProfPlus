// Formulele LaTeX simple devin text lizibil pe telefon; ce nu se poate traduce sigur rămâne scris ca în sursă.
// Fără React Native: se folosește și în textul scurt de previzualizare al documentelor.
const SYMBOLS: Record<string, string> = {
  cdot: '·', times: '×', div: '÷', pm: '±', le: '≤', leq: '≤', ge: '≥', geq: '≥', neq: '≠', ne: '≠', approx: '≈',
  in: '∈', notin: '∉', subset: '⊂', subseteq: '⊆', cup: '∪', cap: '∩', emptyset: '∅', varnothing: '∅', infty: '∞',
  pi: 'π', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', Delta: 'Δ', lambda: 'λ', mu: 'μ', sigma: 'σ', degree: '°',
  theta: 'θ', varphi: 'φ', phi: 'φ', omega: 'ω', Omega: 'Ω', varepsilon: 'ε', epsilon: 'ε', rho: 'ρ', Sigma: 'Σ',
  to: '→', rightarrow: '→', leftarrow: '←', mapsto: '↦', Rightarrow: '⇒', implies: '⇒', Leftarrow: '⇐', Leftrightarrow: '⇔', iff: '⇔',
  forall: '∀', exists: '∃', perp: '⊥', parallel: '∥', angle: '∠', triangle: '△', circ: '∘', ldots: '…', dots: '…', quad: ' ', qquad: '  ',
  lim: 'lim', sin: 'sin', cos: 'cos', tan: 'tg', tg: 'tg', cot: 'ctg', ctg: 'ctg', ln: 'ln', log: 'log', max: 'max', min: 'min',
};
const SETS: Record<string, string> = { N: 'ℕ', Z: 'ℤ', Q: 'ℚ', R: 'ℝ', C: 'ℂ' };
const SUPERSCRIPT: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', n: 'ⁿ' };
const SUBSCRIPT: Record<string, string> = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };

const script = (value: string, table: Record<string, string>) =>
  [...value].every((c) => table[c]) ? [...value].map((c) => table[c]).join('') : null;

export function readableMath(tex: string) {
  let out = tex;
  for (let i = 0; i < 3; i++) {
    out = out
      .replace(/\\(?:d|t)?frac\{([^{}]*)\}\{([^{}]*)\}/g, (_, a, b) => `${/^\w+$/.test(a) ? a : `(${a})`}/${/^\w+$/.test(b) ? b : `(${b})`}`)
      .replace(/\\sqrt\{([^{}]*)\}/g, (_, a) => (/^\w+$/.test(a) ? `√${a}` : `√(${a})`))
      .replace(/\\mathbb\{([NZQRC])\}/g, (_, s) => SETS[s])
      .replace(/\\(?:text|mathrm|mathbf|operatorname)\{([^{}]*)\}/g, '$1');
  }
  return out
    .replace(/\^\{?\\circ\}?/g, '°')
    .replace(/\\[,;: ]/g, ' ')
    .replace(/\\!/g, '')
    .replace(/\^\{([^{}]*)\}|\^(\w)/g, (m, a, b) => script(a ?? b, SUPERSCRIPT) ?? m)
    .replace(/_\{([^{}]*)\}|_(\d)/g, (m, a, b) => script(a ?? b, SUBSCRIPT) ?? m)
    .replace(/\\([A-Za-z]+)/g, (m, name) => SYMBOLS[name] ?? m)
    .replace(/\\left|\\right/g, '')
    .replace(/\\[{}]/g, (m) => m[1]);
}

/** $...$, $$...$$, \(...\) și \[...\] dintr-un text devin text lizibil. */
export const withMath = (text: string) =>
  text.replace(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$|\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g, (_, a, b, c, d) => readableMath(a ?? b ?? c ?? d));
