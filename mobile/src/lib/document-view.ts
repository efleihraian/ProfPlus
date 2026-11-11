// Textul unui document generat, pentru afișarea pe telefon: titlul e separat, deci nu se repetă în pagină (ca documentBody de pe site).
import { withMath } from './readable-math';

const titleKey = (value: string) => value.normalize('NFKC').replace(/[*_`#]/g, '').toLocaleLowerCase('ro').replace(/[\s.,:;!?()"„”'–—-]+/g, '');

export function documentText(content: string, title: string) {
  const lines = content.replace(/^﻿/, '').replace(/\r\n/g, '\n').split('\n');
  let first = true;
  while (lines.length) {
    const line = lines[0].trim();
    if (!line) {
      lines.shift();
      continue;
    }
    if (!(first && /^#\s+/.test(line)) && titleKey(line) !== titleKey(title)) break;
    lines.shift();
    if (/^\s*(?:=+|-{3,})\s*$/.test(lines[0] ?? '')) lines.shift();
    first = false;
  }
  return lines.join('\n').trim();
}

/** Primele rânduri ale documentului, fără semne de formatare și cu formulele lizibile, pentru pagina mică din conversație. */
export function documentPreview(content: string, title: string) {
  return withMath(documentText(content, title))
    .replace(/\$\$?|\\[()[\]]/g, '')
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/[*_`|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
}
