import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const uri=s=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const math=uri(await readFile('lib/math-format.ts','utf8'));
let formulaSource=await readFile('lib/math-export.ts','utf8');
formulaSource=formulaSource.replace(/from '(mathjax-full[^']+)'/g,(_,p)=>'from '+JSON.stringify(pathToFileURL(require.resolve(p)).href)).replace(/import '(mathjax-full[^']+)'/g,(_,p)=>'import '+JSON.stringify(pathToFileURL(require.resolve(p)).href));
// Node has no canvas. Rasterize the exact production SVG at the same 3x resolution.
formulaSource=formulaSource.slice(0,formulaSource.indexOf('export async function formulaImage'))+`
import sharp from ${JSON.stringify(pathToFileURL(require.resolve('sharp')).href)};
export async function formulaImage(tex,size=15){const f=formulaSvg(tex,size);return {...f,data:new Uint8Array(await sharp(Buffer.from(f.svg)).resize(Math.ceil(f.width*3),Math.ceil(f.height*3)).png().toBuffer())};}`;
const formula=uri(formulaSource);
function moduleUrl(source){return uri(source.replaceAll("'./math-format'",JSON.stringify(math)).replaceAll("'./math-export'",JSON.stringify(formula)).replaceAll("'pdf-lib'",JSON.stringify(pathToFileURL(require.resolve('pdf-lib')).href)).replaceAll("'@pdf-lib/fontkit'",JSON.stringify(pathToFileURL(require.resolve('@pdf-lib/fontkit')).href)).replaceAll("'docx'",JSON.stringify(pathToFileURL(require.resolve('docx')).href)));}
const exporter=await import(moduleUrl(await readFile('lib/document-export.ts','utf8')));
for(const divider of ['---','***','___'])assert.equal(exporter.blocks(divider)[0].type,'separator');
assert.equal(exporter.blocks('<!-- pagebreak -->')[0].type,'break');
assert.equal(exporter.blocks('\\newpage')[0].type,'break');
assert.equal(exporter.blocks('**PARTEA I - CALCULE**')[0].type,'heading');
const markdown=await readFile('tests/fixtures/export-test.md','utf8');
const doc={title:'TEST DE EVALUARE - MATEMATICĂ',content:markdown};
assert.equal(exporter.exportBlocks(doc).filter(b=>b.type==='heading'&&b.level===1).length,1);
assert.equal(exporter.exportBlocks({...doc,title:'Titlu editat'})[0].text,'Titlu editat');
const fonts=await Promise.all(['Regular','Bold'].map(n=>readFile('public/fonts/NotoSans-'+n+'.ttf')));
const output=process.env.EXPORT_LAYOUT_OUTPUT||tmpdir()+'/profplus-export-layout-'+process.pid;await mkdir(output,{recursive:true});
async function save(name,value){const buffer=Buffer.from(await value.arrayBuffer());await writeFile(output+'/'+name,buffer);return buffer;}
const pdf=await save('test-layout.pdf',await exporter.exportPdf(doc,[],...fonts));
const {PDFDocument}=await import('pdf-lib');
const pages=(await PDFDocument.load(pdf)).getPageCount();assert.equal(pages,2,'Representative test must flow into two A4 pages, not one per section.');
const short=await exporter.exportPdf({title:'Test scurt',content:Array.from({length:7},(_,i)=>'## Secțiunea '+(i+1)+'\nUn exercițiu scurt.').join('\n---\n')},[],...fonts);
assert.equal((await PDFDocument.load(await short.arrayBuffer())).getPageCount(),1,'Seven short sections must fit on one page.');
const explicit=await exporter.exportPdf({title:'Test',content:'Prima parte.\n<!-- pagebreak -->\nA doua parte.'},[],...fonts);
assert.equal((await PDFDocument.load(await explicit.arrayBuffer())).getPageCount(),2,'Explicit page breaks must remain available.');
await save('test-layout.docx',await exporter.exportDocx(doc));
const xml=execFileSync('unzip',['-p',output+'/test-layout.docx','word/document.xml'],{encoding:'utf8'});
assert.doesNotMatch(xml,/<w:pageBreakBefore/);assert.match(xml,/<w:keepNext/);assert.match(xml,/w:val="center"/);
await save('explicit-break.docx',await exporter.exportDocx({title:'Test',content:'Prima parte.\n<!-- pagebreak -->\nA doua parte.'}));
assert.match(execFileSync('unzip',['-p',output+'/explicit-break.docx','word/document.xml'],{encoding:'utf8'}),/<w:pageBreakBefore/);
// Reproduce the original seven-page failure against the previous exporter, on the same content.
if(process.env.EXPORT_LAYOUT_COMPARE==='1'){
 const before=execFileSync('git',['show','origin/main:web/lib/document-export.ts'],{encoding:'utf8'});
 const previous=await import(moduleUrl(before));const original=await save('before-layout.pdf',await previous.exportPdf(doc,[],...fonts));
 assert.equal((await PDFDocument.load(original)).getPageCount(),7);
}
console.log('PASS: separators flow naturally, representative PDF has two pages, title not duplicated, headings kept with next and explicit PDF/DOCX page breaks preserved.');
