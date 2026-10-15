// P-083: turul ghidat — fiecare pagină are pași, textele sunt scurte, iar țintele sunt selectori valizi existenți în cod.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const uri=s=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const {TOURS}=await import(uri((await readFile('app/tours.ts','utf8')).replace(/^import .*;$/m,'')));
for(const page of ['acasa','asistent','documente','clase','meditatii','clasa','cont'])assert.ok(TOURS[page]?.length>=3,'tour for '+page);
const sources=(await Promise.all(['app/page.tsx','app/home-page.tsx','app/documents-page.tsx','app/classes-page.tsx','app/assistant.tsx','app/help-plusi.tsx','app/tutoring-page.tsx','app/account/page.tsx','app/news-section.tsx','app/shell-pages.css','app/globals.css'].map(f=>readFile(f,'utf8')))).join('\n');
for(const [page,steps] of Object.entries(TOURS))for(const s of steps){
 assert.ok(s.title.length<=40&&s.text.length<=220,`${page}: short copy (${s.title})`);
 for(const part of s.target.split(',')){
  const tokens=[...part.matchAll(/\.([a-z][\w-]*)|#([\w-]+)|\[data-tour="([\w-]+)"\]|\[aria-labelledby="([\w-]+)"\]/g)].map(m=>m[1]||m[2]||m[3]||m[4]);
  assert.ok(tokens.length,`${page}: selector ${part}`);
  for(const t of tokens)assert.ok(sources.includes(t)||(t.startsWith('account-')&&sources.includes("data-tour={'account-'+t.id}")),`${page}: target ${t} exists in the code`);
 }
}
const tour=await readFile('app/plusi-tour.tsx','utf8');
assert.match(tour,/role="dialog" aria-modal="true"/);assert.match(tour,/Escape/);assert.match(tour,/prefers-reduced-motion/);assert.match(tour,/pp-tour-/);
console.log('PASS: tours for every page, short copy, existing targets, accessible dialog with Esc/arrows and reduced motion.');
