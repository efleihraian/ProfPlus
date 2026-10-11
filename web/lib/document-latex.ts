import type {GeneratedDocument} from './generated-document';
import type {Source} from './rag';
import {blocks} from './document-export';
import {mathParts} from './math-format';
export const MAX_LATEX_LENGTH=60000;
export function escapeLatex(value:string):string{return value.replace(/[\\{}%&#_$~^]/g,c=>({'\\':'\\textbackslash{}','~':'\\textasciitilde{}','^':'\\textasciicircum{}'}[c]||'\\'+c));}
function inline(value:string):string{
 return mathParts(value).map(p=>p.math?(p.display?'\\['+p.text+'\\]':'$'+p.text+'$'):p.text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]*\))/g).map(t=>{
  if(t.startsWith('**'))return '\\textbf{'+escapeLatex(t.slice(2,-2))+'}';
  if(t.startsWith('*'))return '\\emph{'+escapeLatex(t.slice(1,-1))+'}';
  if(t.startsWith('`'))return '\\texttt{'+escapeLatex(t.slice(1,-1))+'}';
  const link=/^\[([^\]]+)\]\(([^)]*)\)$/.exec(t);return escapeLatex(link?link[1]+' ('+link[2]+')':t);
 }).join('')).join('');
}
function body(content:string):string{return blocks(content).map(b=>{
 if(b.type==='break')return '\\newpage';
 if(b.type==='heading')return '\\'+(b.level===1?'section':b.level===2?'subsection':'subsubsection')+'*{'+inline(b.text)+'}';
 if(b.type==='table'){const n=Math.max(...b.rows.map(r=>r.length));return '\\begin{tabularx}{\\textwidth}{|'+Array(n).fill('X').join('|')+'|}\n\\hline\n'+b.rows.map((r,i)=>Array.from({length:n},(_,j)=>i===0?'\\textbf{'+inline(r[j]||'')+'}':inline(r[j]||'')).join(' & ')+' \\\\ \\hline').join('\n')+'\n\\end{tabularx}';}
 return b.text.startsWith('• ')?'\\begin{itemize}\n\\item '+inline(b.text.slice(2))+'\n\\end{itemize}':inline(b.text);
}).join('\n\n');}
/** Attribution is a managed environment, so hiding it never rewrites custom TeX. */
export function hideLatexProvenance(source:string):string{return source.replace(/\\begin\{profplussources\}[\s\S]*?\\end\{profplussources\}/g,'').replace(/\\ProfPlusCitation\{\d+\}/g,'');}
export function documentLatex(doc:GeneratedDocument,sources:Source[]=[]):string{
 if(doc.latex!==undefined)return doc.latex;
 const ids=new Set(sources.map(s=>s.id));
 for(const line of doc.content.split('\n'))if(/Proveniență|Sursă|Referință conceptuală/.test(line))for(const m of line.matchAll(/\[(\d+)\]/g))ids.add(Number(m[1]));
 const segments:{hidden:boolean;text:string}[]=[];let referenceLevel:number|null=null;
 for(const line of doc.content.split('\n')){
  const heading=/^\s*(#{1,6})\s+(.+)$/.exec(line);
  if(heading&&/^(?:Referințe(?: pentru exerciții)?|Surse(?: consultate)?|Bibliografie)\s*$/i.test(heading[2]))referenceLevel=heading[1].length;
  else if(heading&&referenceLevel!==null&&heading[1].length<=referenceLevel)referenceLevel=null;
  const hidden=referenceLevel!==null||/^\s*(?:>\s*)?(?:[-*+]\s+)?(?:\*\*|\*)?(?:Proveniență|Sursă|Referință conceptuală)(?:\*\*|\*)?\s*:/i.test(line);
  const last=segments.at(-1);if(last&&last.hidden===hidden)last.text+='\n'+line;else segments.push({hidden,text:line});
 }
 const rendered=segments.map(part=>{let value=body(part.text);value=value.split(/(\$\$[\s\S]*?\$\$|\$[^\n$]+\$|\\\[[\s\S]*?\\\])/g).map((t,i)=>i%2?t:t.replace(/\[(\d+)\]/g,(marker,id)=>ids.has(Number(id))?'\\ProfPlusCitation{'+id+'}':marker)).join('');return part.hidden?'\\begin{profplussources}\n'+value+'\n\\end{profplussources}':value;}).join('\n\n');
 const notes=sources.length?body('## Surse consultate\n'+sources.map(s=>`[${s.id}] ${s.title}\n${s.url}`).join('\n\n')):'';
 return String.raw`\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[romanian]{babel}
\usepackage{amsmath,amssymb,tabularx}
\usepackage[margin=2cm]{geometry}
\newcommand{\ProfPlusCitation}[1]{[#1]}
\newenvironment{profplussources}{\par\small}{\par}
\setlength{\parindent}{0pt}
\setlength{\parskip}{8pt}
\title{`+escapeLatex(doc.title)+String.raw`}
\author{}
\date{}
\begin{document}
\maketitle
`+rendered+(notes?'\n\n\\begin{profplussources}\n'+notes+'\n\\end{profplussources}':'')+'\n\\end{document}\n';
}
export type LatexPreview={content:string;title?:string;warnings:string[]};
/** Bounded reader for the educational subset. Never executes TeX, HTML or I/O. */
export function previewLatex(source:string):LatexPreview{
 if(source.length>MAX_LATEX_LENGTH)return {content:'',warnings:['Sursa depășește limita de 60.000 de caractere.']};
 const warnings=new Set<string>();let title:string|undefined;
 const uncomment=(text:string)=>text.replace(/(?<!\\)%[^\n]*/g,'');
 const full=uncomment(source),start=full.indexOf('\\begin{document}'),end=full.lastIndexOf('\\end{document}');
 if(start<0||end<start)warnings.add('Lipsesc delimitatorii documentului.');
 let text=start>=0?full.slice(start+16,end>start?end:undefined):full;
 const argument=(s:string,pos:number):{value:string;end:number}|null=>{while(/\s/.test(s[pos]||'')&&pos<s.length)pos++;if(s[pos]!=='{')return null;let level=1,i=pos+1;for(;i<s.length;i++){if(s[i]==='\\'){i++;continue;}if(s[i]==='{')level++;if(s[i]==='}'&&!--level)return {value:s.slice(pos+1,i),end:i+1};}warnings.add('O acoladă nu este închisă.');return {value:s.slice(pos+1),end:s.length};};
 const parse=(s:string,depth=0):string=>{
  if(depth>24){warnings.add('Structura este prea adâncă pentru previzualizare.');return '';}
  let out='';const list:{type:string;count:number}[]=[];
  for(let i=0;i<s.length;){
   if(s[i]==='$'){const display=s[i+1]==='$',delimiter=display?'$$':'$',j=s.indexOf(delimiter,i+delimiter.length);if(j>=0){out+=s.slice(i,j+delimiter.length);i=j+delimiter.length;continue;}warnings.add('O formulă nu are delimitator de închidere.');}
   if(s[i]!=='\\'){out+=s[i++];continue;}
   if(s.startsWith('\\[',i)||s.startsWith('\\(',i)){const display=s[i+1]==='[',close=display?'\\]':'\\)',j=s.indexOf(close,i+2);if(j>=0){out+=(display?'\n$$\n':'$')+s.slice(i+2,j)+(display?'\n$$\n':'$');i=j+2;continue;}}
   const m=/^\\([a-zA-Z]+\*?|.)/.exec(s.slice(i));if(!m){i++;continue;}const command=m[1];i+=m[0].length;
   if(['%','&','#','_','$','{','}'].includes(command)){out+=command;continue;}
   if(command==='\\'){out+='\n';continue;}
   if(command==='textbackslash'){out+='\\';const a=argument(s,i);if(a)i=a.end;continue;}
   if(command==='textasciitilde'||command==='textasciicircum'){out+=command==='textasciitilde'?'~':'^';const a=argument(s,i);if(a)i=a.end;continue;}
   if(['maketitle','hline','centering','small','normalsize'].includes(command))continue;
   if(['newpage','clearpage','par'].includes(command)){out+='\n\n';continue;}
   if(command==='item'){const current=list.at(-1);let label='';if(s[i]==='['){const j=s.indexOf(']',i);if(j>=0){label=s.slice(i+1,j);i=j+1;}}out+='\n'+(label?label+' ':current?.type==='enumerate'?++current.count+'. ':'- ');continue;}
   const a=argument(s,i);
   if(command==='ProfPlusCitation'&&a){out+='['+a.value+']';i=a.end;continue;}
   if(['begin','end'].includes(command)&&a){i=a.end;const env=a.value;
    if(command==='begin'&&['equation','equation*','align','align*','gather','gather*'].includes(env)){const close='\\end{'+env+'}',j=s.indexOf(close,i);if(j>=0){const tex=s.slice(i,j);out+='\n$$\n'+(env.startsWith('align')?'\\begin{aligned}'+tex+'\\end{aligned}':tex)+'\n$$\n';i=j+close.length;continue;}}
    if(command==='begin'&&['tabular','tabularx'].includes(env)){let args=argument(s,i);if(args)i=args.end;if(env==='tabularx'){args=argument(s,i);if(args)i=args.end;}const close='\\end{'+env+'}',j=s.indexOf(close,i);if(j>=0){const rows=s.slice(i,j).replace(/\\hline/g,'').split('\\\\').map(r=>r.trim()).filter(Boolean).map(r=>r.split(/(?<!\\)&/).map(c=>parse(c,depth+1).trim().replace(/\|/g,'/')));out+='\n\n'+rows.map((r,k)=>'| '+r.join(' | ')+' |'+(k===0?'\n| '+r.map(()=>'---').join(' | ')+' |':'')).join('\n')+'\n\n';i=j+close.length;continue;}}
    if(['itemize','enumerate'].includes(env)){if(command==='begin')list.push({type:env,count:0});else list.pop();}
    else if(!['profplussources','document','center','flushleft','quote'].includes(env))warnings.add('Mediu neprevizualizat: '+env.slice(0,40));
    out+='\n\n';continue;
   }
   if(a&&['textbf','emph','textit','texttt','section','section*','subsection','subsection*','subsubsection','subsubsection*','title'].includes(command)){i=a.end;const value=parse(a.value,depth+1);if(command==='title'){title=value;}else if(command.startsWith('section'))out+='\n\n# '+value+'\n\n';else if(command.startsWith('subsection'))out+='\n\n## '+value+'\n\n';else if(command.startsWith('subsubsection'))out+='\n\n### '+value+'\n\n';else out+=(command==='textbf'?'**':command==='texttt'?'`':'*')+value+(command==='textbf'?'**':command==='texttt'?'`':'*');continue;}
   warnings.add('Comandă neprevizualizată: \\'+command);out+='`\\'+command+'`';
  }
  return out.replace(/\n{3,}/g,'\n\n').trim();
 };
 const t=/\\title\s*\{/.exec(full);if(t){const a=argument(full,t.index+6);if(a)title=parse(a.value);}
 text=parse(text);
 return {content:text,title,warnings:[...warnings].slice(0,8)};
}
