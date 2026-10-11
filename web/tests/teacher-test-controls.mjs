import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const uri=s=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const selection=await import(uri((await readFile('lib/source-selection.ts','utf8')).replace(/^import[^;]+;/,'const matchesTeaching=()=>true;')));
const all={mode:'automatic',manualIds:['a','b'],documentIds:['mine'],priorityManualIds:['b'],priorityDocumentIds:['mine']};
assert.deepEqual(selection.savedSelection(all),{...all,manualIds:[],documentIds:[]});
assert.deepEqual(selection.withPriorities({mode:'automatic',manualIds:['b'],documentIds:[]},all).priorityManualIds,['b']);
assert.deepEqual(selection.withPriorities({manualIds:['a'],documentIds:[]},all).priorityDocumentIds,[]);
assert.equal(selection.validSelection(all),true);
for(const bad of [{...all,mode:'manual',priorityManualIds:['unselected']},{...all,mode:'manual',priorityDocumentIds:['other-user']},{...all,priorityManualIds:'b'},{...all,priorityManualIds:Array(11).fill('b')},{...all,priorityDocumentIds:[{}]}])assert.equal(selection.validSelection(bad),false);
const {withoutProvenance}=await import(uri(await readFile('lib/export-provenance.ts','utf8')));
const original='# Test\n\n1. Calculați $a^{m} \\cdot b^m$. [1]\n**Proveniență:** Adaptat / inspirat din Manual [1].\n\n2. Identificați mulțimea $[1]$.\nProveniență: Exercițiu original generat de ProfPlus\nReferință conceptuală: Manual [1]\n\n## Referințe pentru exerciții\n[1] Manual, p. 12\n\n## Barem\n1. Corect.';
const clean=withoutProvenance(original,[1]);
assert.match(clean,/Calculați \$a\^\{m\} \\cdot b\^m\$/);assert.match(clean,/mulțimea \$\[1\]\$/);assert.match(clean,/## Barem/);assert.doesNotMatch(clean,/Proveniență|Manual|Referință conceptuală|Referințe pentru/);assert.equal(withoutProvenance(clean,[1]),clean);assert.match(original,/Proveniență/);
const mathUri=uri(await readFile('lib/math-format.ts','utf8')),{normalizeMath,mathParts}=await import(mathUri);
const legacy='- b) ( a^m \\cdot b^m = (a \\cdot b)^m )';
assert.match(normalizeMath(legacy),/\$a\^m \\cdot b\^m = \(a \\cdot b\)\^m\$/);
assert.equal(mathParts('Calculați \\(x^2\\) și $\\frac{1}{2}$.').filter(p=>p.math).length,2);
assert.equal(normalizeMath('`\\(code\\)` și (o explicație)'), '`\\(code\\)` și (o explicație)');
let exporter=await readFile('lib/math-export.ts','utf8');exporter=exporter.replace(/from '(mathjax-full[^']+)'/g,(_,p)=>'from '+JSON.stringify(pathToFileURL(process.cwd()+'/node_modules/'+p).href)).replace(/import '(mathjax-full[^']+)'/g,(_,p)=>'import '+JSON.stringify(pathToFileURL(process.cwd()+'/node_modules/'+p).href));
const {formulaSvg}=await import(uri(exporter));for(const formula of ['a^m \\cdot b^m = (a \\cdot b)^m','\\frac{1}{2}+\\sqrt{9}','\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}']){const result=formulaSvg(formula);assert.match(result.svg,/<path/);assert.ok(result.width>0&&result.height>0);assert.doesNotMatch(result.svg,/<(?:script|image|foreignObject)/);}
assert.throws(()=>formulaSvg('\\href{https://example.org}{x}'));assert.throws(()=>formulaSvg('x'.repeat(4001)));
console.log('Priority persistence/subsets, clean student copy, legacy math delimiters and export formula paths passed.');

const blockSource=(await readFile('lib/document-export.ts','utf8')).replace("'./math-format'",JSON.stringify(mathUri));const {blocks}=await import(uri(blockSource));assert.match(blocks(legacy)[0].text,/^b\) \$/);assert.doesNotMatch(blocks(legacy)[0].text,/•/);assert.equal(blocks('$$\n\\frac{1}{2}\n$$')[0].text,'$$\\frac{1}{2}$$');
console.log('Exports keep option letters without duplicate bullets and preserve display formulas.');
