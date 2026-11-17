export type ExportFormat='pptx'|'pdf'|'docx'|'tex';
export type DocumentShape='presentation'|'text';
export type DocumentKind='presentation'|'test'|'worksheet'|'rubric'|'theory'|'planning'|'unit'|'lesson'|'fun'|'other';
const fold=(s:string)=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const PRESENTATION_TITLE=/\b(?:prezentar\w*|slide\w*|powerpoint|power point|diapozitiv\w*)\b/;
const TEACHER_NOTES=/^\s*note pentru profesor\s*:/gim;
const TITLE_KINDS:[DocumentKind,RegExp][]=[
 ['planning',/\bplanificar\w*/],
 ['unit',/\bunitat\w* de invatare|\bproiectar\w* (?:a )?unitat/],
 ['lesson',/\b(?:proiect|plan)\w* (?:didactic|de lectie)\b/],
 ['rubric',/^\s*barem\w*\b/],
 ['fun',/\bfun prof\b|\bjoc\w*\b|\bactivitat\w* interactiv/],
 ['worksheet',/\bfis\w* (?:de )?(?:lucru|recapitulare|exercitii|aplicatii)\b/],
 ['test',/\btest\w*\b|\bevaluar\w*\b|\blucrare de control\b|\bteza\b/],
 ['theory',/\bfis\w* de teorie\b|\bbreviar\b|\bnotiuni teoretice\b|\bteorie\b/],
];
function slideStructure(content:string){
 const sections=content.split(/^##\s+/m).slice(1);
 if(sections.length<4)return false;
 let bullets=0,other=0,numbered=0;
 for(const section of sections){
  for(const line of section.split('\n').slice(1)){
   const l=line.trim();if(!l||/^\$\$|^\||^note pentru profesor\s*:/i.test(l))continue;
   if(/^[-*•]\s+/.test(l)){bullets++;if(l.split(/\s+/).length>40)other++;}
   else if(/^\d{1,2}[.)]\s+/.test(l))numbered++;
   else other++;
  }
 }
 return bullets>=sections.length*2&&numbered===0&&other<=bullets/3;
}
export function documentKind(title:string,content:string):DocumentKind{
 const text=content.replace(/^﻿/,''),heading=/^\s*#\s+(.+)$/m.exec(text)?.[1]||'';
 const named=fold(title+'\n'+heading);
 if(PRESENTATION_TITLE.test(named))return 'presentation';
 const notes=text.match(TEACHER_NOTES)?.length||0;
 if(notes>=2&&text.split(/^##\s+/m).length>=4)return 'presentation';
 for(const [kind,pattern] of TITLE_KINDS)if(pattern.test(named))return kind;
 return notes||slideStructure(text)?'presentation':'other';
}
export function documentShape(title:string,content:string):DocumentShape{
 return documentKind(title,content)==='presentation'?'presentation':'text';
}
const FORMATS:Record<DocumentKind,ExportFormat[]>={
 presentation:['pptx','pdf','docx'],
 test:['pdf','docx','tex'],worksheet:['pdf','docx','tex'],rubric:['pdf','docx','tex'],theory:['pdf','docx','tex'],other:['pdf','docx','tex'],
 lesson:['docx','pdf','tex'],
 planning:['docx','pdf'],unit:['docx','pdf'],
 fun:['pdf','docx'],
};
export function exportFormats(kind:DocumentKind):ExportFormat[]{return [...FORMATS[kind]];}
export const FORMAT_LABELS:Record<ExportFormat,string>={pptx:'PowerPoint (.pptx)',pdf:'PDF',docx:'Word (.docx)',tex:'LaTeX (.tex)'};
const SHORT:Record<ExportFormat,string>={pptx:'PowerPoint',pdf:'PDF',docx:'Word',tex:'.tex'};
export function exportSummary(kind:DocumentKind):string{return 'Export '+FORMATS[kind].map(f=>SHORT[f]).join(' / ');}
export function appExportFormats(kind:DocumentKind):Exclude<ExportFormat,'tex'>[]{
 return exportFormats(kind).filter((f):f is Exclude<ExportFormat,'tex'>=>f!=='tex');
}
export function offersPresentation(kind:DocumentKind):boolean{
 return kind==='lesson'||kind==='theory'||kind==='unit'||kind==='other';
}
