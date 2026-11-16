import type {GeneratedDocument} from './api-types';
import {MAX_LATEX_LENGTH,previewLatex} from './latex-preview-text';

export const MAX_SECTION_CHARS = 8000;
export const MAX_REVISION_INSTRUCTION = 1000;
export type SectionFormat = 'markdown' | 'latex';
export type RevisionInput = {format: SectionFormat; fragment: string; instruction: string};
export type DocumentSection = {id: string; label: string; start: number; end: number; fragment: string; format: SectionFormat};

/** Validate editable TeX boundaries without interpreting executable commands. */
export function balancedLatexFragment(source: string): boolean {
  const clean = source.replace(/(?<!\\)%[^\n]*/g,'');
  const stack: string[] = [];
  let braces = 0;
  for(const token of clean.matchAll(/\\(begin|end)\s*\{([a-zA-Z*]+)\}|\\[{}\\]|[{}]/g)){
    if(token[1] === 'begin') stack.push(token[2]);
    else if(token[1] === 'end') {if(stack.pop() !== token[2]) return false;}
    else if(token[0] === '{') braces++;
    else if(token[0] === '}' && --braces < 0) return false;
  }
  return braces === 0 && stack.length === 0;
}

export function sectionPreview(text: string, format: SectionFormat): string {
  return format === 'markdown' ? text : previewLatex(text).content || text;
}

function lineFence(line: string, current?: string): string | undefined {
  const match = /^[ \t]*(`{3,}|~{3,})(.*)$/.exec(line);
  if (!match) return current;
  if (!current) return match[1];
  return match[1][0] === current[0] && match[1].length >= current.length && !match[2].trim() ? undefined : current;
}

export function documentSections(document: GeneratedDocument): DocumentSection[] {
  const format = document.latex === undefined ? 'markdown' : 'latex';
  const source = document.latex ?? document.content;
  let start = 0, end = source.length;
  const headings: {start: number; label: string}[] = [];
  const protectedRanges: {start: number; end: number}[] = [];
  if (format === 'latex') {
    const body = /\\begin\s*\{document\}/.exec(source);
    const close = source.search(/\\end\s*\{document\}/);
    if (!body || close <= body.index) return [];
    start = body.index + body[0].length;
    end = close;
    const title = /^[ \t\r\n]*\\maketitle[ \t]*(?:\r?\n|$)/.exec(source.slice(start, end));
    if (title) start += title[0].length;
    const bodyText = source.slice(start, end);
    for (const note of bodyText.matchAll(/\\begin\s*\{profplussources\}[\s\S]*?(?:\\end\s*\{profplussources\}|$)/g)) {
      protectedRanges.push({start: start+note.index, end: start+note.index+note[0].length});
    }
    for (const heading of bodyText.matchAll(/^[ \t]*(?:\\(?:section|subsection|subsubsection|sect|sectiune)\*?\s*\{([^{}\n]+)\}|(\d{1,2})[.)]\s+\S)/gm)) {
      const offset = start + heading.index;
      if (!protectedRanges.some(range=>offset>=range.start&&offset<range.end)) {
        headings.push({start: offset, label: heading[1] ?? 'Exercițiul '+heading[2]});
      }
    }
  } else {
    let fenced: string | undefined, math = false;
    let references: {start:number; level:number} | undefined;
    for (const line of source.matchAll(/[^\n]*(?:\n|$)/g)) {
      const text = line[0].trim(), offset = line.index;
      const previousFence = fenced;
      fenced = lineFence(text, fenced);
      if (previousFence || fenced) continue;
      if (text === '$$') { math = !math; continue; }
      if (math) continue;
      const heading = /^(#{2,6})\s+(.+)$/.exec(text);
      if (/^#\s+/.test(text) && offset === 0) start = line[0].length;
      if (references && (!heading || heading[1].length > references.level)) continue;
      if (references) {
        protectedRanges.push({start:references.start,end:offset});
        references = undefined;
      }
      if (heading && /^(?:Referințe(?: pentru exerciții)?|Bibliografie|Surse(?: consultate)?)\s*:?\s*#*$/i.test(heading[2])) {
        references = {start:offset,level:heading[1].length};
        continue;
      }
      const exercise = /^(?:\*\*)?(\d{1,2})[.)](?:\*\*)?\s+\S/.exec(line[0]);
      if (heading || exercise) headings.push({start: offset, label: heading?.[2] ?? 'Exercițiul '+exercise?.[1]});
    }
    if (references) protectedRanges.push({start:references.start,end});
  }
  if (headings[0]?.start !== start) headings.unshift({start, label: headings.length ? 'Introducere' : 'Textul documentului'});
  return headings.flatMap((heading, index) => {
    const next = headings[index+1]?.start ?? end;
    const protectedStart = protectedRanges.find(range=>range.start>=heading.start&&range.start<next)?.start;
    const raw = source.slice(heading.start, protectedStart ?? next);
    const fragment = raw.trim();
    if (!fragment || fragment.length > MAX_SECTION_CHARS || format === 'latex' && !balancedLatexFragment(fragment)) return [];
    const rangeStart = heading.start + raw.indexOf(fragment);
    return [{id: String(rangeStart), label: heading.label.slice(0,100), start: rangeStart, end: rangeStart + fragment.length, fragment, format}];
  });
}

export function applySectionRevision(document: GeneratedDocument, section: DocumentSection, draft: string): GeneratedDocument {
  const source = document.latex ?? document.content;
  if ((document.latex === undefined) !== (section.format === 'markdown') ||
      source.slice(section.start, section.end) !== section.fragment) {
    throw new Error('Documentul s-a schimbat. Alege din nou secțiunea.');
  }
  if (section.format === 'latex') {
    if (!balancedLatexFragment(draft) || /(?<!\\)%[^\n]*$/.test(draft)) throw new Error('Propunerea conține o secțiune LaTeX incompletă.');
  } else if (draft.split('\n').reduce<string|undefined>((fence,line)=>lineFence(line.trim(),fence),undefined)) {
    throw new Error('Propunerea conține un bloc Markdown neînchis.');
  }
  const result = source.slice(0, section.start) + draft + source.slice(section.end);
  const content = section.format === 'latex' ? previewLatex(result).content : result;
  if (!content.trim() || content.length > 20000 || section.format === 'latex' && result.length > MAX_LATEX_LENGTH) {
    throw new Error('Documentul revizuit depășește limita sau nu are conținut.');
  }
  return section.format === 'latex' ? {...document,latex:result,content} : {...document,content};
}
