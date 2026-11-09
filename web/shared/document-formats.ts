// P-168 — formatele de export oferite depind de tipul documentului generat, identic pe site și în aplicații.
// O prezentare (slide-uri) se exportă ca PowerPoint, PDF și Word; un document text (test, fișă, planificare, proiect,
// barem, explicație) ca PDF, Word și LaTeX, fără PowerPoint. Detectarea este locală și nu schimbă documentul salvat.
export type ExportFormat='pptx'|'pdf'|'docx'|'tex';
export type DocumentShape='presentation'|'text';
const fold=(s:string)=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const PRESENTATION_TITLE=/\b(?:prezentar\w*|slide\w*|powerpoint|power point|diapozitiv\w*)\b/;
/** Prezentare = titlul o numește, are note pentru profesor pe slide-uri sau are structura de slide-uri
 * (cel puțin 4 secțiuni «## …» formate aproape numai din puncte scurte, fără exerciții numerotate). */
export function documentShape(title:string,content:string):DocumentShape{
 if(PRESENTATION_TITLE.test(fold(title)))return 'presentation';
 const text=content.replace(/^﻿/,'');
 if(/^\s*note pentru profesor\s*:/im.test(text))return 'presentation';
 const sections=text.split(/^##\s+/m).slice(1);
 if(sections.length<4)return 'text';
 let bullets=0,other=0,numbered=0;
 for(const section of sections){
  for(const line of section.split('\n').slice(1)){
   const l=line.trim();if(!l||/^\$\$|^\|/.test(l))continue;
   if(/^[-*•]\s+/.test(l)){bullets++;if(l.split(/\s+/).length>40)other++;}
   else if(/^\d{1,2}[.)]\s+/.test(l))numbered++;
   else other++;
  }
 }
 return bullets>=sections.length*2&&numbered===0&&other<=bullets/3?'presentation':'text';
}
/** Ordinea este și ordinea butoanelor: formatul principal primul. */
export function exportFormats(shape:DocumentShape):ExportFormat[]{
 return shape==='presentation'?['pptx','pdf','docx']:['pdf','docx','tex'];
}
export const FORMAT_LABELS:Record<ExportFormat,string>={pptx:'PowerPoint (.pptx)',pdf:'PDF',docx:'Word (.docx)',tex:'LaTeX (.tex)'};
/** Formatele pe care aplicația mobilă le poate cere paginii de export (LaTeX rămâne pe site, în editor). */
export function appExportFormats(shape:DocumentShape):Exclude<ExportFormat,'tex'>[]{
 return exportFormats(shape).filter((f):f is Exclude<ExportFormat,'tex'>=>f!=='tex');
}
